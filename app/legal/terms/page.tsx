import React from 'react'

export const dynamic = 'force-dynamic'

export default function TermsPage() {
  return (
    <main className="prose prose-invert max-w-4xl mx-auto p-6">
      <h1>FoodyePay 服务条款 / Terms of Service</h1>
      <p>最后更新 / Last Updated: {new Date().toISOString().split('T')[0]}</p>

      <h2>1. 接受条款 / Acceptance</h2>
      <p>使用 FoodyePay（“本服务”）即表示您同意本服务条款以及我们随时可能更新的政策。By accessing or using FoodyePay (the “Service”), you agree to these Terms and any future updates.</p>

      <h2>2. 服务性质 / Nature of Service</h2>
      <ul>
        <li>FoodyePay 是一个基于区块链 (Base) 的餐饮支付与奖励平台。</li>
        <li>FOODY 代币目前仅用于平台内的积分式激励与功能解锁，不代表股权、债权或分红承诺。</li>
        <li>We do NOT provide investment advice, brokerage, custody or exchange services.</li>
      </ul>

      <h2>3. 账户与资格 / Accounts & Eligibility</h2>
      <p>您需保证使用本服务在您所在司法辖区是合法的；未成年人需在监护人同意下使用。You are responsible for ensuring legality of your use in your jurisdiction.</p>

      <h2>4. 钱包与密钥 / Wallet & Keys</h2>
      <ul>
        <li>您对自己的钱包私钥、安全凭证、设备安全负全责。You are solely responsible for safeguarding your wallet private keys.</li>
        <li>若您丢失私钥，我们无法为您恢复访问权限。</li>
      </ul>

      <h2>5. 第三方服务 / Third-Party Services</h2>
      <ul>
        <li>Coinbase Onramp、Supabase、Google Maps、Twilio 等第三方服务各自有独立条款。</li>
        <li>使用 Onramp 购买 USDC 属于与相应受监管服务商之间的交易。</li>
      </ul>

      <h2>6. 用户行为 / User Conduct</h2>
      <ul>
        <li>禁止欺诈、滥用奖励、攻击系统、试图未授权访问。</li>
        <li>禁止利用本平台从事洗钱、恐怖融资或其他违法活动。</li>
      </ul>

      <h2>7. 奖励与代币 / Rewards & Tokens</h2>
      <ul>
        <li>平台可能发放可变数量的 FOODY 奖励；发放算法、权重或政策可随时调整。</li>
        <li>Rewards have no guaranteed monetary value and may fluctuate or be discontinued.</li>
      </ul>

      <h2>8. 风险声明 / Risk Notice</h2>
      <ul>
        <li>区块链交易不可逆且存在技术、网络、智能合约风险。</li>
        <li>数字资产价格可能剧烈波动。</li>
        <li>Regulatory changes may impact token utility or accessibility.</li>
      </ul>

      <h2>9. 免责声明 / Disclaimers</h2>
      <p>本服务以“现状”提供，不提供任何明示或默示担保。We disclaim all warranties including merchantability, fitness for a particular purpose and non-infringement.</p>

      <h2>10. 责任限制 / Limitation of Liability</h2>
      <p>在适用法律允许的最大范围内，我们对任何间接、附带、特殊、惩罚性或后果性损失不承担责任。Our total aggregate liability shall not exceed the fees (if any) you paid to us in the preceding 3 months.</p>

      <h2>11. 修改 / Modifications</h2>
      <p>我们可随时修改条款并在本页面更新日期。继续使用即表示同意修改后的条款。We may modify these Terms at any time by updating this page.</p>

      <h2>12. 终止 / Termination</h2>
      <p>如您违反条款，我们可暂停或终止您对服务的访问。We may suspend or terminate access for violations.</p>

      <h2>13. 法律适用 / Governing Law</h2>
      <p>适用地方法律（待确定最终注册地）。Governing law to be finalized upon corporate domicile confirmation.</p>

      <h2>14. 联系方式 / Contact</h2>
      <p>联系我们 / Contact: support@foodyepay.com</p>

      <hr />
      <p style={{fontSize:'0.85rem'}}>此中英双语版本仅供参考，如有冲突以英文版本为准。In case of discrepancies, the English meaning prevails.</p>
    </main>
  )
}
