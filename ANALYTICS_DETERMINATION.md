# Analytics on MetaX.Academy — Conflict Analysis and Draft Determination

| | |
|---|---|
| **Subject** | Google Analytics 4, measurement ID `G-CW83DL65QB`, on every page |
| **Status** | **Draft for the Curator's decision.** Not yet a ratified determination |
| **Filed** | 2026-10-01 |
| **Defect** | [DEF-2026-062](/about/status/defects/) (open) |
| **Instruments touched** | MX-000 §0.4 / §0.8 · MX-003 §3.1–§3.5 · MX-009 · ML-2.3 Part H (HX-04, HX-05/H5, HX-15, HX-24; §H.3(a)(vii), §H.9, §H.20) · ST-19 |

> **This is not legal advice.** "Not allowed" here means *not allowed under MetaX's own
> published instruments*. Those instruments are stricter than the law. Only one point (§4)
> concerns actual law, and qualified counsel should review it.

---

## 1. Summary

1. **Putting an analytics tag on a website is not illegal.** Millions of sites run GA4.
2. **For MetaX, it contradicted the estate's own published commitments.** MX-003 (Privacy
   Notice) says that reading a MetaX page *"sets no cookie, and loads no third-party script"*
   and that *"No analytics script runs."* GA4 does both on every page.
3. **The most serious problem was the gap between conduct and claims, not the tag.** Running
   GA4 while five live pages still said "no third-party analytics" would be the conduct that
   HX-15 (ethics laundering) and the absolute **§H.3(a)(vii)** (false compliance
   representation) describe. Those sentences were corrected in the same change that added the
   tag (see §6), and the change was logged as DEF-2026-062.
4. **The tag can be legitimate.** The minimisation duty that analytics engages (§H.9, from
   HX-05/H5) is **expressly not absolute**. The register says that *"surveillance for
   legitimate, proportionate and accountable purposes is not refused."* §3 sets out the case,
   and §5 sets out the conditions that make it hold.
5. **"For the good future of MetaX" is a reason, but not on its own enough.** The register
   anticipates this argument and rejects it: the test is *"not 'do we trust the current
   holder?' but 'what does this dataset make possible for its worst future holder?'"* (H5).
   Good intent therefore has to be turned into **configuration, retention limits and
   publication**. §5 is that conversion.

---

## 2. What the tag conflicts with, instrument by instrument

| # | Instrument | Text (verbatim or close paraphrase) | How GA4 conflicts | Severity |
|---|---|---|---|---|
| C1 | **MX-003 §3.1** Principle | "reading a MetaX page requires no account, sets no cookie, and loads no third-party script." | GA4 loads `googletagmanager.com` and sets `_ga` / `_ga_<ID>` cookies. | Direct contradiction |
| C2 | **MX-003 §3.2** Reading a public page | "Edge server logs… retained 30 days for security and aggregate traffic measurement. **No cookie is set. No analytics script runs.** Aggregate counts are derived at the edge and stored without IP." | Measurement moves from the edge (no IP stored) to a third party with its own retention. | Direct contradiction |
| C3 | **MX-003 §3.3** Not collected | "No behavioural advertising identifiers. No cross-site tracking…" | Default GA4 is first-party and not cross-site. However, **Google signals** and **ad-personalisation** links, if switched on, would breach this. | Conditional: avoided by config (§5, K2) |
| C4 | **MX-003 §3.5** Processors | "Adding a processor is a publishable event." Each processor is listed by name, jurisdiction and function. | Google is a new processor. It must appear in the processor register with a changelog entry. | Procedural: cured by publication |
| C5 | **MX-018** Retention | Server logs 30 days. | GA4 defaults to 2 months of event-level data, and up to 14 months if changed. | Conditional: set to 2 months and publish |
| C6 | **ML-2.3 HX-04** "In this estate" | "no behavioural advertising anywhere in the estate, ever, **and no third-party analytics**." | That statement is no longer true. | Must be amended |
| C7 | **HX-05 / H5, §H.9** Minimisation and horizon duty | Collection limited to function, retention bounded and stated, and a **written worst-future-holder assessment** for any Work that assembles a person-level dataset. **Not absolute.** | GA4 assembles pseudonymous person-level event streams. The duty applies, but compliance is possible. | Duty: satisfiable (§5) |
| C8 | **ST-19** Two-plane separation | "the content plane holds no identity at all, so … the estate's traffic is unobservable **by construction** rather than by policy." | The content plane becomes observable *by policy*: minimised, but no longer impossible. | Real downgrade; must be stated honestly |
| C9 | **MX-000 §0.4.1** Attention-economic mechanics | "no metric that rewards time spent over evidence produced." | GA4 reports "engagement time". That is allowed as a reading, but **using it as a target** would breach §0.4.1. | Conditional: forbidden as a KPI (§5, K7) |
| C10 | **HX-24, §H.3(a)(vi)** (absolute) | No behavioural profiling against a known or notified minor. | Only if GA4 data were used for targeting. Ads personalisation off and no User-ID keep this element out of reach. | Avoided by config |
| C11 | **HX-15, §H.3(a)(vii)** (absolute), **§H.20** | Representing compliance as evidence that a harm is absent, with no assessment; duty to publish adverse findings. | Live pages said "no third-party analytics" while the tag ran. | **Cured** in the same commit (§6) |
| C12 | **MX-000 §0.8** Amendment | Amendments are published **before** they take effect. One that takes effect unpublished is **void**. §0.4 refusals need a reason that "addresses the argument the original made". | The tag went live before this determination was published. | **Open.** See §7 |

