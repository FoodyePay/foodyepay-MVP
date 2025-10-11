# Safety, Security, and Data Handling

## Data Access Summary
- **Primary data store**: Supabase (PostgreSQL). The MCP server authenticates using service role keys stored in environment secrets.
- **Data types processed**:
  - Diner wallet addresses, emails, reward status.
  - Restaurant business data (names, EIN, contact info) *when verification tools are enabled*.
  - Transaction references and on-chain transaction hashes.
- **Data not stored by the ChatGPT app**: The agent does not persist conversation transcripts or raw user messages. All tool responses derive from FoodyePay systems.

## Authentication & Authorization
- ChatGPT tools are exposed through an MCP server that validates organization-issued credentials before performing privileged operations.
- High-risk tools (reward issuance, payment confirmation) require diner role validation and will add rate limiting before launch.

## Least-Privilege Principles
- Service role keys are injected at runtime via environment variables (never baked into code).
- Each tool performs server-side input validation (wallet format, role, locale) to prevent malformed requests.

## Payment Security
- The ChatGPT app never directly executes on-chain transfers. It triggers backend intents that rely on FoodyePay’s audited smart contracts and secure wallets.
- Wallet keys remain in custody on FoodyePay infrastructure; the agent only references transaction hashes returned by backend services.

## PII & Compliance
- Diner emails / phone numbers appear in responses only when explicitly provided by the user. They remain within Supabase and comply with existing FoodyePay privacy practices.
- The privacy addendum describes how conversational data is interpreted under the FoodyePay privacy policy.

## Abuse Mitigation
- Tools respond with polite refusals when the user lacks proper role permissions (e.g., non-diners requesting rewards).
- Anomaly detection hooks (planned) will log excessive reward issuance attempts and alert the operations team.
- The support workflow offers escalation to human agents for dispute or suspicious activity.

## Incident Response
- Monitoring: structured logs include request IDs, tool names, and timestamps.
- Alerts: integration with Ops Slack channel (planned) for failed or suspicious tool invocations.
- User communication: Support team notifies affected customers via email within 24 hours of a confirmed incident.
