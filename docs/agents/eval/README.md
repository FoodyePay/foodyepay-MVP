# 评估数据集与执行说明

本目录用于存放 Agent 评估数据集与脚本。建议以 JSONL 存储，每行一个样例，便于追加与版本管理。

## 文件
- dataset-template.jsonl：数据格式模板与示例。

## 字段说明（每行 JSON 对象）
- id：字符串，唯一标识。
- locale：语言/区域，例如 zh-CN、en-US。
- prompt：用户输入文本。
- ground_truth：期望事实要点（数组），可作为评分参考。
- required_citations：必须包含的引用（数组，支持 URL 片段匹配）。
- expected_tools：期望调用的工具序列（数组），例如 ["stripe_get_account_status", "connect_generate_relink_url"]。
- guardrail_expectation：期望护栏决策（allow|refuse|modify）。
- judge_rubric：评分权重，例如 { groundedness: 0.35, citation: 0.2, task_success: 0.35, tone: 0.1 }。
- metadata：{ category, tags } 自由扩展。

## 执行建议
- 单元评估（组件级）：针对工具与解析器写 Vitest/Jest 用例。
- 轨迹评估（集成）：用 Node 脚本跑 JSONL，逐条断言“工具选择/参数/引用”。
- 结果评估：先规则判定（引用/链接/TTL），再用 LLM 作为辅判，最后抽样人工复核 10%。
- 周期：PR 必跑（抽样）+ 每周全量回归。

## 快速运行（Windows PowerShell）
在项目根目录执行：

```powershell
npm run eval:score
```

可选：指定自定义数据与响应文件（路径基于仓库根目录）：

```powershell
node scripts/eval-score.cjs docs/agents/eval/dataset-template.jsonl docs/agents/eval/sample-responses.jsonl
```