**Not engaged:** MX-009 ("no third-party scripts beyond the declared provider") governs
*advertising* slots, not analytics. MX-022 (identity is "not for measuring engagement")
governs the identity plane, which GA4 does not touch.

---

## 3. The case for permitting analytics

These reasons engage the original argument, as MX-000 §0.8(4) requires. Simply restating the
new position would not count.

### R1. The governing duty is a duty, not a prohibition
H5 explains why it produces "a minimisation duty rather than a prohibition": *"a blanket
refusal would forbid epidemiology, security engineering and fraud prevention."* MetaX has not
placed analytics among the seven absolutes. The register's own design principle, *"a register
in which everything is absolute is one in which nothing is"*, argues against treating it as
one in practice.

### R2. MetaX already accepted the purpose; only the means changed
MX-003 §3.2 already collects data "for security and aggregate traffic measurement". Aggregate
measurement is an approved purpose. The open question is whether a third-party tool may carry
out that approved purpose, which is a smaller question than whether MetaX may measure at all.

### R3. Correctability needs measurement
The estate's DNA includes **correctability**, and its Method relies on falsifiers. Questions
like "Do readers who land on a harm page reach its falsifier section?", "Which pages answer
404s from old links?" and "Does the Arabic audience find the estate at all?" (DEF-2026-060,
HX-25) cannot be answered from 30-day edge logs. Those logs have no referrers, no page paths
after redirects, and no search-query data. **An estate that publishes falsifiers but cannot
observe whether they are read is making claims about itself that it cannot check.** That is
the HX-15 pattern applied to itself.

### R4. Discoverability is the precondition for the mission
This change also restructured the estate's SEO (sitemap, canonical URLs, structured data).
SEO is falsifiable only with measurement: which pages are indexed, which queries reach them,
which descriptions fail. Search Console covers part of this. GA4 covers landing behaviour.
Without either, the SEO work cannot be tested.

### R5. The scale gate puts MetaX in the lightest tier
Under **§H.2-bis**, a deployment affecting fewer than 10,000 persons a year owes the seven
absolutes in full, and its duties reduce to a one-page **Part H Statement** naming the
applicable harms. MetaX is a demo estate in that tier. The proportionate response is to
**name HX-05 as applicable in the Statement, with a mark of "narrowed, not discharged"**. A
prohibition is not the proportionate response.

### R6. Funding supports the independence the Charter protects
MX-001 funds the estate partly through one advertising slot (MX-009). Ad networks and
partners judge sites on audited traffic. Measured, honest traffic figures make the estate
less dependent on any single revenue source. That supports the refusals in §0.4, including
"no sponsorship that touches editorial content".

