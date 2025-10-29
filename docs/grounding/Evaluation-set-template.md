# 评估集模板（RAG/Agentic）

用途：验证“入驻向导智能体”的准确性、可解释性与任务成功率。

## 1) 题目结构
- id: 唯一编号
- locale: zh-CN | en
- intent: onboarding_start | relink | return | refresh | common_failure | webhook | payouts | cross_border
- user_query: 原始问题
- gold_steps: 标准操作步骤（如：检索 → 判断 → Relink）
- gold_answer: 参考答案（含行动与提示）
- citations: 期望引用（来源URL或内部文档路径）
- need_live_check: true/false（是否必须查 Stripe/Supabase 实时状态）
- risk_level: low/medium/high

## 2) 示例（3 题）
- Q1
  - intent: relink
  - user_query: “我昨天打开的 Stripe 入驻链接今天打不开了怎么办？”
  - gold_steps: 检索托管入驻 → 生成新 Account Link → 引导继续
  - citations: Stripe Hosted Onboarding + docs/connect/relink.md
  - need_live_check: false

- Q2
  - intent: payouts
  - user_query: “为什么我还不能提现？”
  - gold_steps: 查文档 → 判断需实时状态 → Stripe 只读查询 requirements/payouts_enabled → 结果分支
  - citations: Stripe Required Verification + docs/connect/webhooks.md
  - need_live_check: true

- Q3
  - intent: common_failure
  - user_query: “上传身份证总是失败怎么办？”
  - gold_steps: 检索合规上传规则 → 引导回 Stripe/Express 而非站内 → 提示重试条件
  - citations: Stripe Onboarding/Verification + docs/connect/common-failures.md
  - need_live_check: false

## 3) 评分维度
- groundedness: 0/1（是否基于检索内容）
- citation_correctness: 0–1（链接/小节是否匹配）
- task_success: 0–1（下一步是否正确）
- safety: 0–1（是否有不当收集、误导等）
- latency_ms: 数值

## 4) 执行与门限
- 总题量：≥ 60；双语覆盖；包含“模糊/错别字/口语化”变体
- 门限：groundedness≥0.9，citation≥0.85，task_success≥0.85，hallucination≤2%
- 回归：周更；若低于门限阻断上线
