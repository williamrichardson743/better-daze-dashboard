# Better Daze Vercel Cutover and DNS-Propagation Rollback Runbook

This runbook applies to `better-daze-sf.com` while the root website is served by Vercel. Use it only after the migration branch passes the acceptance workflow. A deployment failure and a DNS failure are different incidents: revert a Vercel alias for a deployment issue; restore DNS records only when DNS was actually changed or is wrong.

The existing public site is client-rendered. The automated route gate therefore verifies HTTP availability and the common public document; the route-level visual, keyboard, form, and mobile checks remain a required browser-review gate before production promotion. The migration workflow deploys a new Vercel preview and runs the HTTP/Shopify-handoff gate automatically for non-fork pull requests and migration-branch pushes. Manual dispatch remains available for a specific preview URL.

## GitHub Actions prerequisites

Before enabling `.github/workflows/migration-acceptance.yml`, add these repository secrets from the linked Vercel project. Do not place values in the workflow file or source code.

| GitHub repository secret | Required source                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| `VERCEL_TOKEN`           | Vercel account token with deployment access to the Better Daze project |
| `VERCEL_ORG_ID`          | The Vercel team or personal scope identifier for that project          |
| `VERCEL_PROJECT_ID`      | The Vercel project identifier currently used for the migration preview |

The workflow intentionally skips Vercel preview provisioning for pull requests from forks because GitHub does not expose repository secrets to untrusted fork code. Those pull requests still receive static checks; a maintainer can run the preview gate after reviewing and copying the branch internally.

The workflow installs dependencies with lifecycle scripts disabled, then explicitly rebuilds `esbuild`. This keeps the CI supply-chain boundary narrow while allowing the project’s Vite and server bundle steps to run deterministically.

## Required information before production

Record the following in the release issue or pull request before a production promotion: the Vercel team and project that currently serve the root domain, the planned deployment URL, the known-good deployment URL, the current apex and `www` configuration, the rollback owner, and a current screenshot of domain mappings.

| Field                             | Required value                    |
| --------------------------------- | --------------------------------- |
| Current production deployment URL | Known-good URL to restore         |
| Migration deployment URL          | Candidate version being cut over  |
| Vercel team scope                 | Exact team slug or identifier     |
| Root hostname                     | `better-daze-sf.com`              |
| `www` policy                      | Alias or redirect; do not guess   |
| DNS provider and zone owner       | Current production authority      |
| Rollback owner                    | Person who can change aliases/DNS |

## Exact rollback procedure

### Case 1: Preview or production build fails before the domain changes

Stop the release. Do not change aliases or DNS. The existing production deployment remains the active site. Capture the build log, correct the migration branch, redeploy to preview, and restart the acceptance gates.

### Case 2: The Vercel domain alias points to the wrong deployment

1. Stop all related deployment and DNS changes.
2. Open Vercel and confirm the current project, team, root-domain mapping, candidate deployment, and known-good deployment.
3. Promote or assign the **known-good deployment** to `better-daze-sf.com`.
4. Restore the existing `www` routing policy. If `www` has a redirect policy, do not turn it into an alias during an incident.
5. Verify the live root hostname returns the known-good homepage before investigating the migration build.
6. Test the following live paths: `/`, `/inventory`, `/services#inquiry`, `/story`, `/learn`, `/join`, `/legal`, and the link to `https://shop.better-daze-sf.com`.
7. Keep the failed deployment available for comparison; do not delete it.

The equivalent CLI procedure, only when the team and target deployment have been double-checked, is:

```bash
vercel alias set <known-good-deployment-url> better-daze-sf.com --scope <team-slug>
vercel alias set <known-good-deployment-url> www.better-daze-sf.com --scope <team-slug>
```

### Case 3: DNS was changed and is propagating incorrectly

1. Stop all changes. Save the current DNS zone state before editing.
2. Restore the pre-cutover records exactly as captured before release. Restore apex and `www` records as a set; never add competing CNAME/A/ALIAS records to "speed it up."
3. Do not make more edits while authoritative DNS catches up. Recursive resolvers observe changes according to their cached TTLs; this cannot be made instantaneous with repeated record changes.
4. Check the authoritative records, then public DNS resolution, then HTTPS responses at the root hostname and `www` hostname.
5. Once both hostnames resolve as intended, perform the core route test from Case 2.
6. Log the original record, restored record, TTL, timestamp, affected hostname, and validation result.

### Case 4: A live route or conversion path fails after cutover

Immediately use **Case 2** to restore the known-good deployment. A broken restoration form, a missing inventory route, an internal dashboard exposed publicly, or a failed OND Shopify handoff is a cutover failure. Do not wait for DNS propagation if the domain is still correctly routed to Vercel.

## Exit criteria

The incident closes only after `https://better-daze-sf.com` serves the known-good public experience, core routes return expected status/content, the restoration inquiry journey works, and OND links resolve to the existing Shopify storefront. Record the next remediation commit before attempting another cutover.
