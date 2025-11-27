import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Rocket, ShieldCheck, Zap, Award, Wallet, Send, CreditCard, Linkedin } from 'lucide-react';

// Component Imports
import { Header } from '../components/landing/Header';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="bg-black text-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/80 to-black z-0"></div>
          <div className="absolute inset-0 opacity-10">
             {/* You can place a background pattern or image here */}
          </div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
              Building the AIoOS for <br className="hidden md:block" /> Real-World Commerce
            </h1>
            
            <h2 className="text-2xl md:text-4xl font-bold text-blue-400 tracking-wide mb-6">
              Simple. Robust. Verifiable.
            </h2>

            <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              <span className="block mb-4 font-semibold text-white">Built by Engineers. Powered by DeFi. Made for Restaurants.</span>
              FoodyePay leverages the Base blockchain and USDC to offer your restaurant near-instant, low-cost payment settlements. Put your hard-earned profit back in your pocket.
            </p>
            
          </div>
        </section>

        {/* Strategic Milestones Section */}
        <section className="py-20 bg-gray-900/50 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Recognized by Industry Leaders
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                We are proud to be supported by the biggest names in Web3 and Cloud infrastructure.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Coinbase Blue Carpet */}
              <div className="bg-gradient-to-b from-blue-900/20 to-black border border-blue-800/50 p-8 rounded-2xl hover:border-blue-500 transition-all group">
                <div className="h-12 mb-6 flex items-center">
                   <Image src="/Coinbase_Wordmark_White.svg" alt="Coinbase" width={140} height={30} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  Coinbase Blue Carpet
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Invited to the exclusive <strong>Blue Carpet</strong> program, granting FoodyePay premium access to asset page customization, developer platform credits, and direct collaboration with the Coinbase Listings Team.
                </p>
                <div className="inline-flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4 mr-2" />
                  Premium Partner Status
                </div>
              </div>

              {/* Uniswap Incubator */}
              <div className="bg-gradient-to-b from-pink-900/20 to-black border border-pink-800/50 p-8 rounded-2xl hover:border-pink-500 transition-all group">
                <div className="h-12 mb-6 flex items-center">
                   <Image src="/UniswapLabs_Horizontal_White.svg" alt="Uniswap" width={140} height={30} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">
                  Uniswap Hook Incubator
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Officially selected for the <strong>UHI8 Cohort</strong>. Our "Dual-Helix" RwaSettlementHook is recognized as a key innovation for the future of DeFi market structure.
                </p>
                <div className="inline-flex items-center text-pink-400 text-xs font-bold uppercase tracking-wider">
                  <Rocket className="w-4 h-4 mr-2" />
                  Official Incubator Project
                </div>
              </div>

              {/* Google Cloud */}
              <div className="bg-gradient-to-b from-gray-800/20 to-black border border-gray-700 p-8 rounded-2xl hover:border-gray-500 transition-all group">
                <div className="h-12 mb-6 flex items-center">
                   <Image src="/google-cloud-web3.svg" alt="Google Cloud" width={110} height={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                  Google for Startups
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Approved for the <strong>Google for Startups Cloud Program</strong> and <strong>Partner Advantage</strong>. Scaling our AIoOS infrastructure on the world's most robust cloud network.
                </p>
                <div className="inline-flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verified Cloud Partner
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* Patent Portfolio Section */}
        <section className="py-20 bg-black border-t border-gray-900">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Pioneering the Future
              </h2>
              <p className="text-xl text-blue-400 font-semibold">
                Backed by 13 USPTO Patent Filings
              </p>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                We are building the intellectual property foundation for the AIoOS era. Our innovations span from autonomous agent operating systems to emotion-driven protocols.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Patent 1 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 22, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/923,207</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Food Consumption Analytics and Predictive Derivatives</h3>
                <p className="text-gray-400 text-sm">Predictive Derivatives for Socio-Political, Cultural, and Event-Based Markets in Decentralized Systems</p>
              </div>

              {/* Patent 2 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 22, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/923,201</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Autonomous Multi-Agent Green Prediction and Hedging Protocol</h3>
                <p className="text-gray-400 text-sm">For Sustainable Perishable Commodity Supply Chains in Decentralized Commerce</p>
              </div>

              {/* Patent 3 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 22, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/923,190</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Autonomous Multi-Agent Prediction and Hedging Protocol</h3>
                <p className="text-gray-400 text-sm">For Perishable Commodity Supply Chains in Decentralized Commerce</p>
              </div>

              {/* Patent 4 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 16, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/918,595</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Emotion-Aware Dynamic NFT Menu System</h3>
                <p className="text-gray-400 text-sm">NFT Generative Menu + AI Emotional Price Adjustment</p>
              </div>

              {/* Patent 5 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 19, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/920,704</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AIoOS: Artificial Intelligence Onchain Operating System</h3>
                <p className="text-gray-400 text-sm">The world's first AI Onchain Operating System (Agent OS) for Autonomous Agent Identity & Lifecycle Management</p>
              </div>

              {/* Patent 6 */}
              <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-2 py-1 rounded">Filed: Nov 18, 2025</span>
                  <span className="text-xs font-mono text-gray-500">App #: 63/920,301</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Emotion Command Verification Protocol (ECVP)</h3>
                <p className="text-gray-400 text-sm">An "Emotion Verification Kernel" for secure Agent-to-Blockchain execution</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">The Magic of Payment: 3 Steps</h2>
            <p className="mt-4 text-lg text-gray-400">From QR scan to fiat in your bank, it's never been this simple or efficient.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12 text-left">
              <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-full"><Zap className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold">1. Diner Pays</h3>
                </div>
                <p className="mt-4 text-gray-400">Customers scan a QR code and pay with FOODY from their self-custody wallet, secured by Coinbase.</p>
              </div>
              <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 p-3 rounded-full"><Rocket className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold">2. On-Chain Atomic Settlement</h3>
                </div>
                <p className="mt-4 text-gray-400">The payment is routed through the `RwaSettlementHook` on Uniswap V4, instantly settling funds within the transaction.</p>
              </div>
              <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-3 rounded-full"><ShieldCheck className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold">3. Fiat in the Bank</h3>
                </div>
                <p className="mt-4 text-gray-400">Stripe automatically transfers the settled funds to your bank account. Say goodbye to T+1.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="for-restaurants-section" className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">More Than Payments, It's Your Business Command Center</h2>
              <p className="text-lg text-gray-400 mb-8">We solve your core pain points, so you can focus on creating great food.</p>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Unlock Business Insights</h3>
                    <p className="text-gray-400">Real-time financial analytics and sales data at your fingertips.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Streamline Your Operations</h3>
                    <p className="text-gray-400">Easily manage your menu and track orders directly from the dashboard.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Reduce Payment Costs by 90%</h3>
                    <p className="text-gray-400">Leave expensive credit card fees behind and keep more of your profits.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Near-Instant Fund Settlement</h3>
                    <p className="text-gray-400">No more waiting for T+1. Improve your cash flow dramatically.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Easy Onboarding, Global Reach</h3>
                    <p className="text-gray-400">Get verified quickly via Stripe Connect and start accepting crypto payments from customers worldwide.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <Image
                src="/restaurant-dashboard.png"
                alt="FoodyePay Restaurant Dashboard"
                width={1200}
                height={785}
                className="rounded-xl shadow-2xl ring-1 ring-white/10 mt-8 md:mt-0"
              />
            </div>
          </div>
        </section>

        {/* For Diners Section */}
        <section id="for-diners-section" className="py-20 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="md:order-2">
              <h2 className="text-4xl font-bold text-white mb-4">Your Web3 Food-Finance Hub</h2>
              <p className="text-lg text-gray-400 mb-8">FoodyePay is more than a payment app. It's your all-in-one hub to earn rewards, manage digital assets, and pay friends, powered by the Base blockchain.</p>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <Award className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Earn & Track Rewards</h3>
                    <p className="text-gray-400">Watch your FOODY points grow with every meal and track your loyalty status in real-time.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Wallet className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Your Digital Wallet</h3>
                    <p className="text-gray-400">Swap tokens, view transaction history, and manage your digital assets with ease.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Send className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Instant P2P Payments</h3>
                    <p className="text-gray-400">Send FOODY to friends and family instantly with zero fees.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CreditCard className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Seamless On & Off-Ramp</h3>
                    <p className="text-gray-400">Easily purchase crypto with your card and off-ramp funds to your bank account.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:order-1">
              <Image
                src="/diner-dashboard.png"
                alt="FoodyePay Diner Dashboard"
                width={1200}
                height={785}
                className="rounded-xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </section>
        {/* Partners Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-center text-gray-400 text-sm font-semibold uppercase tracking-wider">
              Powered by industry leaders
            </h3>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4 justify-items-center items-center">
              <Image src="/google-cloud-web3.svg" alt="Google Cloud" width={50} height={50} className="opacity-70 hover:opacity-100 transition-opacity" />
              <Image src="/Base_square_white.svg" alt="Base" width={30} height={30} className="opacity-70 hover:opacity-100 transition-opacity" />
              <Image src="/UniswapLabs_Horizontal_White.svg" alt="Uniswap" width={150} height={40} className="opacity-70 hover:opacity-100 transition-opacity" />
              <Image src="/stripe-wordmark-white.svg" alt="Stripe" width={120} height={40} className="opacity-70 hover:opacity-100 transition-opacity" />
              <Image src="/Coinbase_Wordmark_White.svg" alt="Coinbase" width={150} height={40} className="opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}









