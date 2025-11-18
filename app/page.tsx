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
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Say Goodbye to 3% Fees
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mt-2">
              Welcome the Future of Payments
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              FoodyePay leverages the Base blockchain and USDC to offer your restaurant near-instant, low-cost payment settlements. Put your hard-earned profit back in your pocket.
            </p>
            
          </div>
        </section>

        {/* Uniswap Incubator Announcement */}
        <section className="py-12 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="border border-purple-500/30 rounded-xl p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 shadow-2xl">
              <div className="flex justify-center items-center mb-4">
                <Image src="/FoodyePayLogo.png" alt="FoodyePay" width={40} height={40} />
                <span className="mx-2 text-gray-400 self-center">+</span>
                <Image src="/Uniswap_icon_pink.svg" alt="Uniswap" width={40} height={40} />
              </div>
              <h3 className="text-2xl font-bold text-purple-300">
                Officially Selected for Uniswap Hook Incubator
              </h3>
              <p className="mt-2 text-gray-300">
                FoodyePay's core "Dual-Helix" technology, featuring the <code>RwaSettlementHook</code>, has been selected by Uniswap Labs for the UHI8 cohort to contribute to the future of the DeFi community.
              </p>
            </div>
          </div>
        </section>

        {/* Google Cloud Partnership Section */}
        <section className="py-12 bg-black">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="border border-blue-500/30 rounded-xl p-6 bg-gradient-to-r from-gray-900 to-blue-900/10 shadow-2xl">
              <div className="flex justify-center items-center mb-4">
                <Image src="/FoodyePayLogo.png" alt="FoodyePay" width={40} height={40} />
                <span className="mx-2 text-gray-400 self-center">+</span>
                <Image src="/google-cloud-web3.svg" alt="Google Cloud" width={50} height={50} />
              </div>
              <h3 className="text-2xl font-bold text-blue-300">
                Our Strategic Partner in the Cloud
              </h3>
              <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
                We are proud to build on Google Cloud and are honored to be supported by a dedicated team, including our Google Cloud Account Manager.
              </p>
              <div className="mt-6 bg-gray-800/50 rounded-lg p-4 inline-flex items-center">
                <div className="text-left">
                  <p className="font-bold text-white">Haley Johnson</p>
                  <p className="text-sm text-gray-400">Google Cloud Territory Manager</p>
                </div>
                <a href="https://www.linkedin.com/in/haley-johnson-84a404169/" target="_blank" rel="noopener noreferrer" className="ml-4 p-2 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
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

        {/* The Dual-Helix Hooks Vision */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              This is the Future: The Dual-Helix Hooks
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              We're not just building payments. We're building a self-sustaining, decentralized economy powered by real-world business activity.
            </p>
            <div className="mt-10 grid md:grid-cols-2 gap-8 text-left">
              <div className="p-6 border border-purple-700 rounded-xl bg-purple-900/20">
                <h3 className="text-xl font-bold text-purple-300">RwaSettlementHook</h3>
                <p className="mt-2 text-sm text-purple-400">Application Layer: Atomic Payment Settlement</p>
                <p className="mt-4 text-gray-300">Transforms Uniswap into a global payment network, bridging Web3 and Web2 finance for instant, automated fiat settlement.</p>
              </div>
              <div className="p-6 border border-blue-700 rounded-xl bg-blue-900/20">
                <h3 className="text-xl font-bold text-blue-300">DRTL-Hook</h3>
                <p className="mt-2 text-sm text-blue-400">Economic Layer: Dynamic Liquidity Engine</p>
                <p className="mt-4 text-gray-300">Leverages real transaction data to intelligently provide liquidity, stabilize price, and channel profits back into ecosystem growth.</p>
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
      </main>

      <Footer />
    </div>
  );
}









