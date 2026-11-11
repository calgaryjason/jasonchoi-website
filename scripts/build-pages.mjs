/* =========================================================
   Builds search-friendly pages from your listing data:
     listing/<id>/index.html   – one page per active listing (Google + Facebook previews)
     sitemap.xml               – list of pages for Google
     robots.txt                – tells search engines where the sitemap is
     ko/index.html             – Korean version of the home page
   Runs automatically on GitHub when data/listings.json or data/ddf-listings.json changes.
   Off-market (pocket) listings are never published here.
   ========================================================= */
import fs from "node:fs";
import path from "node:path";

const SITE = "https://jasonchoirealestate.com";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(root, f), "utf8")); } catch { return []; } };

const CAT = { "restaurant":"Restaurant", "gas-station":"Gas Station", "hotel":"Hotel & Motel", "liquor-store":"Liquor Store",
  "grocery":"Grocery & Convenience", "car-wash":"Car Wash", "retail-office":"Retail & Office", "industrial":"Industrial", "multi-family":"Multi-Family",
  "land":"Land", "other-business":"Business" };
const TYPE = { residential:"House", condo:"Condo", townhome:"Townhome", land:"Land" };
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = n => "$" + Math.round(n).toLocaleString("en-CA");
const abs = p => !p ? `${SITE}/assets/jason-choi.jpg` : /^https?:/.test(p) ? p : `${SITE}/${p.replace(/^\//, "")}`;
const isCom = l => l.type === "commercial" || !!l.category;

const listings = read("data/listings.json").filter(l => l.status === "active" && l.id)
  .concat(read("data/ddf-listings.json").filter(l => l.id).map(l => ({ ...l, ddf: true })));

const outDir = path.join(root, "listing");
fs.rmSync(outDir, { recursive: true, force: true });

for (const l of listings) {
  const photos = (l.photos && l.photos.length ? l.photos : (l.photo ? [l.photo] : [])).slice(0, 5);
  const kind = isCom(l) ? (CAT[l.category] || "Commercial") : (TYPE[l.type] || "Residential");
  const price = l.price ? money(l.price) : (l.leaseRate ? `$${l.leaseRate} / sq.ft.` : "");
  const title = l.title_en || `${kind} – ${l.address}`;
  const place = [l.address, l.city].filter(Boolean).join(", ");
  const descEn = (l.desc_en || "").trim(), descKo = (l.desc_ko || "").trim();
  const metaDesc = `${kind}${price ? " · " + price : ""} · ${place}. ${descEn}`.replace(/\s+/g, " ").slice(0, 155);
  const url = `${SITE}/listing/${l.id}/`;
  const facts = [["Price", price], ["Category", kind], ["Location", place], ["Size", l.sqft ? Number(l.sqft).toLocaleString("en-CA") + " sq.ft." : ""],
    ["Monthly rent", l.monthlyRent || ""], ["MLS®", l.mls || ""]].filter(r => r[1]);
  const ld = { "@context": "https://schema.org", "@type": "Offer", name: title, url, image: photos.map(abs),
    ...(l.price ? { price: l.price, priceCurrency: "CAD" } : {}),
    itemOffered: { "@type": isCom(l) ? "Place" : "Residence", name: title, address: { "@type": "PostalAddress", streetAddress: l.address || "", addressLocality: l.city || "", addressRegion: l.region || "AB", addressCountry: "CA" } },
    offeredBy: { "@type": "RealEstateAgent", name: "Jason Choi", telephone: "+1-403-399-8124", url: SITE } };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}${price ? " – " + esc(price) : ""} | Jason Choi Real Estate</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}${price ? " – " + esc(price) : ""}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:image" content="${esc(abs(photos[0]))}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<link rel="stylesheet" href="/css/style.css">
