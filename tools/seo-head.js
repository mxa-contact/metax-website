#!/usr/bin/env node
/* =====================================================================
   MetaX.Academy — <head> normaliser: Google tag + SEO meta + JSON-LD
   ---------------------------------------------------------------------
   One idempotent pass over every *.html in the estate. For each page it:

   1. Puts the Google tag (gtag.js, G-CW83DL65QB) immediately after
      <head>, exactly once (an earlier copy is removed first).
   2. Rebuilds the managed SEO block right after the viewport meta:
        title · description · robots · canonical · hreflang (en, x-default)
        Open Graph (type/site/title/desc/url/image+dims+alt/locale)
        article:* (Article pages) · Twitter card · author · icons ·
        web manifest · application-name · color-scheme · referrer
        JSON-LD @graph: EducationalOrganization, WebSite, the page
        (WebPage / CollectionPage / Article / AboutPage) and a
        BreadcrumbList derived from the URL and js/routes.js.
   3. Leaves everything else in <head> (fonts, CSS, hand-written
      JSON-LD, AdSense comments, keywords) untouched.

   Indexing policy (sitemap.xml is written from the same decision):
     index   → hand-authored pages, hubs and leaves with authored Markdown
     noindex → generated "being written" shells (data-mx-shell="generated")
               until their content/*.md exists, 404.html, _nav.html
   Templates article.html / detail.html are expanded in the sitemap to
   their real query URLs; they get no static canonical (JS sets it).

   Usage: node tools/seo-head.js [--dry]     (then commit the diff)
   ===================================================================== */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), cp = require("child_process");
const { inventory } = require("./route-inventory.js");

const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://metax.academy";
const SITE = "MetaX.Academy";
const ORG = "MetaX Academy";
const GA_ID = "G-CW83DL65QB";
const OG_IMAGE = { url: ORIGIN + "/img/og-image.jpg", w: 1200, h: 630, type: "image/jpeg",
  alt: "MetaX.Academy — nine pillars, one standard of mastery" };
const AR_LIVE = fs.existsSync(path.join(ROOT, "ar")); // add hreflang="ar" only once /ar/ exists
const DESC_MAX = 160;
const dry = process.argv.includes("--dry");

/* Exactly the snippet Google Analytics issues for this property. */
const GA_BLOCK =
`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${GA_ID}');
</script>`;

/* Titles that were duplicated across two pages or ran well past the ~60-char
   SERP width. Keyed by file; everything else keeps its authored title. */
