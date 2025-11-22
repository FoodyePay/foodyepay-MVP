import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import { CheckCircle, Cpu, Database, Layers, Zap } from 'lucide-react';

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
          <div className="mt-8">
            <a 
              href="/FoodyePay_Whitepaper.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-200 transition-colors"
            >
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
      </main>
      <Footer />
    </div>
  );
}