### R7. The worst-future-holder risk can be bounded at design time
The H5 test asks what the dataset allows its worst future holder to do. With the
configuration in §5, the dataset GA4 holds is pseudonymous, never joined to accounts (the
identity plane is separate under ST-19), kept for two months, and without IP addresses (GA4
does not log or store them). Its worst future holder learns that *an unidentified browser read
a page about the License*. That is a real exposure, but a bounded one, and it can be stated in
advance. The register's own falsifier recognises this kind of narrowing: *"where it is
genuinely deployed this register recognises the narrowing rather than ignoring it."*

### What does **not** count as a reason
"It is for the good future of MetaX" is a statement about the **current holder's intent**.
H5 rejects intent as the test, using the case of the 1930s Dutch civil registry, which was
compiled for benign purposes and later misused. The reasons above are allowable because each
one depends on **what the data is and how long it exists**, not on who holds it today.

---

## 4. The one point of actual law: cookie consent

GA4 sets non-essential cookies. In the **EEA, the UK and Switzerland**, the ePrivacy rules
(PECR in the UK) generally require **prior consent** before those cookies are set. Since March
2024, Google also requires **Consent Mode v2** for EEA traffic measurement. The current
snippet sets cookies on load for every visitor, everywhere.

- **Outside those regions** (including most of the Arabic-market audience), the snippet as
  installed is ordinary practice, provided the privacy policy discloses it. It now does.
- **Inside them**, the tag should not set cookies before consent. Condition K1 below fixes
  this.

Counsel should confirm the position for each jurisdiction where MetaX operates. MX-003 §3.6
already assumes this review.

---

## 5. Conditions: how the tag becomes compliant

All of these together. Each condition gives a falsifier: a test that proves the condition has
failed.

| # | Condition | How | Falsifier |
|---|---|---|---|
| **K1** | **Consent first in the EEA/UK/CH** | Consent Mode v2 with `analytics_storage: 'denied'` by default in those regions, plus a plain banner with equal *Accept* and *Decline* buttons. No dark patterns, per MX-009 | A first visit from an EEA IP sets `_ga` before any click |
| **K2** | **No advertising or cross-site features** | GA4 Admin: **Google signals off**, **ads-personalisation off**, no Google Ads link. Code: `allow_google_signals: false`, `allow_ad_personalization_signals: false` | Either toggle found on |
| **K3** | **Retention ≤ 2 months** | GA4 Admin → Data retention → 2 months. Published in MX-018 | Setting found above 2 months |
| **K4** | **No identity join** | No `user_id`, and no account, email or credential data sent. ST-19 is unchanged | Any `user_id` or PII in a payload |
| **K5** | **Processor register entry** | Google Ireland / Google LLC, analytics, US transfers under the EU–US DPF/SCCs. Changelog entry | Register lacks the entry |
| **K6** | **Worst-future-holder assessment** | One page, published with this determination (template in §8) | Assessment absent |
| **K7** | **No engagement targets** | Engagement time, session duration and pages per session may be *read* but never set as goals, KPIs or A/B success metrics (MX-000 §0.4.1) | Any goal or report that optimises time spent |
| **K8** | **Honest disclosure everywhere** | Privacy policy, advertising policy, demo notice, Part H Statement (HX-04, HX-05) | Any live page saying "no analytics" |
| **K9** | **Annual review with a sunset** | Re-decided at the annual §H.16 review. If R3/R4 produced no decision that cited analytics data, remove the tag | Review not held |

**Hardened snippet for K1, K2 and K4** (proposed, not yet installed; it replaces the current
snippet in `tools/seo-head.js`):

```html
<!-- Google tag (gtag.js) -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied',
    region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV',
             'LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']
  });
  gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied' });
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CW83DL65QB"></script>
<script>
  gtag('js', new Date());
  gtag('config', 'G-CW83DL65QB', {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
</script>
```

A consent banner then calls `gtag('consent','update',{analytics_storage:'granted'})` when the
visitor accepts. Every page still has exactly one Google tag.

