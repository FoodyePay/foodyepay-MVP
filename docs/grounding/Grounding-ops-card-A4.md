# Grounding 作业卡（A4） v1.0

适用范围：FoodyePay 商户入驻向导智能体（MVP）。目标是“有依据、可核验、可解释”。

## 1. 权威来源优先级（从高到低）
1) 内部文档：`docs/connect/*`（入驻/Relink/Return/Refresh/常见失败/Webhooks/API/Express Dashboard）
2) Stripe 官方文档（已在 `docs/connect/README.md` 列表）
3) 我们的产品/法律页面（Terms/Privacy/Risk）

## 2. 强制规则（必须遵守）
- 先检索，后回答；关键结论必须给出引用（链接到具体小节/URL）。
- 涉及身份/合规/账户资料：统一引导 Stripe 托管流程/Express Dashboard，不在站内采集证照。
- 找不到可靠依据或权限不足：礼貌拒答 + 给出下一步（Relink/打开 Express）。
- 记录检索来源与时间；超出 TTL 必须做一次实时校验。

## 3. 新鲜度与置信度
- TTL：内部文档 24h；Stripe 文档 7 天。
- 如检索置信度低或超时，触发实时检查（只读）：
  - Stripe 账户状态/能力（payouts_enabled/charges_enabled/requirements）
  - Supabase 商户记录（stripe_account_id 等）

## 4. 常见决策树（简化）
- 链接报错 / 已过期 → 生成 Relink → 引导前往 Stripe 托管入驻
- `requirements.currently_due` 非空 → Relink 或 Express Dashboard
- 等待状态变更 → 以 `account.updated` 为准；必要时短时轮询
- 需要修改出款/银行卡 → Express Dashboard

## 5. 引用格式（示例）
- “链接过期请重新生成 Account Link 并在 Stripe 托管入驻继续。 [Stripe — Hosted Onboarding](https://docs.stripe.com/connect/hosted-onboarding)”

## 6. 拒答模板（示例）
- “此问题需要实时账户信息才能确认。我无法直接查看。请先打开 Stripe Express Dashboard 或重新生成链接继续入驻。 [Stripe — Hosted Onboarding](https://docs.stripe.com/connect/hosted-onboarding)”

## 7. 质量门禁（上线前必须达标）
- Groundedness ≥ 0.9；引用正确率 ≥ 0.85；任务成功率 ≥ 0.85；幻觉率 ≤ 2%
- p95 首 Token ≤ 1.5s（视基础设施）
- 10% 人审/周；不达标则阻断发布

## 8. 责任分工
- 内容负责人：入驻 PM/合规对口
- 技术负责人：AI/平台工程
- 变更流程：PR → 评审 → 更新 `docs/connect` 与索引 → 通知
