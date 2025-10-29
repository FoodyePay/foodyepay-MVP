# 最小可观测字段（OpenTelemetry + 日志）

统一在每个任务与工具调用上发以下字段，便于聚合分析与告警。

## Trace / Span 公共属性
- service.name: foodyepay-agent
- agent.version: x.y.z
- env: dev|staging|prod
- task.id: 短 UUID
- user.hash: SHA256(用户标识, 盐)（避免存 PII）
- locale: zh-CN|en-US
- route: app 路由或功能模块

## 步骤级别（Reason/Act/Observe）
- step.type: reason|act|observe
- step.index: 0..n
- tool.name: 若 step=act
- tool.args.hash: 参数哈希（避免日志泄露）
- tool.status: ok|error|timeout|rate_limited
- tool.latency_ms
- tool.error_code

## 结果级别（Outcome）
- outcome.has_citation: true|false
- outcome.citations: 链接（可脱敏为域+路径）
- outcome.groundedness_score: 0..1（可由规则/评估得分注入）
- outcome.task_success_score: 0..1
- outcome.hallucination_flag: true|false

## 系统级指标
- e2e.latency_ms
- token.prompt/response（可选，或仅记录数量）
- cache.hit: true|false（短缓存命中）
- guardrail.decision: allow|modify|block
- guardrail.rule_ids: 命中规则列表

## 示例（简化 JSON）
{
  "service.name":"foodyepay-agent",
  "env":"staging",
  "task.id":"t_9f7c",
  "user.hash":"u_a12c...",
  "spans":[
    {"step.type":"reason","step.index":0,"text":"需要检查账户状态"},
    {"step.type":"act","step.index":1,"tool.name":"stripe_get_account_status","tool.status":"ok","tool.latency_ms":420},
    {"step.type":"observe","step.index":2,"text":"状态需要 relink，准备生成链接"}
  ],
  "outcome":{"has_citation":true,"citations":["/docs/connect/relink"],"groundedness_score":0.94,"task_success_score":0.9},
  "e2e.latency_ms":1380,
  "guardrail":{"decision":"allow","rule_ids":["require_citation","ttl_ok"]}
}