### The cleaner alternative, stated so the choice is not hidden
**Cloudflare Web Analytics** is cookieless, stores no IP, sets no identifier, and runs on the
platform the estate already uses (`platform-architecture.md` Part 12 already maps MX-003 Class 1, "Aggregate
analytics", to the Cloudflare Analytics API). It fits MX-003 §3.2 almost word for word, so
**C1, C2, C3, C5, C8 and §4 would not arise at all.** It cannot provide what GA4 provides:
audiences, Search Console integration, or event funnels. If R3 and R4 can be met with page
views, referrers and countries, the minimisation duty points to Cloudflare, not GA4. Choosing
GA4 anyway is legitimate, but the published reason should say why the extra capability is
needed.

---

## 6. What this change has already done

- Installed the Google tag exactly as issued, once per page, directly after `<head>`, on all
  351 HTML pages.
- Removed the false statements (C11) from: `privacy.html` §6 (now names GA4, cookies, data
  and opt-out); `content/about/legal/_hub.md`; `content/about/legal/advertising.md`;
  `content/about/universe/demo-notice.md`; `content/about/_hub.md`;
  `content/license/harms/stratum-ii-relational.md` (HX-05 marked *narrowed, not discharged*);
  `content/license/statement/ours.md` (HX-04).
- Logged **DEF-2026-062** (open) in the public defect log, as §H.20 requires.

## 7. What is still open (C12, plus K1–K9)

1. **MX-000 §0.8 timing.** The tag took effect before this reasoning was published. A strict
   reading of §0.8(3) says the change in posture is void until this determination is
   published. MX-003 is a corpus instrument, not the Charter, but the estate applies the same
   rule to itself. **The remedy is to publish:** ratify this determination (as written or
   amended), publish it at `/about/status/determinations/`, and record the effective date.
   Pulling the tag until ratification is the stricter alternative.
2. Choose **GA4 + K1–K9** or **Cloudflare Web Analytics**. Either is defensible. Keeping GA4
   without the conditions is not.
3. Make the MX-003 amendment below.

### Draft amendment to MX-003 §3.2, "Reading a public page"
> Edge server logs recording IP address, user agent, requested path, and timestamp, retained
> 30 days for security and aggregate traffic measurement. **In addition, the content plane
> runs one analytics script, Google Analytics 4, which sets first-party cookies (`_ga`,
> `_ga_<ID>`) and records pseudonymous page-view events — page, referrer, approximate
> location, device type — retained 2 months. Where the law requires consent, the script sets
> no cookie until you consent. Google signals and advertising features are disabled; no
> account or identity data is ever sent. The data is used only in aggregate, never as an
> engagement target, and is re-decided annually.** Superseded text retained in the Archive
> Register.

The matching edit to §3.1 deletes "and loads no third-party script". The superseded wording
is kept, not erased, per §0.8(2).

## 8. Worst-future-holder assessment (template, K6)

| Question | Answer under K1–K9 |
|---|---|
| What is held? | Pseudonymous cookie ID; pages viewed; referrer; coarse location (city/country); device/browser |
| What is not held? | IP (GA4 does not store it), name, email, account, credential, payment, User-ID |
| For how long? | 2 months event-level; aggregates indefinitely |
| Joinable to MetaX identity? | No. ST-19 plane separation; no `user_id` |
| Joinable by Google to other data? | Limited when Google signals and ads features are off; not zero. Stated, not denied |
| Worst holder learns | "An unidentified browser in city X read the BCIA page on date Y." |
| Sensitive inference risk | Reading pages on religion-adjacent ethics (Tajassus, Amanah) or bio-computation could suggest interests. Aggregate-only use and 2-month retention bound it |
| Minors | Not directed at under-13s (privacy §8); no profiling; HX-24 safe harbour (ii) and (iii) held |
| Residual | HX-05 *narrowed, not discharged*. Marked so in the Part H Statement |

---

*Prepared as drafting work product for the Curator. The decision is not among the four powers
MX-000 §0.5 places beyond him, so it is his to make. Its publication is governed by the
§0.8 rule applied in §7. This document makes neither the decision nor the publication.*
