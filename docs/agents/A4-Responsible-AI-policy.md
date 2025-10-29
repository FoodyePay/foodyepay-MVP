# FoodyePay Responsible AI 政策卡（A4）

目标：确保面向用户的智能体“可靠 + 负责”。本卡适用于 Onboarding、Payouts、Rewards、Triage 等用户可见代理；系统级 ComplianceGuard 作为护栏前置于所有输出。

## 1) 范围与红线
- 允许：入驻/Relink/Return/Refresh/常见失败解答；只读核对 Stripe/Supabase；Express Dashboard 指引。
- 禁止：资金类写操作；在站内收集证件/银行卡/政府 ID；承诺超出 SLA 的处理时限；绕过平台风控与条款。
- 话术要求：每个关键结论需附引用（优先内部 docs/connect/*，其次 Stripe 官方）；证据不足即拒答 + 给替代路径（Express/Relink/联系客服）。

## 2) 数据分级与处理
- P0 敏感（支付/身份证件）：不得收集/存储；统一引导 Stripe 托管或 Express。
- P1 业务机密：仅在最小权限范围内只读；脱敏后可用于评估/故障排查。
- P2 内部一般：可索引用于 RAG；遵循 TTL 与版本管理。
- P3 外部公开：可索引与引用。
- 记忆：默认不持久化个体会话偏好；蒸馏记忆需用户同意（可查询/撤回/删除）。

## 3) Grounding 与引用
- 来源优先级：内部 docs/connect/* > Stripe 官方文档 > 我方法务/产品页面。
- TTL：内部 24h；Stripe 7 天。过期或置信度低时必须触发实时只读校验。
- 引用格式：简明可点，[来源 — 小节](URL)；拒答模板：说明缺证据并给可执行替代。

## 4) 工具安全合同（只读）
- 统一策略：超时 2–4s；指数退避最多 2 次；并发与 QPS 上限；短缓存 ≤30s；短效链接不落日志。
- 错误枚举：not_found/unauthorized/rate_limited/upstream_error；失败降级到“仅文档建议 + Express/Relink”。
- 审计：task_id、tool_name、参数哈希、状态、时延、错误码。

## 5) 合规护栏（ComplianceGuard）
- 触发：输出前必经护栏。
- 判定：allow/modify/block + reason + safer_alt（替代话术）。
- 命中规则：缺引用；越权/敏感词（打款、收证件、银行卡）；无证据推断；超范围承诺。

## 6) 指标门槛（Gates）
- Groundedness ≥ 0.9；Citation ≥ 0.85；Task Success ≥ 0.85；Hallucination ≤ 2%；p95 首 token ≤ 1.5s；自助解决率 ≥ 90%。

## 7) 事故与沟通
- P0（合规/资金）：暂停相关推荐并默认引导 Express；@合规与平台工程；发布公告与修复计划。
- P1（大面积慢/错）：临时降级 + 提高人审比例；每日通报。
- P2（小范围）：记录样例，纳入评估与周修复。

## 8) 变更与发布
- Agent Card 版本化；重大改动需灰度（配额/人群）；达标后全量；保留回滚路径。
