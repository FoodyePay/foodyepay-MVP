# Support and Operational Readiness

## Support Channels
- **Primary**: support@foodyepay.com (monitored 9am–9pm PT, 7 days/week).
- **Secondary**: In-product help widget routes to Zendesk queue tagged `chatgpt-app`.
- **Emergency**: PagerDuty rotation `FoodyePay Critical` for outages affecting payments or balance accuracy.

## Response & Resolution Targets
| Severity | Description | Initial Response | Resolution Target |
| --- | --- | --- | --- |
| P0 | Payments blocked, data breach, security incident | 15 minutes | 4 hours |
| P1 | Rewards incorrect, degraded experience, major bug | 1 hour | 1 business day |
| P2 | Minor bug, UX issue | 4 hours | 3 business days |
| P3 | Feature request, general question | 1 business day | Best effort |

## Escalation Workflow
1. Support triages incoming ticket, verifies ChatGPT App user identity.
2. For P0/P1 issues, escalate to on-call engineer and operations lead.
3. Track remediation in Jira project `FOODYE-MCP` with clear owner and ETA.
4. Post-mortem for every P0 within 72 hours, shared internally.

## Tool-Specific Playbooks
- **Reward Eligibility**: Confirm diner wallet, rerun eligibility tool, cross-check Supabase logs.
- **Reward Issuance**: Validate transaction hash in Base explorer, confirm Supabase reward ledger entry.
- **Reward Statistics**: Reconcile totals with daily finance dashboard export.
- Future tools will have appended runbooks before release.

## Monitoring & Alerting
- MCP server logs shipped to Datadog with dashboards for tool latency/error rates.
- Alerts trigger when error rate >2% over 5 minutes or latency >3s p95.
- Supabase row-level security violations trigger notifications to security@foodyepay.com.

## Change Management
- All MCP changes flow through GitHub PRs with dual approval.
- Staging environment mirrors production dataset (sanitized) for regression tests.
- Weekly release window (Wednesdays 10am PT) unless urgent fix is required.

## User Communication
- Status page (status.foodyepay.com) updated for P0/P1 incidents.
- Proactive email notification to affected diners/restaurants when bugs impact balances or rewards.
- Release notes published monthly summarizing ChatGPT App improvements.
