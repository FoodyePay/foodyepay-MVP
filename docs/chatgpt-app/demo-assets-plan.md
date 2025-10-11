# Demo Assets Plan

## Goals
- Showcase end-to-end diner reward journey within 5 minutes.
- Demonstrate safety guardrails and refusal behaviors.
- Highlight cross-channel synergy with FoodyePay dashboard.

## Planned Assets
1. **Demo Script** (`docs/chatgpt-app/demo-script.md`)
   - Step-by-step narration for live presentation.
   - Includes expected prompts, tool responses, and fallback lines.
2. **Screen Recording**
   - Capture ChatGPT interface issuing eligibility, issuance, and stats queries.
   - Overlay callouts for important safeguards.
3. **Static Screenshots**
   - Reward eligibility success and failure cases.
   - Support escalation example.
4. **Data Fixtures**
   - Supabase seed file providing sample diners/restaurants for demos.
   - Mock transaction hashes referencing Base testnet.

## Production Timeline
- Script draft: within 3 days of tool freeze.
- Recording: after staging sign-off, target 1 week before submission.
- Screenshot refresh: every major UI change or quarterly, whichever comes first.

## Ownership
- Product Marketing: overall narrative and script.
- Engineering: ensures MCP staging environment mirrors demo data.
- Design: prepares annotations and branding.

## Success Criteria
- Reviewers can reproduce demo steps with provided fixtures.
- Demo highlights at least one refusal scenario to emphasize safety.
- All media stored in shared drive folder `FoodyePay/ChatGPT-App/Demo` with version control.
