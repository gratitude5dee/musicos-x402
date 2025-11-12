# x402 Integration Security Audit Checklist

## Authentication & Authorization

### Wallet Authentication
- [ ] HMAC signature verification correctly implemented
- [ ] Nonce/timestamp validation prevents replay attacks
- [ ] Token expiry (10 minutes) enforced
- [ ] No wallet address exposed in client-side logs
- [ ] Wallet signature requests use proper message format

### Supabase Authentication
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] RLS policies restrict access to user's own data
- [ ] Service role key never exposed to frontend
- [ ] API keys rotated quarterly
- [ ] JWT tokens have appropriate expiry (24 hours)

### Agent Permissions
- [ ] Agent capabilities properly scoped
- [ ] Tool allowlist enforced at MCP server level
- [ ] Spend limits enforced per agent and per transaction
- [ ] Approval gates work for high-risk operations
- [ ] Agent impersonation prevented

## Payment Security

### Wallet Operations
- [ ] HMAC confirmation token required for all transfers
- [ ] Payload hash prevents parameter tampering
- [ ] Idempotency keys prevent duplicate payments
- [ ] Maximum transaction amount enforced (default 10 SOL)
- [ ] Daily spending limits tracked and enforced
- [ ] Transaction simulation before execution

### Treasury Management
- [ ] Multi-signature support for high-value transactions (>5 SOL)
- [ ] Human-in-the-loop approval for treasury operations
- [ ] Transaction history immutable and auditable
- [ ] Balance checks before transfer execution
- [ ] Crossmint webhook verification

## Data Protection

### Sensitive Data
- [ ] Private keys never stored in database
- [ ] PII encrypted at rest (pgcrypto)
- [ ] Sensitive fields redacted in logs
- [ ] User secrets encrypted with AES-256-GCM
- [ ] Wallet addresses treated as PII

### API Security
- [ ] Bearer token authentication for MCP server
- [ ] CORS properly configured (allowlist domains)
- [ ] Rate limiting on all endpoints (100 req/min)
- [ ] Input validation using Zod schemas
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS protection on user-generated content

### Database Security
- [ ] SQL allowlist enforced (no dynamic SQL)
- [ ] RPC functions use SECURITY DEFINER carefully
- [ ] Connection pooling configured
- [ ] Database backups enabled (daily)
- [ ] Point-in-time recovery configured

## Infrastructure Security

### MCP Server
- [ ] Runs in isolated environment (container/VM)
- [ ] Network egress restricted to approved domains
- [ ] Secrets loaded from secure vault (not env files)
- [ ] TLS 1.3 enforced for all external connections
- [ ] Health check endpoint doesn't leak sensitive info

### Supabase Edge Functions
- [ ] Environment variables properly scoped
- [ ] Function timeout configured (60s max)
- [ ] Error messages don't leak sensitive details
- [ ] Logging excludes sensitive parameters
- [ ] CORS headers properly configured

### Frontend
- [ ] API keys prefixed with VITE_PUBLIC_ only for public keys
- [ ] Secrets never bundled in JavaScript
- [ ] Content Security Policy (CSP) headers set
- [ ] Subresource Integrity (SRI) for CDN resources
- [ ] localStorage cleared on signout

## Monitoring & Incident Response

### Observability
- [ ] All payment operations logged
- [ ] Failed authentication attempts tracked
- [ ] Agent activity audit trail complete
- [ ] PagerDuty alerts configured for critical errors
- [ ] Sentry error tracking enabled

### Incident Response
- [ ] Runbook for security incidents documented
- [ ] Kill switch for disabling agents exists
- [ ] Database rollback procedure tested
- [ ] Customer notification templates prepared
- [ ] Post-mortem template ready

## Compliance

### Regulatory
- [ ] KYC requirements documented for Crossmint
- [ ] Data retention policy defined
- [ ] GDPR compliance (right to be forgotten)
- [ ] SOC 2 requirements assessed
- [ ] AML/CFT considerations documented

### Code Quality
- [ ] Dependency vulnerability scan passing (npm audit)
- [ ] SAST (Static Analysis) scan clean
- [ ] Secrets not committed to Git (git-secrets hook)
- [ ] Third-party audits scheduled (quarterly)
- [ ] Penetration testing completed

## Testing

### Security Tests
- [ ] Authentication bypass attempts fail
- [ ] Authorization escalation attempts fail
- [ ] SQL injection tests pass
- [ ] XSS tests pass
- [ ] CSRF tests pass
- [ ] Rate limiting tests pass
- [ ] Idempotency tests pass

### Load Testing
- [ ] MCP server handles 100 req/s
- [ ] Database connection pool sized correctly
- [ ] Memory leaks not detected
- [ ] No N+1 query patterns

## Sign-off

| Area | Reviewer | Date | Status |
|------|----------|------|--------|
| Authentication | | | ⬜ Pending |
| Payment Security | | | ⬜ Pending |
| Data Protection | | | ⬜ Pending |
| Infrastructure | | | ⬜ Pending |
| Monitoring | | | ⬜ Pending |
| Compliance | | | ⬜ Pending |
| Testing | | | ⬜ Pending |

**Security Lead Approval:**
- Name: _____________________
- Signature: _________________
- Date: _____________________

**Engineering Lead Approval:**
- Name: _____________________
- Signature: _________________
- Date: _____________________
