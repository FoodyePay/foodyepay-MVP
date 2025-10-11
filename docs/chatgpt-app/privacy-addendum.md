# Privacy Addendum for ChatGPT Integration

This addendum supplements the FoodyePay Privacy Policy and describes how conversational interactions with the FoodyePay ChatGPT App are handled.

## Data Collected Through ChatGPT
- **User prompts** and **tool invocation context** are processed by OpenAI and FoodyePay to fulfill the request.
- **Tool responses** may contain reward statuses, transaction summaries, or diner profile metadata.
- **No payment credentials** or full personal identifiers are exchanged via the ChatGPT interface.

## Purpose of Processing
- Deliver personalized reward and payment assistance.
- Provide support guidance and troubleshooting steps.
- Improve tool reliability via aggregated usage analytics (anonymized).

## Data Retention
- FoodyePay stores tool execution logs (request ID, tool name, timestamp, result metadata) for up to 90 days.
- Conversation transcripts are retained by OpenAI per its policies; FoodyePay does not receive raw transcripts unless a user opens a support ticket.

## User Rights & Controls
- Users can access or delete FoodyePay-held data through existing dashboard mechanisms or by emailing privacy@foodyepay.com.
- Opt-out: Diners may disable ChatGPT App access in account settings; doing so revokes associated tokens within 24 hours.

## Security Measures
- TLS encryption for all traffic between OpenAI and FoodyePay MCP servers.
- Strict environment segregation between staging and production keys.
- Rate limiting and anomaly detection to prevent abuse.

## Third-Party Sharing
- Data shared only with OpenAI (processor) and Supabase (data host) under existing DPAs.
- No advertising or unrelated third-party sharing.

## Updates to This Addendum
- Material changes will be announced via email and noted in release notes.
- Version history stored in `docs/chatgpt-app/privacy-addendum.md` with timestamps.
