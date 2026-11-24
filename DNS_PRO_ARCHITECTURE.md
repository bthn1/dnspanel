# DNS PRO – Multi-provider architecture

DNS PRO is the unified UI for multiple DNS services. The provider registry lives in `dns-providers.js`; the existing NextDNS integration remains in `app.js`.

## Provider inventory

| Provider | Initial connection model | Initial capability |
|---|---|---|
| NextDNS | Existing API key + existing proxy | Existing profiles, analytics, logs, lists and supported controls |
| Cloudflare Gateway | Zero Trust account + scoped API token | Adapter required |
| AdGuard Home | Self-hosted instance URL + admin/API credentials | Adapter required |
| Control D | Account API credentials | Adapter required |
| Cisco Umbrella | Organization + OAuth/API credentials | Adapter required |
| Quad9 | Public resolver | Resolver profile metadata |
| Google Public DNS | Public resolver | Resolver profile metadata |
| Mullvad DNS | Public resolver | Resolver profile metadata |
| OpenDNS | Public resolver / optional enterprise integration | Resolver profile metadata |
| Other DNS | User-supplied DoH URL or resolver address | Local resolver profile metadata |
| Pi-hole | Self-hosted instance URL + API access | Adapter required |
| Technitium DNS | Self-hosted instance URL + API access | Adapter required |

## Adapter contract

Each future provider adapter must declare:
- authentication and required account/instance identifiers;
- read/write capabilities separately;
- profile, device, analytics, filtering and policy support;
- pagination, rate limits and provider-specific error mapping.

The UI must only expose a control when the selected adapter advertises that capability. A resolver-only service must never be shown as if it had account analytics, device management or policy APIs.

## Security requirements

- Never put provider API secrets in source code, GitHub Pages assets, URLs, or localStorage.
- Keep secrets in session memory where possible; persisted browser profiles may contain labels and non-secret metadata only.
- Management APIs that require secret credentials need a trusted server-side adapter/proxy with per-user authorization, strict origin checks, rate limiting and secret storage. GitHub Pages alone is a static host and cannot safely perform that role.
- Do not send a credential to a provider until its adapter and endpoint have been implemented and reviewed.
- The current browser implementation does not create DNS settings on the operating system. Resolver profiles saved by the initial UI are metadata only; a platform-specific setup flow is a separate feature.

## Current implementation boundary

The initial provider registry and selector are live. NextDNS continues to use the existing integration. Public resolver selections can be saved as local metadata, and a custom resolver address/DoH URL can be saved. Cloudflare Gateway, AdGuard Home, Control D, Cisco Umbrella, Pi-hole and Technitium are listed but their management adapters are not yet connected. This is intentional: showing an explicit unavailable state is safer than pretending a provider is connected.
