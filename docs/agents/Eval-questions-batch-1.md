# 入驻向导评估题（批次1，中文，12–15题）

说明：用于验证 RAG/Agentic 回路的准确性、引用、任务成功率与安全性。每题包含意图、用户原话、期望步骤、参考答案要点、期望引用、是否需要实时只读查询。

---

1) 意图：relink
- 用户原话：昨天的 Stripe 入驻链接今天打不开了，怎么办？
- 期望步骤：检索托管入驻/Account Link → 解释链接时效与单次使用 → 建议生成新链接继续
- 参考答案要点：给出“生成新链接/回到 Stripe 托管入驻”的行动；说明原因；附引用
- 引用：Stripe Hosted Onboarding + docs/connect/relink.md
- 实时查询：否

2) 意图：return
- 用户原话：我完成了入驻，跳回我们的网站后需要做什么？
- 期望步骤：说明 return 页的职责（幂等、写入/确认 stripe_account_id）→ 给出下一步导航（仪表盘/继续设置）
- 引用：docs/connect/return.md
- 实时查询：否

3) 意图：refresh
- 用户原话：我中途取消了入驻，现在要重新开始
- 期望步骤：解释 refresh 场景 → 触发 relink 生成新链接 → 引导继续
- 引用：docs/connect/refresh.md + Stripe Hosted Onboarding
- 实时查询：否

4) 意图：payouts
- 用户原话：为什么我还不能提现？
- 期望步骤：检索“所需验证资料/出款条件” → 只读查 Stripe 账户状态（payouts_enabled、requirements）→ 分支输出
- 引用：Stripe Required Verification + docs/connect/webhooks.md
- 实时查询：是

5) 意图：common_failure
- 用户原话：总提示上传证件失败怎么办？
- 期望步骤：说明我们不在站内收集证件 → 引导回 Stripe/Express → 给出常见原因与重试提示
- 引用：Stripe Onboarding/Verification + docs/connect/common-failures.md
- 实时查询：否

6) 意图：webhook
- 用户原话：资料提交了但系统还显示待审核，是不是坏了？
- 期望步骤：解释以 account.updated 为准 → 可短时轮询（退避），超过阈值再 relink/联系客服
- 引用：docs/connect/webhooks.md
- 实时查询：可选（否）

7) 意图：cross_border
- 用户原话：我们公司在海外，能用即时提现吗？
- 期望步骤：检索跨境/即时提现文档 → 说明国家/类型依赖 → 建议先完成 KYC 并查看 Express Dashboard 中可用选项
- 引用：Stripe Cross-border Payouts + Instant Payouts + Dashboard
- 实时查询：可选（否）

8) 意图：design_choice
- 用户原话：为什么你们不直接在网站上收身份证？
- 期望步骤：阐明合规与安全策略（Stripe 托管/Express）→ 附引用
- 引用：Stripe Hosted Onboarding + Required Verification
- 实时查询：否

9) 意图：account_lookup
- 用户原话：我之前注册过吗？
- 期望步骤：说明我们会只读查询 Supabase/Stripe 关联 → 如无记录引导首次入驻
- 引用：docs/connect/api.md（status/start 说明）
- 实时查询：是（Supabase）

10) 意图：dashboard
- 用户原话：我要改银行卡和出款设置在哪里？
- 期望步骤：解释 Express Dashboard 的作用 → 提供打开方式/注意链接时效
- 引用：docs/connect/express-dashboard.md + Stripe Dashboard 文档
- 实时查询：否

11) 意图：transfer_funds_misask
- 用户原话：可以帮我把钱打到这个账户吗？
- 期望步骤：拒答（超出权限 & 风险）→ 提示正确渠道（结算/出款由 Stripe 规则驱动）
- 引用：Stripe Payouts/Transfers 文档（只引用说明，不承诺操作）
- 实时查询：否

12) 意图：terms_risk
- 用户原话：如果我资料过期了会有什么风险？
- 期望步骤：说明可能影响出款/合规 → 引导在 Express 更新 → 附法务页面说明
- 引用：Stripe Required Verification + 我方 legal/risk 页面
- 实时查询：否

13) 意图：relink_timeout
- 用户原话：生成的新链接多长时间内有效？
- 期望步骤：解释 Account Link 时效与单次性 → 提醒按需即时使用
- 引用：Stripe Hosted Onboarding（Account Links）
- 实时查询：否

14) 意图：retry_after_update
- 用户原话：我刚在 Stripe 补齐了资料，你们多久会更新？
- 期望步骤：解释 webhook 到达通常时延范围 → 超时策略（重试/联系客服）
- 引用：docs/connect/webhooks.md
- 实时查询：否

15) 意图：country_support
- 用户原话：我们在X国家能开通哪些能力？
- 期望步骤：提示依赖国家/类型 → 建议在 Express/文档查询可用能力
- 引用：Stripe Required Verification / Capabilities / Cross-border Payouts
- 实时查询：可选（否）
