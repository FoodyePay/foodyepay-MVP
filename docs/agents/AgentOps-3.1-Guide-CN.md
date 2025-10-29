# AgentOps 3.1 中文实践指南（FoodyePay）

面向生产可用代理（production-ready agents），我们采用四层评估 + 运行期监控的方法论，并给出在 FoodyePay（Next.js 14 + TypeScript + Stripe + Supabase）中的落地映射与检查清单。

---

## 总览：四层评估与运行期监控
- 目标：把代理从“看起来能用”变成“可度量、可灰度、可回滚、可持续改进”。
- 四层：
  1) 组件级（确定性单元测试）
  2) 轨迹级（过程正确性 / ReAct）
  3) 结果级（语义正确性 / 事实 + 完整 + 语气）
  4) 系统级监控（生产观测）
- 工具包理念：指南中提到 ADK + Agent Starter Pack；在本仓库我们用等价模式实现（TS 工具函数、评估数据集、CI、OpenTelemetry 打点、灰度策略）。

---

## Layer 1：组件级评估（确定性单元测试）
- 目标：验证非 LLM 组件（工具函数、解析与序列化、API 适配器）在正常/异常/边界输入上的行为。
- 测什么：
  - 工具函数：期望输入（valid/invalid/edge）、超时/限流、错误映射（not_found/unauthorized/rate_limited/upstream_error）。
  - 数据处理：JSON/URL/Query/金额/货币/国家码 解析与序列化；小数精度与四舍五入规则。
  - 集成：Stripe/Supabase 只读调用的成功/失败/超时处理与重试策略。
- 在 FoodyePay 的做法：
  - 把工具封装为纯 TS 函数，定义类型：输入/输出/错误类型。
  - 使用 Vitest 或 Jest 建立 tests/unit/；为每个工具写“成功/异常/边界”三类用例。
  - 设定统一超时（2–4s）、指数退避最多 2 次、短缓存 ≤30s 的策略并在测试中验证。
- 验收：代码覆盖率 ≥ 80%，关键分支（错误与超时）至少 1 个案例。

---

## Layer 2：轨迹评估（ReAct 过程正确性）
- 目标：验证 Reason → Act → Observe 的思考链是否合理；是否选择了正确工具并传入正确参数；是否使用输出推进下一步。
- 测什么：
  - Reason：是否正确理解用户目标并提出可检验的下一步假设。
  - Act（工具选择+参数生成）：是否选择了正确只读工具，参数是否包含必要字段（account_id、country、ttl 等）。
  - Observe：是否正确吸收工具输出并更新认知（例如“链接已过期，生成 relink”）。
- 在 FoodyePay 的做法：
  - 为典型场景写“黄金轨迹”（golden trajectories），如：
    - 商家 relink → 只读检查账户状态 → 生成 Express relink → 输出含引用与下一步。
    - Refresh → 校验 TTL → 触发只读重新校验 → 给出明确按钮/链接与引用。
  - 在 tests/integration/ 下编写评估脚本：给定 prompt，断言“选对工具”“参数正确”“引用包含目标文档小节”，并记录每个 ReAct 步骤。
  - 输出轨迹 JSON 供可视化与回归；CI 在 PR 上运行，防回归。
- 验收：错误工具选择率 ≤ 2%；参数缺失率 ≤ 1%；黄金轨迹通过率 ≥ 95%。

---

## Layer 3：结果评估（语义正确性）
- 目标：用户可见答案的“事实准确 + 有帮助 + 完整 + 语气合适”。
- 测什么：
  - 事实/grounding：是否基于 docs/connect/* 或 Stripe 官方；TTL 过期会触发只读核对。
  - 有帮助/语气：是否明确下一步、提供替代方案（Express/Relink/联系客服）。
  - 完整性：是否覆盖必要前提、限制、注意事项；是否包含引用链接（可点）。
- 在 FoodyePay 的做法：
  - 构建 60–80 题评估集（含错别字/模糊/边界变体）。
  - 采用“规则 + LLM 辅助判分”的混合评审：规则检查引用与链接、小节匹配；LLM 仅作语义评分的辅判。
  - 每周回归 + 10% 人审，失败样例进入修复队列。
- 验收：
  - Groundedness ≥ 0.9
  - Citation ≥ 0.85
  - Task Success ≥ 0.85
  - Hallucination ≤ 2%

---

## Layer 4：系统级监控（生产）
- 目标：持续观测真实世界表现，发现操作与行为漂移。
- 监控什么：工具失败率、用户反馈、轨迹指标（每任务 ReAct 步数）、端到端时延、成本、拒答/改写命中量。
- 在 FoodyePay 的做法：
  - 使用 OpenTelemetry JS：对检索、工具、生成分别打点 trace/span。
  - 最小日志字段见《observability-min-fields.md》，汇总到日志与看板。
  - 灰度放量与回滚遵循《A4-Release-gates-and-ops.md》。

---

## ADK 与 Agent Starter Pack 的等价落地
- 指南中的 ADK/Starter Pack 提供：项目脚手架、CI/CD、观测、评估、BigQuery、Vertex 评估。
- 在本仓库的等价方案：
  - 结构：`tools/`（TS 函数）、`tests/unit|integration/`、`docs/agents/eval/`（数据集）、`docs/agents/`（指南与政策）、`scripts/`（评估运行器占位）。
  - CI/CD：GitHub Actions 或 Vercel 构建；PR 触发 unit + integration 评估。
  - 观测：OpenTelemetry + 统一最小字段；日志可落到托管日志或 Supabase 表（只存元数据与哈希）。
  - 连续评估：每周定时任务跑评估集，结果写入报表。

---

## 五步工作流（结合 FoodyePay）
1) 引导：建立最小项目结构与评估/观测基线（本指南 + 模板）。
2) 开发：以 TS 实现工具与代理流程，保持“只读 + 引用必需”。
3) 提交即自动：PR 上运行单元 + 轨迹评估，未达标不合并。
4) 持续评估：合入后进入灰度，持续跑数据集，观察指标/告警。
5) 自信部署：门槛通过 → 放量；未达标 → 回滚并进入修复回路。

---

## 快速清单（Checklists）
- 组件级：
  - [ ] 工具函数三类用例（成功/异常/边界）
  - [ ] 超时/重试/限流/短缓存覆盖
  - [ ] 错误枚举和日志字段一致
- 轨迹级：
  - [ ] 黄金轨迹脚本可复现
  - [ ] 正确工具选择与参数断言
  - [ ] 轨迹 JSON 输出并存档
- 结果级：
  - [ ] 强制引用 + TTL 检查
  - [ ] 评估集 ≥ 60 题，含对抗变体
  - [ ] 周回归 + 10% 人审
- 系统级：
  - [ ] OpenTelemetry 打点上线
  - [ ] 看板：accuracy/latency/cost/deflection/tool-fail
  - [ ] 灰度与回滚脚本/预案

---

参考：
- 本仓库：`docs/agents/A4-Responsible-AI-policy.md`、`A4-Eval-and-RedTeam-playbook.md`、`A4-Release-gates-and-ops.md`、`observability-min-fields.md`（本次新增）与 `eval/` 模板。
