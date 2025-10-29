# FoodyePay 智能体组合（A4）— 无代码版

目标：给团队与管理层一个一页视图，明确我们需要多少个智能体、各自职责、使用的工具、协作关系、SLO/KPI 与上线节奏。

## 1. 数量与分层
- 现在（MVP）：1 个（商户入驻向导）
- 6–8 周目标：3 个（+ 出款与合规状态助手、奖励与费用说明助手）
- 稳定态：5 个（再加 支持分诊助手 + 合规护栏代理）
- 说明：工作流编排（Sequential/Parallel/Loop）属于实现形态，不单独计数。

## 2. 角色与职责
1) 商户入驻向导（用户可见，LLM Agent）
   - 任务：入驻/Relink/Return/Refresh/常见失败/Express 引导。
   - 输出规范：先“下一步”，再“原因”，最后“引用”。
2) 出款与合规状态助手（用户可见，LLM Agent）
   - 任务：解释“为什么不能提现/如何启用出款/资料是否齐全”。
   - 边界：只读核对，不作资金操作。
3) 奖励与费用说明助手（用户可见，LLM Agent）
   - 任务：解释奖励规则、费用/税务口径；引用内部/法务/官方文档。
4) 支持分诊与知识检索助手（用户/客服，LLM Agent）
   - 任务：分类路由，优先自助解答，复杂转人工。
5) 合规护栏代理（系统级，Custom/Rule Agent）
   - 任务：红线规则审查（禁止收集证件、禁止资金写操作、引用检查、权限校验）。
   - 用法：Agent-as-a-tool，被其他代理在输出前调用把关。

## 3. 工具与 MCP（“通用插座”）
- 统一工具集：ConnectToolset（只读）
  - stripe_get_account_status、supabase_get_merchant_row、connect_generate_relink_url、express_dashboard_login_link、citation_helper
- MCP 角色
  - 客户端：各智能体消费 MCP 工具（内部/第三方）。
  - 服务器：将 ConnectToolset 暴露为 MCP 服务，供其他团队与智能体复用。
- 第二阶段扩展：数据库 MCP 工具箱（BigQuery/Postgres 等）供报表/对账/分析代理使用。

## 4. 协作与编排（A2A + Workflow）
- 分诊 → （A2A）→ 入驻向导 / 出款助手 / 奖励助手
- 面向用户代理 → （Agent-as-a-tool）→ 合规护栏代理（输出前审查）
- Workflow 模式：
  - Sequential：检索 → 只读核对 → 合规审查 → 输出
  - Parallel：并行检索内部/官方 + Stripe 状态
  - Loop：短时轮询 webhook（设终止条件）

## 5. 安全与边界
- 权限：试点阶段所有工具只读；资金类写操作独立审批与隔离。
- Grounding：强制引用；TTL（内部24h/Stripe 7天）；证据不足即拒答+替代路径。
- 隐私：敏感信息统一由 Stripe 托管流程与 Express Dashboard 承接。

## 6. SLO/KPI（上线门限）
- Groundedness ≥ 0.9；Citation ≥ 0.85；Task Success ≥ 0.85；Hallucination ≤ 2%
- 性能：p95 首 Token ≤ 1.5s（视基础设施）
- 运营：自助解决率 ≥ 90%；支持分诊正确路由率 ≥ 90%
- 合规：关键事故 0；护栏命中后有清晰替代路径

## 7. 上线节奏（无代码）
- 周1–2：确认工具合同与统一策略（超时/重试/配额/日志/隐私）；完成 12–15 题小评估并过门限
- 周3–4：扩充评估至 60–80 题；准备分诊模板与护栏规则清单；MCP 化 ConnectToolset（只读）
- 周5–6：接入数据库 MCP 工具箱（只读）；上线“出款助手/奖励助手”；人审与周报机制固化
- 周7–8：合规护栏代理前置到所有用户代理的输出前；评估回归与 SLO 看板固化

## 8. 决策清单（需拍板）
- 部署：Vertex AI Agent Engine（托管）还是 Cloud Run（通用）作为首选运行环境？
- 输出语言：默认中文，引用保留英文链接；是否提供双语切换？
- MCP 扩展优先级：是否在第2阶段引入“数据库 MCP 工具箱”？
