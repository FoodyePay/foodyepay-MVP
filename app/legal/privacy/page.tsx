import React from 'react'

export const dynamic = 'force-dynamic'

export default function PrivacyPage() {
  return (
    <main className="prose prose-invert max-w-4xl mx-auto p-6">
      <h1>FoodyePay 隐私政策 / Privacy Policy</h1>
      <p>最后更新 / Last Updated: {new Date().toISOString().split('T')[0]}</p>

      <h2>1. 我们收集的数据 / Data We Collect</h2>
      <ul>
        <li>账户标识：钱包地址 / Wallet address</li>
        <li>餐馆资料：名称、Google Maps 关联信息、电话验证状态</li>
        <li>联系信息：邮箱（验证用）、电话（经 Twilio 验证）</li>
        <li>使用与交互日志（基础性能 & 安全）</li>
      </ul>

      <h2>2. 数据来源 / Sources</h2>
      <ul>
        <li>您主动提供的输入（注册流程）</li>
        <li>区块链（公开链上数据）</li>
        <li>第三方 API（Google Maps, Coinbase Onramp metadata）</li>
      </ul>

      <h2>3. 使用目的 / Purposes</h2>
      <ul>
        <li>完成餐馆注册与验证</li>
        <li>发放平台奖励 / loyalty 激励</li>
        <li>防止欺诈 / 保障平台安全</li>
        <li>改进功能和用户体验</li>
        <li>符合法规要求（如将来需合规报告）</li>
      </ul>

      <h2>4. 不收集 / We Do NOT Collect</h2>
      <ul>
        <li>明文支付卡数据（Onramp 由 Coinbase 处理）</li>
        <li>生物特征数据</li>
        <li>政府身份证图像</li>
      </ul>

      <h2>5. 数据共享 / Sharing</h2>
      <ul>
        <li>第三方基础设施：Supabase (data hosting)、Coinbase Onramp、Twilio、Google Maps</li>
        <li>执法或法律要求（依法）</li>
        <li>不向广告商出售您的个人数据</li>
      </ul>

      <h2>6. 数据保留 / Retention</h2>
      <p>我们在达到收集目的所需期间保留数据；在您请求删除（并合法允许）后做匿名化或删除。</p>

      <h2>7. 用户权利 / Your Rights</h2>
      <ul>
        <li>访问 / Access：请求导出您提供的信息</li>
        <li>更正 / Rectify：纠正不准确资料</li>
        <li>删除 / Erase：在法律允许下请求删除（链上记录不可逆）</li>
        <li>限制 / Restrict：限制某些处理（例如营销通知）</li>
      </ul>

      <h2>8. 安全措施 / Security</h2>
      <ul>
        <li>数据库行级安全 (Supabase RLS)</li>
        <li>最小权限访问 & 服务端签名流程（规划中）</li>
        <li>密钥存储于部署平台环境变量而非代码仓库</li>
      </ul>

      <h2>9. 儿童隐私 / Children</h2>
      <p>本服务不面向 13 岁以下儿童。We do not target children under 13.</p>

      <h2>10. 国际传输 / International Transfers</h2>
      <p>数据可能存储在不同国家/地区的云基础设施上；使用即表示同意跨境传输。</p>

      <h2>11. 政策更新 / Updates</h2>
      <p>我们可能随时更新本政策并在本页显示新的“最后更新”日期。</p>

      <h2>12. 联系方式 / Contact</h2>
      <p>数据保护请求：privacy@foodyepay.com 或 support@foodyepay.com</p>

      <hr />
      <p style={{fontSize:'0.85rem'}}>此页面提供中英双语版本，若有冲突以英文解释为准。In case of conflict, English meaning prevails.</p>
    </main>
  )
}
