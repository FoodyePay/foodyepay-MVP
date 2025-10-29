# 来源/入库清单（MVP）

目的：把可检索的权威资料清单化，便于后续索引/评估。

## 1) 内部文档（docs/connect/*）
- README.md（总览 + 快捷链接 + 官方文档清单）
- onboarding.md（托管入驻流程与数据）
- relink.md（重新生成链接场景）
- return.md（Return 桥接页职责/幂等）
- refresh.md（Refresh 桥接页职责）
- common-failures.md（常见失败与修复）
- webhooks.md（account.updated 处理）
- api.md（内部 API 合同）
- express-dashboard.md（商户自助）

元数据建议：doc_type=internal, section, url(仓库路径), updated_at, version(commit)

## 2) Stripe 官方文档（15 篇）
- 已在 docs/connect/README.md 列出。
- 为每篇生成子条目：title, url, section_hint（如 hosted-onboarding, webhooks, required-information 等）
- TTL 建议：7 天；更新时记录抓取时间。

## 3) 法务/产品页面
- Terms, Privacy, Risk（仓库内 legal 页面）
- 标注仅用于对外说明，不作为流程/动作指令的首要依据。

## 4) 实时数据（只读）
- Stripe Accounts/Capabilities（API 读取）
- Supabase 商户记录（stripe_account_id、状态摘要）
- 注意：这类数据不入向量库，作为工具调用结果缓存，附带 timestamp。

## 5) 质量控制
- 每次文档更新：PR + 评审 + 索引更新 + 通知
- 采集失败/链接失效：报警 + 替换