const TITLE_OVERRIDES = {
  "academies.html": "Found an Academy — Charter Your Own Under One Standard · MetaX.Academy",
  "credentials.html": "Credentials You Can Defend — Portfolio &amp; Peer Review · MetaX.Academy",
  "toptech.html": "TopTech Academy — The Post-Attention Operator Curriculum · MetaX",
  "ascent.html": "The Meta-X Ascent — Substrate to the Limits of Silicon · MetaX.Academy",
  "about-dna.html": "The Shared DNA — Decay-Aware, Falsifiable, Governed · MetaX.Academy",
  "about-funding.html": "How MetaX Is Funded — Revenue, No Sponsorship &amp; Disclosure",
  "license/falsification/index.html": "Falsification &amp; History — The License's Honesty Layer · MetaX",
  "_nav.html": "Navigation audit harness · MetaX.Academy",
};
const DESC_OVERRIDES = {
  /* Hand-written ≤160-char rewrites of descriptions that ran past the SERP snippet. */
  "about-curator.html": "Who Maher is in relation to MetaX: what he authored, the editorial authority he holds, the powers placed beyond his reach, and the published bus-factor-of-one.",
  "about-dna.html": "The four properties every MetaX pillar, academy and document inherits: decay-aware claims, falsifiable claims, real ethics governance and version control.",
  "about-governance.html": "How MetaX is governed: the ethics veto, credential revocation and the succession instrument — three powers deliberately placed outside the founder's reach.",
  "about-mission.html": "What a MetaX credential asserts: judgement tested under scrutiny. The five-part apparatus on every page, four credential tracks, and what a credential omits.",
  "about-static.html": "Why MetaX split into two planes with a hard boundary: the content plane may be decorated by the identity plane (sign-in, payment) but never depends on it.",
  "about-universe.html": "What MetaX is: an education estate where every substantive claim carries what a stranger needs to find out it is wrong. Its properties, two planes and pillars.",
  "about-what-metax-is-not.html": "MetaX is not an accreditor, an employer, a neutral platform, a wet-lab or attention-economic. Five structural refusals, each with a concrete enforcement point.",
  "about.html": "About MetaX.Academy: an independent educational publisher curated by Maher — the TopTech operator curriculum, Academies Community and MacroLifeTach research.",
  "about/universe/demo-notice/index.html": "The estate is a demo build. This notice separates what is real, what is scaffolding and what is deliberately absent, so you know how much weight a page carries.",
  "academies.html": "Found and teach your own academy inside MetaX: five levels from Applicant to Institution, eleven requirement groups, governance, credentialing and red lines.",
  "ascent.html": "The Meta-X Ascent: a ten-rung research ladder (S38–S47) from the computing substrate, through the limits of binary and silicon, to living computation.",
  "ascent/index.html": "Ascent: the ten-rung research-preview ladder from the computing substrate to the edge of what silicon can do — electron to cell to collective dynamics.",
  "charter.html": "MX-000, the constitutional charter of MetaX: three pillars, the Shared DNA, three absolute refusals, the powers beyond the curator, and how it is amended.",
  "credentials/evidence/index.html": "The evidence a MetaX credential demands: the P0–P3 proof ladder, submission pack, dossier templates, artefact requirements and the AI-disclosure rule.",
  "curriculum.html": "The full TopTech stack: 2 rebuilt flagships and 21 series — GEO/AEO, owned audience, agentic commerce, AI ops, paid media, CRO and more. ~276 courses.",
  "index.html": "An education estate where every claim carries what a stranger needs to prove it wrong. Nine pillars — TopTech to License — one standard. Curated by Maher.",
  "library.html": "The MetaX Library: the stack explainer, symbol, decay and falsifiability standards, the style guide, the bilingual lexicon, correction logs and academy news.",
  "license/harms/index.html": "The register of 25 structural harms of computing across six strata — cognitive, relational, economic, material, reflexive, successor — each with a falsifier.",
  "license/harms/stratum-iv-material/index.html": "Stratum IV, material harms: extractive materiality, digital amnesia and its inverse, custody failure, and moral deskilling through delegated judgement.",
  "license/harms/stratum-v-reflexive/index.html": "Stratum V, reflexive meta-harms: ethics laundering, register closure, semantic capture, remedy foreclosure and interpretive concentration.",
  "license/harms/stratum-vi-successor/index.html": "Stratum VI, successor harms to parties not present to object: irreversibility, unconsented experiments, persuasion asymmetry, synthetic relation and more.",
  "license/statement/ours/index.html": "MetaX.Academy's own Part H Statement under ML-2.3: role, scale tier, applicable harms, and the two — HX-01 and HX-04 — it openly marks unremedied.",
  "metax/bcia/index.html": "BCIA, the gated bio-computational program: what it is and is not, eight series, Document Zero, the human-cell exclusion, governance and the locked gateway.",
  "method/assessment/index.html": "How MetaX assesses: deterministic scenarios, the frozen D1–D5 rubric, the mastery viva, adversarial review, the artefact register and AI disclosure.",
  "method/epistemics/index.html": "How MetaX grades knowledge: evidence classes E0–E4, the decay standard, falsifier grammar, the counterproductivity test and the banned-claim register.",
  "method/instruments/index.html": "The twelve governance instruments: pre-registration desk, adversarial review, decay watch, scenario engine, viva, passport, bounty, ledger and more.",
  "privacy.html": "MetaX.Academy privacy policy: what data is handled, cookies, Google Analytics, advertising from Google AdSense and Adsterra, and how to opt out.",
  "start-here.html": "New to MetaX.Academy? A short diagnostic points you to the right pillar and rung: TopTech operator craft, the Ascent ladder, BCIA, Academies or Credentials.",
  "toptech.html": "TopTech Academy: 2 flagships and 21 series (~276 courses, ~1,656 lessons) for operators on the post-search, post-attention internet. Curated by Maher.",
  "toptech/branch-a/index.html": "TopTech's live core: two flagships rebuilt from mechanism, the 21-series next-level stack, the nine operator surfaces and the operator archetypes.",
  "toptech/branch-c/index.html": "TopTech Branch C, the planned institution-building track: academy builder, curriculum and assessment design, governance and stewardship.",
  "_nav.html": "Internal navigation audit harness for the MetaX.Academy header and mega-menu. Not a content page.",
  "article.html": "An article from MetaX.Academy News — releases, the course roadmap, research briefs and field notes, each dated and open to correction.",
  "detail.html": "A MetaX.Academy curriculum record — a TopTech flagship, a next-level series or a Meta-X research program — with its scope, territory and limits.",
};

