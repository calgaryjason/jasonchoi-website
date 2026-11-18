/* =========================================================
   REALTOR.ca DDF® sync – runs on GitHub Actions (free), once or twice a day.
   It downloads commercial listings from your DDF® feed and writes
   data/ddf-listings.json. The website reads that file.

   Secrets (GitHub → Settings → Secrets and variables → Actions):
     DDF_USERNAME   – your DDF® data feed username (from member.realtor.ca)
     DDF_PASSWORD   – your DDF® data feed password

   NOTE: Field names follow the DDF® Web API docs (https://ddfapi-docs.realtor.ca/).
   Check them once against a real response when the feed is ready.
   ========================================================= */
import { writeFile } from "node:fs/promises";

const TOKEN_URL = "https://identity.crea.ca/connect/token";
const API = "https://ddfapi.realtor.ca/odata/v1";
const OUT = "data/ddf-listings.json";
const MAX_LISTINGS = 600;              // keep the file small
const LOCAL_CITIES = ["Calgary", "Airdrie", "Cochrane", "Chestermere", "Okotoks", "Rocky View County", "Foothills County", "Strathmore", "High River"];
const PROVINCES = ["Alberta", "British Columbia"];

/* Category rules: first match wins. Words are checked in property type, business type and remarks. */
const CATEGORY_RULES = [
  ["gas-station",   /gas station|service station|fuel|petro|esso|shell|husky|co-op gas/i],
  ["grocery",       /grocery|convenience store|supermarket|mini[- ]?mart|c-store|food store|asian market|korean market|ethnic food/i],
  ["car-wash",      /car ?wash|auto ?wash|detailing/i],
  ["liquor-store",  /liquor|wine store|beer store|off[- ]sale/i],
  ["hotel",         /hotel|motel|inn\b|lodge|campground|rv park|hospitality/i],
  ["restaurant",    /restaurant|caf[eé]|coffee|bistro|pub\b|bar\b|pizza|sushi|food service|bakery|dessert/i],
  ["multi-family",  /multi-family|apartment building|fourplex|multi-unit residential/i],
  ["industrial",    /industrial|warehouse|manufactur|shop\b|flex/i],
  ["land",          /vacant land|land only|development land|\bland\b/i],
  ["retail-office", /retail|office|plaza|strip mall|mixed use|commercial unit/i],
];

async function getToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.DDF_USERNAME,
    client_secret: process.env.DDF_PASSWORD,
    scope: "DDFApi_Read",
  });
  const r = await fetch(TOKEN_URL, { method: "POST", body });
  if (!r.ok) throw new Error("Token error " + r.status + " " + await r.text());
  return (await r.json()).access_token;
}

