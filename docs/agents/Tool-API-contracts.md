# 工具 API 合同（无代码草案）

目的：为入驻向导智能体的关键只读工具定义清晰的“合同”，便于实现与评审。每个工具 10–12 条要点，涵盖用途、输入、输出、错误、时限与安全。

---

## 1) stripe_get_account_status
- 用途：只读获取 Stripe 连接账户的关键状态（出款/收款能力与验证要求）。
- 输入：`stripe_account_id: string`（必填，形如 acct_ 开头）；`request_id?: string`（可选，链路追踪）。
- 前置条件：调用方已根据用户会话识别到对应商户；具备最小只读权限与环境变量。
- 行为：查询账户 `payouts_enabled/charges_enabled` 与 `requirements`（currently_due/past_due/eventually_due）。
- 输出：`{ success: boolean, payouts_enabled: boolean, charges_enabled: boolean, requirements: {...}, observed_at: ISO8601 }`。
- 错误：`{ success:false, error:'not_found'|'unauthorized'|'rate_limited'|'upstream_error', retry_after_ms?: number }`。
- 时限：超时阈值建议 2–4s；超时返回 upstream_error 并附建议重试时间。
- 重试：指数退避（例如 200ms 起，最大 3 次）；rate_limited 时遵循返回头或 retry_after_ms。
- 幂等：幂等读操作；允许短期缓存（≤30s）以降低抖动与成本。
- 观测：记录 account_id、延迟、错误码；不记录敏感字段值。
- 安全：最小权限密钥；严禁写操作；遵循审计与密钥轮换。

## 2) supabase_get_merchant_row
- 用途：从平台数据库只读查询商户记录与 Stripe 关联，判断是否已入驻。
- 输入：`merchant_id?: string` | `user_session_id?: string`（至少一个）；`request_id?: string`。
- 行为：依据传入身份查询商户表；返回 `stripe_account_id`、`status_summary`、基础档案字段。
- 输出：`{ success:true, merchant_id, stripe_account_id?: string, status_summary?: object, found:boolean, observed_at }`。
- 错误：`{ success:false, error:'not_found'|'unauthorized'|'db_error' }`。
- 时限：超时阈值 1–2s；失败建议回退到仅文档建议或让用户从“开始入驻”。
- 幂等：幂等读；可结合 ETag/版本号降低不必要查询。
- 观测：记录 merchant_id/user_session_id 的哈希、SQL 延迟、rows。
- 安全：只读服务账号；字段级脱敏（不返回 PII）。

## 3) connect_generate_relink_url
- 用途：为已有 `stripe_account_id` 生成新的 Account Link（托管入驻继续/补充）。
- 输入：`stripe_account_id: string`、`return_url: string`、`refresh_url: string`、`locale?: string`、`request_id?: string`。
- 行为：调用 Stripe 生成 `type=account_onboarding` 的链接；单次使用、短时效。
- 输出：`{ success:true, url:string, expires_at: ISO8601, account_link_type:'account_onboarding' }`。
- 错误：`{ success:false, error:'invalid_account'|'upstream_error'|'rate_limited' }`。
- 时限：超时阈值 2–4s；失败时提示走 Express Dashboard 作为兜底。
- 重试：指数退避；避免连击生成（以避免浪费与风险）。
- 幂等：非严格幂等；若短时间重复请求需并发去重或复用最近一次结果。
- 观测：记录 account_id、expires_at、延迟；不记录完整链接。
- 安全：链接仅回传给用户会话端使用；不在日志中明文存储 URL。

## 4) express_dashboard_login_link
- 用途：生成 Stripe Express Dashboard 的一次性登录链接，让商户自助管理出款/资料。
- 输入：`stripe_account_id: string`、`return_to?: string`（登录后落点）、`request_id?: string`。
- 行为：调用 Stripe 登录链接 API；链接短时效、单次使用。
- 输出：`{ success:true, url:string, expires_at: ISO8601 }`。
- 错误：`{ success:false, error:'invalid_account'|'upstream_error'|'rate_limited' }`。
- 时限：超时阈值 2–4s；失败时建议稍后重试或走 Relink 继续入驻。
- 重试：指数退避；对 rate limit 遵循官方节流策略。
- 幂等：非严格幂等；短时内重复点击应触发新建而非复用旧链接。
- 观测：记录 account_id、expires_at、延迟；不记录 URL 明文。
- 安全：严禁代理/嵌入仪表盘页面；前端直接重定向到 Stripe 域名。

## 5) citation_helper
- 用途：为即将输出的关键结论挑选最相关的引用（内部 runbook 或 Stripe 官方文档）。
- 输入：`claim: string`（需校验的陈述）、`top_k?: number`（默认 3）、`request_id?: string`。
- 行为：基于混合检索（向量+关键词）与 rerank 返回最相关来源；偏向具体小节/锚点。
- 输出：`{ success:true, citations: [{title, url, section?, confidence}], grounded:boolean }`。
- 错误：`{ success:false, error:'no_evidence'|'search_error' }`。
- 时限：检索预算 ≤ 500ms（缓存命中可降至 ≤ 100ms）。
- 回退：若证据不足，`grounded=false` 并建议“拒答 + 引导到 Express/Relink”。
- 观测：记录 doc_type 分布（internal/stripe）、置信度、时延。
- 安全：仅返回公开链接与仓库内路径；不暴露敏感内网地址。
