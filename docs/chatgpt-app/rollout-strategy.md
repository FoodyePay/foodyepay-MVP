# Rollout Strategy

## Phased Launch
1. **Internal Alpha (Week 0-2)**
   - Employees and select contractors.
   - Objectives: validate tool coverage, gather usability feedback.
   - Metrics: task success rate >85%, no Sev-1 incidents.
2. **Closed Beta (Week 3-6)**
   - 25 diners + 5 restaurant partners under NDA.
   - Provide weekly feedback survey and office hours.
   - Gate reward issuance amounts to <$25.
3. **Production Launch (Week 7)**
   - Public availability in ChatGPT App Store.
   - Announce via blog, email, and social.

## Readiness Checklist
- ✅ Tool functionality covered by automated regression suite.
- ✅ Support runbooks finalized and staff trained.
- ✅ Safety review sign-off (security, legal, compliance).
- ✅ Monitoring dashboards and alert thresholds tuned.
- ✅ Documentation package submitted (this folder).

## Metrics & Observability
- Activation: % of eligible diners who connect within 30 days.
- Engagement: Weekly active users, average tool invocations per session.
- Retention: 30-day repeat usage of reward tools.
- Reliability: Error rate <1%, latency <2s p95.

## Risk Mitigation
- Feature flag to disable reward issuance tool independently.
- Rollback plan: revert MCP server to previous tag; disable App in App Store if critical bug.
- Communication plan drafted in support document.

## Growth Experiments (Post-Launch)
- Dynamic reward suggestions based on dining history.
- Restaurant-side tools (menu updates, loyalty campaigns).
- Partnership placements within Coinbase Wallet and Base ecosystem newsletters.