/* ---------- helpers ---------- */
const escAttr = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+|#x[0-9a-f]+);)/gi, "&amp;")
  .replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const decode = (s) => String(s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const stripMd = (s) => String(s).replace(/\*\*|__|`/g, "").replace(/\*([^*]+)\*/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

function walk(dir, out) {
  for (const n of fs.readdirSync(dir)) {
    if (n === ".git" || n === "node_modules" || n === "_refs") continue;
    const p = path.join(dir, n), st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out); else if (n.endsWith(".html")) out.push(path.relative(ROOT, p));
  }
  return out;
}

/* URL a file is actually served at (Cloudflare Pages: /x.html 307→ /x). */
function urlFor(rel) {
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  return "/" + rel.replace(/\.html$/, "");
}

/* Shorten to ≤ DESC_MAX at a sentence, then clause, then word boundary. */
function fitDesc(d) {
  d = decode(d).replace(/\s+/g, " ").trim();
  if (d.length <= DESC_MAX) return d;
  const cut = d.slice(0, DESC_MAX + 1);
  const sent = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  if (sent >= 90) return cut.slice(0, sent + 1);
  const clause = Math.max(cut.lastIndexOf("; "), cut.lastIndexOf(" — "), cut.lastIndexOf(", "));
  if (clause >= 110) return cut.slice(0, clause).replace(/[,;:\s—]+$/, "") + "…";
  return cut.slice(0, cut.lastIndexOf(" ", DESC_MAX - 1)).replace(/[,;:\s—]+$/, "") + "…";
}

function frontMatter(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, "utf8").match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  m[1].split("\n").forEach((ln) => { const i = ln.indexOf(":"); if (i > 0) fm[ln.slice(0, i).trim()] = ln.slice(i + 1).trim(); });
  return fm;
}

const gitDateCache = {};
function gitDate(rel) {
  if (rel in gitDateCache) return gitDateCache[rel];
  let d = "";
  try { d = cp.execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: ROOT }).toString().trim(); } catch (e) { /* untracked */ }
  return (gitDateCache[rel] = d || new Date().toISOString().slice(0, 10));
}

function loadGlobals(files) {
  const ctx = { window: {}, location: { pathname: "/" }, console };
  vm.createContext(ctx);
  // news-data.js / data.js declare top-level consts; re-export them onto the context.
  files.forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8") +
    "\n;try{this.NEWS_POSTS=NEWS_POSTS}catch(e){};try{this.SERIES=SERIES;this.FLAGSHIPS=FLAGSHIPS;this.MLT_PROGRAMS=MLT_PROGRAMS}catch(e){}", ctx));
  return ctx;
}

/* ---------- route knowledge ---------- */
const { R, rows } = inventory();
const byUrl = {}; rows.forEach((r) => { byUrl[r.url] = r; });
const pillarFor = (url) => R.MENU.find((m) => url.startsWith(m.href));
function breadcrumb(url, pageName) {
  const items = [{ name: "Home", url: "/" }];
  const segs = url.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  let acc = "/";
  segs.forEach((s, i) => {
    acc += s + "/";
    const last = i === segs.length - 1;
    const r = byUrl[acc];
    if (r) items.push({ name: r.title, url: acc });
    else if (last) items.push({ name: pageName, url });
  });
  if (items.length === 1 && url !== "/") items.push({ name: pageName, url });
  return items;
}

/* ---------- per-page decision ---------- */
function describe(rel, html) {
  const url = urlFor(rel);
  const head = (html.match(/<head>([\s\S]*?)<\/head>/) || [])[1] || "";
  const foreign = head.replace(/<!-- SEO:start[\s\S]*?<!-- SEO:end -->/g, ""); // head minus our own block
  const get = (re) => { const m = head.match(re); return m ? m[1] : ""; };
  const route = byUrl[url];
  const md = route ? frontMatter(route.md) : null;
  const isShell = /data-mx-shell="generated"/.test(head);
  const isTemplate = rel === "article.html" || rel === "detail.html";

  let noindex = rel === "404.html" || rel === "_nav.html" || (isShell && !(route && route.hasMd));

  let title = TITLE_OVERRIDES[rel] || get(/<title>([\s\S]*?)<\/title>/).trim();
  let desc = DESC_OVERRIDES[rel] || get(/<meta name="description"[^>]*content="([^"]*)"/);
  if (md && md.deck && (!desc || decode(desc).length > DESC_MAX) && stripMd(md.deck).length <= DESC_MAX) desc = stripMd(md.deck);
  desc = fitDesc(desc);

  const ogTitleOld = get(/<meta property="og:title"[^>]*content="([^"]*)"/);
  const ogDescOld = get(/<meta property="og:description"[^>]*content="([^"]*)"/);
  const ogTitle = decode(ogTitleOld || title.replace(/\s+[·—]\s+MetaX(\.Academy)?$/, ""));
  const ogDesc = fitDesc(ogDescOld || desc);

  let type = "WebPage";
  if (md && md.jsonld === "Article") type = "Article";
  else if (route && route.kind !== "leaf") type = "CollectionPage";
  else if (rel === "article.html") type = "Article";
  if (/^about(-|\.html)/.test(rel)) type = "AboutPage";
  if (rel === "contact.html") type = "ContactPage";
  if (rel === "search/index.html") type = "CollectionPage";
  const ogType = type === "Article" ? "article" : (rel === "about-curator.html" ? "profile" : "website");

  const modified = (md && /^\d{4}-\d{2}-\d{2}$/.test(md.reviewed || "")) ? md.reviewed
    : gitDate(route && route.hasMd ? route.md : rel);
  const pillar = pillarFor(url);
  return { rel, url, title, desc, ogTitle, ogDesc, noindex, isShell, isTemplate, type, ogType,
    modified, section: pillar ? pillar.label : "MetaX", hasOwnLd: /application\/ld\+json/.test(foreign) && rel !== "index.html",
    pageName: decode(title).replace(/\s+[·—]\s+.*$/, "") };
}

function jsonLd(p) {
  const orgId = ORIGIN + "/#organization", siteId = ORIGIN + "/#website";
  const graph = [
    { "@type": "EducationalOrganization", "@id": orgId, name: ORG, alternateName: SITE, url: ORIGIN + "/",
      logo: { "@type": "ImageObject", url: ORIGIN + "/img/icon-512.png", width: 512, height: 512 },
      image: OG_IMAGE.url, email: "hello@metax.academy",
      founder: { "@type": "Person", name: "Maher" },
      description: "A nine-pillar professional and scientific education estate. Every substantive claim carries what a stranger needs to find out it is wrong." },
    { "@type": "WebSite", "@id": siteId, url: ORIGIN + "/", name: SITE, inLanguage: "en", publisher: { "@id": orgId } },
  ];
  if (p.noindex) return graph.slice(0, 2);
  const crumbs = breadcrumb(p.url, p.pageName);
  const pageUrl = ORIGIN + p.url;
  if (!p.hasOwnLd && !p.isTemplate) {
    const page = { "@type": p.type, "@id": pageUrl + "#webpage", url: pageUrl, name: decode(p.ogTitle),
      description: p.desc, inLanguage: "en", isPartOf: { "@id": siteId }, publisher: { "@id": orgId },
      primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE.url, width: OG_IMAGE.w, height: OG_IMAGE.h },
      dateModified: p.modified };
    if (crumbs.length > 1) page.breadcrumb = { "@id": pageUrl + "#breadcrumb" };
    if (p.type === "Article") Object.assign(page, { headline: decode(p.ogTitle).slice(0, 110), image: [OG_IMAGE.url],
      datePublished: p.modified, author: { "@type": "Person", name: "Maher" }, articleSection: p.section,
      mainEntityOfPage: pageUrl });
    graph.push(page);
  }
  if (crumbs.length > 1 && !p.isTemplate) graph.push({ "@type": "BreadcrumbList", "@id": pageUrl + "#breadcrumb",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: decode(c.name), item: ORIGIN + c.url })) });
  return graph;
}

function seoBlock(p) {
  const L = [];
  const id = (name) => (p.isTemplate && name ? ` id="${name}"` : "");
  const canonical = ORIGIN + p.url;
  L.push(`<title>${p.title}</title>`);
  L.push(`<meta name="description"${id("metaDesc")} content="${escAttr(p.desc)}" />`);
  L.push(p.noindex
    ? `<meta name="robots" content="noindex, follow"${p.isShell ? ' data-mx-shell="generated"' : ""} />`
    : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
  L.push(`<meta name="author" content="Maher — ${ORG}" />`);
  if (!p.isTemplate) {
    L.push(`<link rel="canonical" href="${canonical}" />`);
    L.push(`<link rel="alternate" hreflang="en" href="${canonical}" />`);
    if (AR_LIVE) L.push(`<link rel="alternate" hreflang="ar" href="${ORIGIN}/ar${p.url}" />`);
    L.push(`<link rel="alternate" hreflang="x-default" href="${canonical}" />`);
  }
  L.push("");
  L.push(`<meta property="og:type" content="${p.ogType}" />`);
  L.push(`<meta property="og:site_name" content="${SITE}" />`);
  L.push(`<meta property="og:locale" content="en_US" />`);
  L.push(`<meta property="og:title"${id("ogTitle")} content="${escAttr(p.ogTitle)}" />`);
  L.push(`<meta property="og:description"${id("ogDesc")} content="${escAttr(p.ogDesc)}" />`);
  L.push(`<meta property="og:url"${id("ogUrl")} content="${canonical}" />`);
  L.push(`<meta property="og:image" content="${OG_IMAGE.url}" />`);
  L.push(`<meta property="og:image:secure_url" content="${OG_IMAGE.url}" />`);
  L.push(`<meta property="og:image:type" content="${OG_IMAGE.type}" />`);
  L.push(`<meta property="og:image:width" content="${OG_IMAGE.w}" />`);
  L.push(`<meta property="og:image:height" content="${OG_IMAGE.h}" />`);
  L.push(`<meta property="og:image:alt" content="${escAttr(OG_IMAGE.alt)}" />`);
  if (p.ogType === "article") {
    if (!p.isTemplate) L.push(`<meta property="article:published_time" content="${p.modified}" />`);
    if (!p.isTemplate) L.push(`<meta property="article:modified_time" content="${p.modified}" />`);
    L.push(`<meta property="article:author" content="Maher" />`);
    L.push(`<meta property="article:section" content="${escAttr(p.section)}" />`);
  }
  L.push(`<meta name="twitter:card" content="summary_large_image" />`);
  L.push(`<meta name="twitter:title"${id("twTitle")} content="${escAttr(p.ogTitle)}" />`);
  L.push(`<meta name="twitter:description"${id("twDesc")} content="${escAttr(p.ogDesc)}" />`);
  L.push(`<meta name="twitter:image" content="${OG_IMAGE.url}" />`);
  L.push(`<meta name="twitter:image:alt" content="${escAttr(OG_IMAGE.alt)}" />`);
  L.push("");
  L.push(`<meta name="application-name" content="${SITE}" />`);
  L.push(`<meta name="apple-mobile-web-app-title" content="MetaX" />`);
  L.push(`<meta name="color-scheme" content="dark" />`);
  L.push(`<meta name="format-detection" content="telephone=no" />`);
  L.push(`<meta name="referrer" content="strict-origin-when-cross-origin" />`);
  L.push(`<link rel="icon" href="/favicon.ico" sizes="48x48" />`);
  L.push(`<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`);
  L.push(`<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`);
  L.push(`<link rel="manifest" href="/site.webmanifest" />`);
  L.push("");
  L.push(`<script type="application/ld+json" data-mx-seo>`);
  L.push(JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLd(p) }, null, 1).replace(/<\//g, "<\\/"));
  L.push(`</script>`);
  return "  <!-- SEO:start (managed by tools/seo-head.js — edit the tool, not this block) -->\n" +
    L.map((l) => (l ? "  " + l : "")).join("\n") + "\n  <!-- SEO:end -->";
}

/* Tags the managed block owns; every older copy is removed. */
const MANAGED = [
  /^\s*<title>[\s\S]*?<\/title>\s*$/,
  /^\s*<meta name="(description|robots|author|theme-color|color-scheme|application-name|apple-mobile-web-app-title|format-detection|referrer|twitter:[a-z:_]+)"[^>]*>\s*$/,
  /^\s*<meta property="(og|article):[a-z:_]+"[^>]*>\s*$/,
  /^\s*<link rel="(canonical|icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>\s*$/,
  /^\s*<link rel="alternate" hreflang=[^>]*>\s*$/,
];

function rewrite(rel, html) {
  const p = describe(rel, html);
  let out = html
    .replace(/\n?[ \t]*<!-- Google tag \(gtag\.js\) -->[\s\S]*?gtag\('config', '[^']+'\);\s*<\/script>/g, "")
    .replace(/\n?[ \t]*<!-- SEO:start[\s\S]*?<!-- SEO:end -->/g, "");
  if (rel === "index.html") // superseded by the @graph EducationalOrganization
    out = out.replace(/\n?[ \t]*<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "EducationalOrganization"[\s\S]*?<\/script>/, "");

  out = out.replace(/<head>([\s\S]*?)<\/head>/, (m, inner) => {
    const lines = inner.split("\n").filter((ln) => !MANAGED.some((re) => re.test(ln)));
    let at = lines.findIndex((ln) => /<meta name="viewport"/.test(ln));
    if (at < 0) at = lines.findIndex((ln) => /<meta charset/.test(ln));
    lines.splice(at + 1, 0, '  <meta name="theme-color" content="#05060f" />', seoBlock(p));
    const body = lines.join("\n").replace(/\n{3,}/g, "\n\n");
    return "<head>\n" + GA_BLOCK + body.replace(/^\n?/, "\n") + "</head>";
  });
  return { p, out };
}

/* ---------- sitemap ---------- */
function sitemap(pages) {
  const G = loadGlobals(["js/data.js", "js/news-data.js"]);
  const urls = [];
  /* / 1.0 · pillar hub 0.9 · group hub 0.8 · leaf 0.6 · flat page 0.7 · /search/ 0.5 */
  const prio = (u) => {
    if (u === "/") return "1.0";
    if (u === "/search/") return "0.5";
    if (!u.endsWith("/")) return "0.7";
    const d = u.split("/").filter(Boolean).length;
    return d === 1 ? "0.9" : d === 2 ? "0.8" : "0.6";
  };
  pages.filter((p) => !p.noindex && !p.isTemplate).forEach((p) =>
    urls.push({ loc: p.url, lastmod: p.modified, freq: p.url === "/" || p.url === "/search/" ? "weekly" : "monthly", pri: prio(p.url) }));
  const newsDate = gitDate("js/news-data.js");
  (G.NEWS_POSTS || []).forEach((n) => urls.push({ loc: "/article?id=" + encodeURIComponent(n.slug), lastmod: n.date || newsDate, freq: "yearly", pri: "0.6" }));
  const dataDate = gitDate("js/data.js");
  (G.FLAGSHIPS || []).forEach((f) => urls.push({ loc: "/detail?type=flagship&id=" + encodeURIComponent(f.id), lastmod: dataDate, freq: "monthly", pri: "0.6" }));
  (G.SERIES || []).forEach((s) => urls.push({ loc: "/detail?type=series&id=" + encodeURIComponent(s.n), lastmod: dataDate, freq: "monthly", pri: "0.6" }));
  (G.MLT_PROGRAMS || []).forEach((m) => urls.push({ loc: "/detail?type=program&id=" + encodeURIComponent(m.code), lastmod: dataDate, freq: "monthly", pri: "0.5" }));
  const seen = new Set();
  const order = (u) => (u === "/" ? "" : u);
  const body = urls.filter((u) => !seen.has(u.loc) && seen.add(u.loc))
    .sort((a, b) => order(a.loc).localeCompare(order(b.loc)))
    .map((u) => `  <url><loc>${ORIGIN}${u.loc.replace(/&/g, "&amp;")}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`);
  return { count: body.length, xml: `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by tools/seo-head.js. Every indexable page: hand-authored pages,
     pillar + group hubs, leaves with authored Markdown, news articles and
     curriculum detail pages. "Being written" shells (noindex) are added
     automatically the run after their content/*.md lands. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body.join("\n")}
</urlset>
` };
}

function run() {
  const files = walk(ROOT, []).sort();
  const pages = [];
  let changed = 0;
  files.forEach((rel) => {
    const abs = path.join(ROOT, rel), html = fs.readFileSync(abs, "utf8");
    if (!/<head>/.test(html)) return;
    const { p, out } = rewrite(rel, html);
    pages.push(p);
    if (out !== html) { changed++; if (!dry) fs.writeFileSync(abs, out); }
  });
  const sm = sitemap(pages);
  if (!dry) fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm.xml);
  const idx = pages.filter((p) => !p.noindex).length;
  console.log(`${dry ? "would update" : "updated"} ${changed}/${pages.length} pages · indexable ${idx} · noindex ${pages.length - idx} · sitemap URLs ${sm.count}`);
  return { pages, sitemapCount: sm.count };
}

module.exports = { run };
if (require.main === module) run();
