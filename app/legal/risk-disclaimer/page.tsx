import React from 'react'

export const dynamic = 'force-dynamic'

export default function RiskDisclaimerPage() {
  return (
    <main className="prose prose-invert max-w-4xl mx-auto p-6">
      <h1>数字资产风险提示 / Digital Asset Risk Disclaimer</h1>
      <p>最后更新 / Last Updated: {new Date().toISOString().split('T')[0]}</p>

      <h2>1. 非投资建议 / Not Investment Advice</h2>
      <p>本平台所展示的任何代币价格、收益、说明仅作功能与体验用途，并不构成投资建议、证券招揽或推荐。</p>

      <h2>2. 波动性 / Volatility</h2>
      <p>数字资产价格可能大幅、快速波动，您可能遭受部分或全部价值损失。Values of digital assets can change rapidly and unpredictably.</p>

      <h2>3. 监管风险 / Regulatory Risk</h2>
      <p>监管政策变化可能影响代币的功能、可访问性或合法使用。</p>

      <h2>4. 技术与安全风险 / Technical & Security</h2>
      <ul>
        <li>智能合约漏洞、网络拥堵、节点攻击或分叉可能导致服务中断。</li>
        <li>您丢失私钥或助记词将无法恢复访问。</li>
      </ul>

      <h2>5. 第三方依赖 / Third Parties</h2>
      <p>Onramp、地图、短信验证等功能依赖第三方服务；其故障、政策调整或限制将影响功能可用性。</p>

      <h2>6. 奖励机制不保证 / No Reward Guarantees</h2>
      <p>奖励规则可随时调整、暂停或取消；历史发放不代表未来。</p>

      <h2>7. 自行评估 / Self Assessment</h2>
      <p>在参与任何交易或使用功能前，请自行评估您的风险承受能力，如有需要请咨询专业人士。</p>

      <h2>8. 承担风险 / Your Responsibility</h2>
      <p>使用本平台即表示您理解并接受所有上述风险。</p>

      <hr />
      <p style={{fontSize:'0.85rem'}}>若英文与中文解释不一致，以英文风险含义为准。</p>
    </main>
  )
}
