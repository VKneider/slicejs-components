# Security Policy

## Supported versions

This repository is the **live component registry**. There are no versioned releases: only the
current `master` is supported. Components installed with `slice get` are copied into consumer apps,
so a fix here reaches consumers on their next install or re-copy.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

**Preferred:** GitHub private vulnerability reporting —
https://github.com/VKneider/slicejs-components/security/advisories/new

**Fallback:** `security@vkneider.dev` with `SECURITY` in the subject.

Please include:

- the affected component, parser or docs surface
- a minimal reproduction (a clean Slice app importing the component is ideal)
- impact and attack surface
- any suggested fix
- whether you plan to disclose publicly

Do not include secrets, tokens or real user data in the report.

## What to expect

- We aim to acknowledge within 3 business days.
- We will triage severity and confirm next steps within 7 business days.
- Fix timing depends on severity; we will keep you informed.
- We will credit you unless you ask to stay anonymous.

## Scope

In scope:

- Visual and Service component source
- the component registry and its install/build pipeline
- the markdown parser and generated documentation pages
- sanitization helpers and rich-text handling
- the documentation server's request handling

Out of scope:

- vulnerabilities in third-party dependencies (report them upstream)
- example content or demo-only pages that do not ship to consumers
- social engineering
- volumetric denial of service
- issues that require compromised credentials or a compromised device

If you are unsure where a report belongs, report it privately and we will route it.

## Safe harbor

Good-faith research is welcome. Do not access data that is not yours, do not run destructive tests,
and give us reasonable time to fix the issue before public disclosure.

## Security practices

- Do not commit secrets, tokens or credentials.
- Keep dependencies up to date.
- Report suspected leaks or exposed configuration privately.
