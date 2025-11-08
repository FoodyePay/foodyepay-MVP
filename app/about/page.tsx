import React from 'react';
import { Header } from '../../components/landing/Header';
import { Footer } from '../../components/landing/Footer';
import Link from 'next/link';

const OurStoryPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <main className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Link href="/" aria-label="Go to homepage">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
                    Our Story
                </h1>
            </Link>
          </div>
          
          <div className="space-y-12 text-lg leading-relaxed prose prose-invert lg:prose-xl mx-auto">
            <section>
              <h2 className="text-3xl font-bold mb-4 text-blue-400">The Spark of an Idea</h2>
              <p>
                FoodyePay was born from a simple observation in a bustling restaurant: a passionate owner struggling with razor-thin margins, where the standard 3% credit card fee wasn't just a cost—it was a significant barrier to profitability. The founder, a programming and AI enthusiast with a deep passion for both food and technology, saw a disconnect. In an age of instant communication, why were payments still slow, expensive, and riddled with intermediaries?
              </p>
              <p className="mt-4">
                This question sparked a journey to find a payment system that was fair, transparent, and built for the modern world. The goal was clear: to give power back to the merchants, the creators, the restaurant owners who pour their hearts into their craft.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-blue-400">Navigating the Technical Maze</h2>
              <p>
                The path was far from easy. Early prototypes explored various technologies, but traditional systems always led back to the same problems: centralized control and unavoidable fees. The breakthrough came with the rise of Layer 2 blockchains, specifically Base, with its promise of low fees and fast transaction speeds.
              </p>
              <p className="mt-4">
                This was the foundation. But a foundation is not a house. The real innovation began with a deep dive into the world of decentralized finance (DeFi) and the programmability of modern automated market makers (AMMs). The team asked a bold question: "What if we could embed our entire payment and settlement logic directly into a liquidity pool?"
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-blue-400">The Uniswap v4 Breakthrough</h2>
              <p>
                The announcement of Uniswap v4 and its "hook" architecture was a watershed moment. It was the missing piece of the puzzle. Hooks provided the exact mechanism needed: a way to execute custom code at critical points in a liquidity pool's lifecycle. This was the key to building a truly on-chain, automated, and ultra-low-cost settlement system.
              </p>
              <p className="mt-4">
                Months of intense research and development led to the creation of the <code className="bg-gray-800 p-1 rounded text-sm font-mono">'RwaSettlementHook'</code>. This wasn't just code; it was a new paradigm for real-world asset (RWA) payments. It allowed for atomic, on-chain settlement, splitting payments to the restaurant, calculating taxes, and distributing fees, all in a single, seamless transaction. Our acceptance into the Uniswap Hook Incubator was a powerful validation of this vision.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4 text-blue-400">The Future is Programmatic and On-Chain</h2>
              <p>
                Today, FoodyePay is more than just a payment processor. We are building the financial infrastructure for the next generation of commerce. Our vision extends beyond simple payments to a future of dynamic, data-driven liquidity and programmable finance for small businesses.
              </p>
              <p className="mt-4">
                Our journey is one of relentless innovation, driven by the belief that technology can create a more equitable and efficient world. We started with a simple problem in a restaurant, and now we're building a global solution on the frontier of DeFi. This is just the beginning.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OurStoryPage;
