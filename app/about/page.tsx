"use client";

import { useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to send. Please try again.");
    }
  }

  return (
    <main className="min-h-screen px-6 md:px-10 py-10 max-w-5xl mx-auto text-white">
      <div className="flex items-center justify-center mb-8">
        <Link href="/" aria-label="Go to homepage">
          <img
            src="/FoodyePayLogo.png"
            alt="FoodyePay Logo"
            className="h-20 md:h-24 w-auto drop-shadow-[0_0_16px_rgba(99,102,241,0.35)] hover:opacity-90 transition"
          />
        </Link>
      </div>
      <section className="mb-10">
        <div className="card-premium p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FoodyePay Technology, Inc.</h1>
          <p className="text-zinc-400 mt-2">Company Overview</p>
          <div className="mt-6 space-y-4 text-zinc-200 leading-relaxed">
            <p>
              <span className="font-semibold">FoodyePay Technology, Inc.</span>, a Delaware C-Corporation incorporated on October 2, 2025, is a B2B FinTech company building the next-generation financial infrastructure for the global dining industry.
            </p>
            <p>
              Our core mission is to empower restaurants and their customers by replacing outdated, high-fee payment systems with a modern solution built on blockchain technology.
            </p>
            <p>
              Our initial beachhead market is the 45,000+ Chinese restaurants in the U.S. and their vast customer base. Our long-term vision is to become the premier platform and industry standard-setter for the tokenization of culinary Real-World Assets (RWA), spearheaded by our innovative <span className="font-semibold">FoodyeMenuNFT</span> platform.
            </p>
            <p>
              Our unique dual-ecosystem strategy leverages the strengths of both the Coinbase/Base ecosystem for global compliance and liquidity, and the Ant Group-supported Jovay network for enterprise-grade performance and industrial applications, creating an unparalleled competitive advantage.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="card-premium p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Product</h2>
          <p className="text-zinc-300 mt-3">Our product ecosystem is designed to provide restaurants and diners with an end-to-end, seamless Web3 experience.</p>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold">1. FoodyePay DApp: Your Web3 Dining Payment Gateway</h3>
              <p className="text-zinc-300 mt-2">A mobile-first decentralized application that serves as the user’s portal into our ecosystem. Its core features include:</p>
              <ul className="list-disc pl-6 text-zinc-300 mt-3 space-y-2">
                <li>
                  <span className="font-semibold">Seamless Onboarding & Identity:</span> Through native support for <span className="font-semibold">Coinbase Smart Wallet</span> and <span className="font-semibold">ENS (Ethereum Name Service)</span>, users can securely create and connect their wallets in seconds without managing complex seed phrases, dramatically lowering the barrier to entry.
                </li>
                <li>
                  <span className="font-semibold">Transparent Transactions & Reconciliation:</span> All order records and transaction history are recorded on-chain, providing merchants with an immutable, easily auditable ledger. Our merchant dashboard automates <span className="font-semibold">reconciliation</span>, significantly simplifying financial workflows.
                </li>
                <li>
                  <span className="font-semibold">Flexible Settlement & Withdrawals:</span> Settlement in <span className="font-semibold">USDC</span> offers stability and near-instant, low-cost global fund transfers, while <span className="font-semibold">Foodye Coin (FOODY)</span> powers the ecosystem’s utility and rewards programs. Merchants can <span className="font-semibold">withdraw</span> their funds at any time.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold">2. FoodyeMenuNFT: The RWA Platform for the Dining Industry</h3>
              <p className="text-zinc-300 mt-2">Our most disruptive innovation, the <span className="font-semibold">FoodyeMenuNFT</span> platform serves as the assetization layer of our ecosystem. It is a dedicated platform to tokenize a restaurant’s most valuable intellectual property—its <span className="italic">menu</span>. By minting each dish into an NFT with clear copyright, we help restaurants transform their intangible assets into licensable, tradable, and financeable Real-World Assets (RWA).</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="card-premium p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Contact</h2>
          <p className="text-zinc-400 mt-2">Your submission will be emailed to info@foodyepay.com</p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Name</label>
              <input
                className="input-base focus:ring-indigo-500"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-300">Email</label>
              <input
                type="email"
                className="input-base focus:ring-indigo-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-zinc-300">Message</label>
              <textarea
                className="input-base focus:ring-indigo-500 min-h-[120px]"
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {status === "loading" ? "Sending..." : "Send"}
              </button>
              {status === "success" && (
                <span className="text-emerald-400">Sent! We will get back to you shortly.</span>
              )}
              {status === "error" && (
                <span className="text-red-400">Failed to send: {error}</span>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