<style>
body{background:#f4f4f5}.lp{max-width:980px;margin:0 auto;padding:28px 20px 60px}
.lp-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
.lp-top img{height:46px}.lp-ph{display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:22px}
.lp-ph img{width:100%;height:100%;object-fit:cover;border-radius:10px;max-height:420px}
.lp-ph .sm{display:grid;gap:8px}.lp-ph .sm img{max-height:206px}
.lp-card{background:#fff;border-radius:12px;padding:26px;margin-bottom:18px}
.lp h1{font-size:28px;margin:0 0 6px}.lp .pr{font-size:30px;font-weight:800;color:var(--red);margin:8px 0 14px}
.lp table{width:100%;border-collapse:collapse}.lp td{padding:9px 0;border-bottom:1px solid #eee}.lp td:first-child{color:#666;width:40%}
.lp p{white-space:pre-line;line-height:1.7}.lp .cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
@media(max-width:700px){.lp-ph{grid-template-columns:1fr}.lp-ph .sm{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="lp">
  <div class="lp-top"><a href="/"><img src="/assets/logo.jpg" alt="Jason Choi Real Estate"></a><a class="btn btn-red" href="tel:4033998124">(403) 399-8124</a></div>
  ${photos.length ? `<div class="lp-ph"><img src="/${esc(photos[0].replace(/^\//, ""))}" alt="${esc(title)}">${photos.length > 1 ? `<div class="sm">${photos.slice(1, 3).map(p => `<img src="${/^https?:/.test(p) ? esc(p) : "/" + esc(p.replace(/^\//, ""))}" alt="">`).join("")}</div>` : ""}</div>` : ""}
  <div class="lp-card">
    <div class="eyebrow">${esc(kind)}</div>
    <h1>${esc(title)}</h1>
    <div class="muted">${esc(place)}</div>
    ${price ? `<div class="pr">${esc(price)}</div>` : ""}
    <table>${facts.map(r => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td></tr>`).join("")}</table>
    ${descEn ? `<h3 style="margin-top:22px">Description</h3><p>${esc(descEn)}</p>` : ""}
    ${descKo ? `<h3 style="margin-top:22px">매물 소개</h3><p>${esc(descKo)}</p>` : ""}
    <div class="cta">
      <a class="btn btn-red" href="/#${esc(l.id)}">View Photos &amp; Full Details →</a>
      <a class="btn btn-outline" href="/#contact">Contact Jason Choi</a>
    </div>
    ${l.ddf ? `<p class="note" style="margin-top:14px">Listing data from REALTOR.ca DDF®. Listed by ${esc(l.listOffice || "another brokerage")}.</p>` : ""}
  </div>
  <p class="note">Jason Choi, REALTOR® · First Place Realty · (403) 399-8124 · English &amp; 한국어</p>
</div>
</body>
</html>
`;
  fs.mkdirSync(path.join(outDir, l.id), { recursive: true });
  fs.writeFileSync(path.join(outDir, l.id, "index.html"), html);
}

/* ---------- Korean home page: /ko/ (same site, Korean text in the HTML for Google and Naver) ---------- */
{
  let h = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const ko = s => s.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;");
  // Put the Korean text into simple elements, keeping the English in data-en.
  h = h.replace(/<([a-z0-9]+)(\s(?:[^>]*?\s)?data-ko="([^"]*)"[^>]*)>([^<]*)<\/\1>/g,
    (m, tag, attrs, k, en) => `<${tag}${attrs} data-en="${en.replace(/"/g, "&quot;")}">${ko(k)}</${tag}>`);
  h = h.replace('<html lang="en">', '<html lang="ko">')
    .replace(/<head>/, '<head>\n<base href="/">')
    .replace(/<title>[^<]*<\/title>/, "<title>최재봉 부동산 | 캘거리 주거용 & 상업용 리얼터 – 주택, 비즈니스 매매, 리스, 투자</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="2007년부터 활동한 캘거리 REALTOR® 최재봉(Jason Choi). 캘거리 주택·콘도 매매와 식당, 주유소, 호텔, 리커스토어 등 비즈니스 매매, 상업용 리스, 투자 부동산. 한국어 상담 가능.">')
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="최재봉 부동산 – 2007년부터 캘거리 주거용 & 상업용 부동산 전문">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="캘거리 주택 매매와 앨버타·BC의 비즈니스 매매, 상업용 리스, 투자 부동산. 한국어 상담 가능.">')
    .replace('<meta property="og:url" content="https://jasonchoirealestate.com/">', '<meta property="og:url" content="https://jasonchoirealestate.com/ko/">\n<meta property="og:locale" content="ko_KR">')
    .replace('<link rel="canonical" href="https://jasonchoirealestate.com/">', '<link rel="canonical" href="https://jasonchoirealestate.com/ko/">')
    .replace(/href="\/faq\/"/g, 'href="/ko/faq/"');
  fs.mkdirSync(path.join(root, "ko"), { recursive: true });
  fs.writeFileSync(path.join(root, "ko", "index.html"), h);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE}/`, `${SITE}/ko/`, `${SITE}/faq/`, `${SITE}/ko/faq/`, ...listings.map(l => `${SITE}/listing/${l.id}/`)];
fs.writeFileSync(path.join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n") + `\n</urlset>\n`);
fs.writeFileSync(path.join(root, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /studio.html\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${listings.length} listing pages, the Korean page (/ko/), sitemap.xml and robots.txt`);
