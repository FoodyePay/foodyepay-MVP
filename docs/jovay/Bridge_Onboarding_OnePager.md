# FOODY (Foodye Coin) — AntChain/Jovay Bridge Onboarding One-Pager

Date: {YYYY-MM-DD}
Version: v1.0 (Draft for Review)
Primary Contact: {Name, Title} · {Email} · {Telegram/WeChat} · {Phone}
Secondary Contact: {Name, Title} · {Email}
Official Site: https://foodyepay.com  · Docs: https://docs.foodyepay.com  · GitHub: https://github.com/FoodyePay

---

## 1) Asset Metadata
- Token Name: FOODY (Foodye Coin)
- Symbol: FOODY
- Decimals: 18
- Chain Origin: Base Mainnet (Canonical)
- Origin Contract (Base): 0x{BASE_TOKEN_ADDRESS}
- Proposed Mapping on Jovay: Wrapped FOODY (wFOODY) or canonical FOODY per AntChain guidance
- Proposed Jovay Contract: 0x{JOVAY_TOKEN_ADDRESS or TBA}
- Total Supply: {Fixed/Elastic}. If fixed: {TOTAL_SUPPLY} FOODY. If elastic: governed by {governance model}.
- Token Standard: ERC-20 (OpenZeppelin), pausable=false, mintable={true/false}, burnable={true/false}
- Explorers: BaseScan link, (future) JovayScan link

## 2) Brand and Legal Attestations
- Trademark: “FOODYE COIN” and “FOODYEPAY” filed/registered (jurisdictions: {US/CN/...})
- Ownership: {Legal entity name}, registration ID {ID}, principal office {Address}
- IP/Logo: Provided in vector (SVG/PNG) with license statement for use in AntChain bridge UI and ecosystem
- Official Links Proof: Domain verification via DNS TXT can be provided upon request
- Impersonation Policy: Public notice to discourage unofficial mappings. We request AntChain to mark FOODY as official once onboarded

## 3) Governance and Security
- Admin Keys: {EOA/Multi-sig}. Target: {Threshold}/{Owners} multi-sig (e.g., 2/3 Gnosis Safe)
- Custody of Reserves: Reserves locked on Base in audited vault/bridge escrow
- Emergency Controls: Bridge pause/limits, mint/burn roles, incident response procedure within {X} hours
- Audits: Links to smart contract audits (token/vault/relayer). If pending, attach planned auditor and timeline
- Monitoring: On-chain alerts (e.g., OpenZeppelin Defender/Matrix/Telegram) for large mints, role changes, anomalies

## 4) Proof-of-Reserves (PoR)
- Model: 1:1 issued on Jovay vs. locked on Base
- Reserve Address (Base): 0x{RESERVE_VAULT}
- Issuance Address (Jovay): 0x{JOVAY_ISSUER}
- Attestation: Public dashboard + signed Merkle proofs (if applicable). We consent to AntChain displaying reserve/issued balances and deltas

## 5) Operational Details
- Supported Directions: Base → Jovay, Jovay → Base (burn-and-release / lock-and-mint)
- Limits: Per-tx cap {X}, daily cap {Y} (adjustable by governance; rationale: risk controls)
- Fees: Bridge fee {bps or flat}; gas paid by user
- Finality/SLAs: Target settlement time {T} minutes; reorg handling policy per AntChain best practices
- Wallet UX: EVM-compatible. We can provide TokenList JSON, icon, and chain config for wallet teams

## 6) Compliance
- KYC/AML: We comply with applicable AML/CTF requirements for operators and treasury signers
- Sanctions: Screening lists enforced for custodial operations
- Data: No PII on-chain. Any off-chain data follows applicable privacy laws

## 7) Integration Artifacts (Attached/Links)
- Token contract source (verified), ABI
- Reserve vault contract source (verified), ABI
- Audits (PDF)
- Brand kit (logo, color, typography)
- TokenList entry (JSON)
- Public docs: Bridge FAQ and risk disclosures

## 8) Requests to AntChain/Jovay
- List FOODY as the official canonical mapping once PoR and governance checks pass
- Publish FOODY in supported assets list and wallet registry
- Provide testnet/Mainnet endpoints and required chain plugin details for integration testing

## 9) Points of Contact
- Business: {Name/Title/Email}
- Technical: {Name/Title/Email}
- Security/Abuse: {Email}

---

Notes:
- This is a preparatory package for Route B (cooperation/whitelist). For Route A (native token on Jovay), we will maintain a clear disclaimer that it is not the official mapping until AntChain Bridge onboarding is complete.