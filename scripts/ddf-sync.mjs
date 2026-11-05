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
const PROVINCES = ["Alberta", "British Columbia"];

/* Category rules: first match wins. Words are checked in property type, business type and remarks. */
const CATEGORY_RULES = [
  ["gas-station",   /gas station|service station|fuel|petro|esso|shell|husky|co-op gas/i],
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

async function getAll(token) {
  const provinceFilter = PROVINCES.map(p => `StateOrProvince eq '${p}'`).join(" or ");
  const filter = `(${provinceFilter}) and (PropertySubType ne 'Single Family')`;
  let url = `${API}/Property?$filter=${encodeURIComponent(filter)}&$top=100&$orderby=ModificationTimestamp desc`;
  const rows = [];
  while (url && rows.length < MAX_LISTINGS) {
    const r = await fetch(url, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
    if (!r.ok) throw new Error("API error " + r.status + " " + await r.text());
    const j = await r.json();
    rows.push(...(j.value || []));
    url = j["@odata.nextLink"] || null;
  }
  return rows;
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

function classify(p) {
  const text = [p.PropertySubType, [].concat(p.BusinessType || []).join(" "), p.PublicRemarks].join(" ");
  for (const [cat, rx] of CATEGORY_RULES) if (rx.test(text)) return cat;
  return "other-business";
}
function region(p) {
  if (p.StateOrProvince === "British Columbia") return "bc";
  return /calgary/i.test(p.City || "") ? "calgary" : "alberta";
}
function offering(p) {
  const hasBiz = [].concat(p.BusinessType || []).length > 0 || /business/i.test(p.PropertySubType || "");
  const withProp = /with property|land and building|building included/i.test(p.PublicRemarks || "");
  if (hasBiz) return withProp ? "business_property" : "business";
  return "property";
}

const token = await getToken();
const raw = await getAll(token);
const out = [];
for (const p of raw) {
  const isLease = !p.ListPrice && !!p.LeaseAmount;
  out.push({
    id: "ddf-" + p.ListingKey,
    source: "ddf",
    status: "active",
    type: "commercial",
    category: classify(p),
    offering: offering(p),
    deal: isLease ? "lease" : "sale",
    price: p.ListPrice || null,
    leaseRate: isLease ? p.LeaseAmount : null,
    address: p.UnparsedAddress || "",
    city: [p.City, p.StateOrProvince === "Alberta" ? "AB" : "BC"].filter(Boolean).join(", "),
    region: region(p),
    sqft: p.BuildingAreaTotal || null,
    landSize: p.LotSizeArea ? `${p.LotSizeArea} ${p.LotSizeUnits || ""}`.trim() : null,
    zoning: p.ZoningDescription || null,
    mls: p.ListingId || "",
    title_en: [p.PropertySubType, [].concat(p.BusinessType || []).join(", ")].filter(Boolean).join(" – "),
    desc_en: p.PublicRemarks || "",
    listOffice: await officeName(token, p.ListOfficeKey),
    realtorUrl: p.ListingURL ? (p.ListingURL.startsWith("http") ? p.ListingURL : "https://" + p.ListingURL) : "https://www.realtor.ca/",
    photos: (p.Media || []).sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0)).map(m => m.MediaURL).filter(Boolean).slice(0, 12),
  });
}
await writeFile(OUT, JSON.stringify(out, null, 1));
console.log(`Saved ${out.length} DDF listings to ${OUT}`);
