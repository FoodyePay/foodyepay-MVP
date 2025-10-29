# Agent 类型与选择（A4 备忘卡）

目的：快速决策应该用哪种 Agent 架构来实现当前需求（无代码）。

## 1) LLM Agent（通用推理体）
- 特性：非确定性、灵活，负责理解、计划、选择工具、综合答案
- 适用：对话问答、需要多步推理且场景变化大的任务
- FoodyePay用法：作为“入驻向导”的总控Agent

## 2) Workflow Agents（确定性编排器）
- SequentialAgent（顺序）：步骤强依赖；例如：检索→查账户→输出CTA
- ParallelAgent（并行）：多个独立子任务并发；例如：并行检索内部/官方文档+只读查Stripe状态
- LoopAgent（循环）：需要重复直到满足条件；例如：等待 webhook 或进行短时轮询

## 3) Custom Agent（自定义/硬逻辑）
- 特性：基于 BaseAgent 的自定义类，执行严格规则（可确定/不可确定取决于实现）
- 适用：合规闸门、格式校验、必须“按规则来”的场景
- FoodyePay用法：合规裁决助手（统一拒绝在站内收集证件，强制引导 Stripe 托管/Express）

## 选择建议
- 只要对话 + 策略选择 → LLM Agent
- 有严格步骤/依赖 → Sequential
- 多源独立/并发友好 → Parallel
- 需要直到条件达成 → Loop
- 刚性规则/闸门 → Custom

## 输出规范（所有 Agent 通用）
- 顺序：先“下一步行动”，再“原因解释”，最后“引用链接”
- Grounding：关键结论必须可验证；超出权限即拒答
- 安全：只读工具优先；敏感信息统一导向 Stripe 托管与 Express
