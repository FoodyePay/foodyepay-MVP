import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { CheckCircle, Cpu, Database, Layers, Zap, FileText, Users, Gamepad2, GraduationCap, Code2 } from 'lucide-react';

export default function TechnologyPage() {
  return (
    <div className="bg-black text-white">
      <Header />
      <main className="py-20 px-4">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            The Technology Powering FoodyePay
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-300">
            We've built a robust, decentralized infrastructure to redefine payment processing for real-world businesses, starting with restaurants. Our system is designed for security, speed, and scalability.
          </p>
          <div className="mt-10">
            <a 
              href="/whitepaper" 
              className="group inline-flex items-center px-8 py-4 text-lg font-bold rounded-full text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <FileText className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Read the Whitepaper
            </a>
          </div>
        </section>

        {/* Dual-Helix Hooks Vision */}
        <section className="py-20 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            The Dual-Helix Hooks: Our Core Innovation
          </h2>
          <p className="mt-4 text-lg text-gray-300 text-center">
            Our system is built on two interconnected Uniswap V4 hooks that create a self-sustaining economic engine.
          </p>
          <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
            <div className="p-8 border border-purple-700 rounded-xl bg-purple-900/20">
              <h3 className="text-2xl font-bold text-purple-300">RwaSettlementHook</h3>
              <p className="mt-2 text-sm text-purple-400">Application Layer: Atomic Payment Settlement</p>
              <p className="mt-4 text-gray-300">
                This hook transforms Uniswap into a global payment rail. When a diner pays, the RwaSettlementHook intercepts the transaction, atomically swaps the payment token (FOODY) to USDC, and initiates an instant fiat off-ramp via Stripe. This bridges the gap between Web3 speed and Web2 financial infrastructure, enabling near-instant settlement to a restaurant's bank account.
              </p>
            </div>
            <div className="p-8 border border-blue-700 rounded-xl bg-blue-900/20">
              <h3 className="text-2xl font-bold text-blue-300">DRTL-Hook</h3>
              <p className="mt-2 text-sm text-blue-400">Economic Layer: Dynamic Real-Time Liquidity</p>
              <p className="mt-4 text-gray-300">
                The DRTL-Hook leverages real-world transaction data from the RwaSettlementHook to dynamically manage liquidity. It intelligently provides concentrated liquidity to the FOODY/USDC pool, minimizing price impact and ensuring stable, efficient swaps. Profits generated from this liquidity provision are then channeled back into the ecosystem to fund rewards and growth, creating a virtuous cycle.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            System Architecture
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
              <Layers className="w-10 h-10 mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-bold">Frontend</h3>
              <p className="mt-2 text-gray-400">A responsive mini-app built with Next.js and React, providing a seamless user experience for both diners and restaurants on any device.</p>
            </div>
            <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
              <Cpu className="w-10 h-10 mx-auto text-blue-400 mb-4" />
              <h3 className="text-xl font-bold">Smart Contracts</h3>
              <p className="mt-2 text-gray-400">Solidity contracts deployed on the Base blockchain, featuring our innovative Uniswap V4 hooks for atomic settlement and dynamic liquidity.</p>
            </div>
            <div className="p-6 border border-gray-800 rounded-xl bg-gray-900">
              <Database className="w-10 h-10 mx-auto text-purple-400 mb-4" />
              <h3 className="text-xl font-bold">Backend & Integrations</h3>
              <p className="mt-2 text-gray-400">Leveraging Google Cloud for scalable infrastructure, Stripe Connect for reliable fiat off-ramping, and Coinbase services for secure wallet interactions.</p>
            </div>
          </div>
        </section>

        {/* Ecosystem Applications Section */}
        <section className="py-20 max-w-6xl mx-auto border-t border-gray-900">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ecosystem Applications: Powered by AloOS
            </h2>
            <p className="text-xl text-blue-400 font-semibold">
              Expanding Beyond Payments
            </p>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Our patent-pending technologies extend the FoodyePay ecosystem into social, gaming, education, and developer tooling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Community & Social */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all group">
              <div className="bg-blue-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Community & Social</h3>
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-blue-400">App #: 63/923,391</span>
                    <span className="text-xs text-gray-500">Nov 23, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Autonomous Multi-Agent Orchestration System</h4>
                  <p className="text-sm text-gray-400 mt-1">For Cross-Domain Community Service Platforms</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-blue-400">App #: 63/918,620</span>
                    <span className="text-xs text-gray-500">Nov 16, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Like-as-a-Reward Social Micropayment</h4>
                  <p className="text-sm text-gray-400 mt-1">"Like = Micropayment" + Asset Allocation Mechanism</p>
                </div>
              </div>
            </div>

            {/* Digital Life & Gaming */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-purple-500 transition-all group">
              <div className="bg-purple-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Digital Life & Gaming</h3>
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-purple-400">App #: 63/920,279</span>
                    <span className="text-xs text-gray-500">Nov 18, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Emotion-Driven Digital Pet Protocol</h4>
                  <p className="text-sm text-gray-400 mt-1">Onchain Emotional Pet + State & Behavior Learning</p>
                </div>
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-purple-400">App #: 63/920,291</span>
                    <span className="text-xs text-gray-500">Nov 18, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Emotion-Driven Autonomous Savings</h4>
                  <p className="text-sm text-gray-400 mt-1">Digital Inheritance Protocol for Onchain Pet Identities</p>
                </div>
              </div>
            </div>

            {/* Education & Growth */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-green-500 transition-all group">
              <div className="bg-green-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Education & Growth</h3>
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-green-400">App #: 63/922,127</span>
                    <span className="text-xs text-gray-500">Nov 21, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Multi-Agent Protocol for Emotion-Adaptive Education</h4>
                  <p className="text-sm text-gray-400 mt-1">Vibe Teaching Agent + Social Learning Host Agent</p>
                </div>
              </div>
            </div>

            {/* Developer Tools */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-orange-500 transition-all group">
              <div className="bg-orange-900/30 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-7 h-7 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Developer Tools</h3>
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-orange-400">App #: 63/915,002</span>
                    <span className="text-xs text-gray-500">Nov 10, 2025</span>
                  </div>
                  <h4 className="font-bold text-gray-200">Universal Web3 Simulation System (SimYourApp)</h4>
                  <p className="text-sm text-gray-400 mt-1">Universal Web3 Application Simulator</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