async function fetchPages(token, filter, limit) {
  let url = `${API}/Property?$filter=${encodeURIComponent(filter)}&$top=100&$orderby=ModificationTimestamp desc`;
  const rows = [];
  while (url && rows.length < limit) {
    const r = await fetch(url, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
    if (!r.ok) throw new Error("API error " + r.status + " " + await r.text());
    const j = await r.json();
    rows.push(...(j.value || []));
    url = j["@odata.nextLink"] || null;
  }
  return rows;
}
/* Calgary-area listings first (all of them), then the newest from the rest of Alberta and BC. */
async function getAll(token) {
  const base = "PropertySubType ne 'Single Family'";
  const local = `(${LOCAL_CITIES.map(c => `City eq '${c}'`).join(" or ")}) and StateOrProvince eq 'Alberta' and ${base}`;
  const rest = `(${PROVINCES.map(p => `StateOrProvince eq '${p}'`).join(" or ")}) and ${base}`;
  const first = await fetchPages(token, local, MAX_LISTINGS);
  const seen = new Set(first.map(r => r.ListingKey));
  const more = (await fetchPages(token, rest, MAX_LISTINGS + first.length)).filter(r => !seen.has(r.ListingKey));
  return first.concat(more).slice(0, MAX_LISTINGS);
}

const officeCache = {};
async function officeName(token, key) {
  if (!key) return "";
  if (key in officeCache) return officeCache[key];
  try {
    const r = await fetch(`${API}/Office('${key}')`, { headers: { Authorization: "Bearer " + token } });
    officeCache[key] = r.ok ? ((await r.json()).OfficeName || "") : "";
  } catch { officeCache[key] = ""; }
  return officeCache[key];
}

/* Property type and business type decide first; the description is used only when they say nothing specific. */
function classify(p) {
  const typeText = [p.PropertySubType, [].concat(p.BusinessType || []).join(" ")].join(" ");
  for (const [cat, rx] of CATEGORY_RULES) if (rx.test(typeText)) return cat;
  const remarks = (p.PublicRemarks || "").replace(/liquor licen[cs]e[ds]?/gi, "");
  for (const [cat, rx] of CATEGORY_RULES) if (rx.test(remarks)) return cat;
  return "other-business";
}
const LABEL = { "gas-station": "Gas Station", grocery: "Grocery / Convenience Store", "car-wash": "Car Wash", "liquor-store": "Liquor Store",
  hotel: "Hotel / Motel", restaurant: "Restaurant", "multi-family": "Multi-Family Property", industrial: "Industrial Property",
  land: "Land", "retail-office": "Retail / Office Property", "other-business": "Business" };
const LABEL_KO = { "gas-station": "주유소", grocery: "식료품점·편의점", "car-wash": "세차장", "liquor-store": "리커스토어",
  hotel: "호텔·모텔", restaurant: "레스토랑", "multi-family": "다세대 건물", industrial: "산업용 부동산",
  land: "토지", "retail-office": "상가·사무실", "other-business": "비즈니스" };
function cityOf(p) {
  if (p.City) return p.City;
  const m = (p.ListingURL || "").match(/real-estate\/\d+\/([^/?#]+)/);
  return m ? m[1].split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") : "";
}
/* Some listings come without a province; the postal code tells us (T = Alberta, V = BC). */
function provOf(p) {
  if (p.StateOrProvince === "Alberta") return "AB";
  if (p.StateOrProvince === "British Columbia") return "BC";
  const pc = (p.PostalCode || "").trim().toUpperCase();
  if (pc.startsWith("T")) return "AB";
  if (pc.startsWith("V")) return "BC";
  return /calgary|edmonton|airdrie|cochrane|chestermere|okotoks|red deer|lethbridge|medicine hat|grande prairie|strathmore|high river|canmore/i.test(cityOf(p)) ? "AB" : "BC";
}
function region(p) {
  if (provOf(p) === "BC") return "bc";
  return /calgary/i.test(cityOf(p)) ? "calgary" : "alberta";
}
function offering(p) {
  const hasBiz = [].concat(p.BusinessType || []).length > 0 || /business/i.test(p.PropertySubType || "");
  const withProp = /with property|land and building|building included/i.test(p.PublicRemarks || "");
  if (hasBiz) return withProp ? "business_property" : "business";
  return "property";
}

if (!process.env.DDF_USERNAME || !process.env.DDF_PASSWORD) {
  console.log("DDF login is not set up yet (DDF_USERNAME / DDF_PASSWORD secrets). Skipping – nothing changed.");
  process.exit(0);
}
const token = await getToken();
const raw = await getAll(token);
const out = [];
for (const p of raw) {
  const isLease = !p.ListPrice && !!p.LeaseAmount;
  const cat = classify(p), prov = provOf(p), city = cityOf(p);
  out.push({
    id: "ddf-" + p.ListingKey,
    source: "ddf",
    status: "active",
    type: "commercial",
    category: cat,
    offering: offering(p),
    deal: isLease ? "lease" : "sale",
    price: p.ListPrice || null,
    leaseRate: isLease ? p.LeaseAmount : null,
    address: p.UnparsedAddress || "",
    city: [city, prov].filter(Boolean).join(", "),
    region: region(p),
    sqft: p.BuildingAreaTotal || null,
    landSize: p.LotSizeArea ? `${p.LotSizeArea} ${p.LotSizeUnits || ""}`.trim() : null,
    zoning: p.ZoningDescription || null,
    mls: p.ListingId || "",
    title_en: `${LABEL[cat]} for ${isLease ? "Lease" : "Sale"}${city ? " – " + city + ", " + prov : ""}`,
    title_ko: `${LABEL_KO[cat]} ${isLease ? "임대" : "매매"}${city ? " – " + city + ", " + prov : ""}`,
    subType: [p.PropertySubType, [].concat(p.BusinessType || []).join(", ")].filter(Boolean).join(" – "),
    desc_en: p.PublicRemarks || "",
    listOffice: await officeName(token, p.ListOfficeKey),
    realtorUrl: p.ListingURL ? (p.ListingURL.startsWith("http") ? p.ListingURL : "https://" + p.ListingURL) : "https://www.realtor.ca/",
    photos: (p.Media || []).sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)).map(m => m.MediaURL).filter(Boolean).slice(0, 12),
  });
}
await writeFile(OUT, JSON.stringify(out, null, 1));
console.log(`Saved ${out.length} DDF listings to ${OUT}`);
