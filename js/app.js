/* =========================================================
   Jason Choi Real Estate – site script
   Text on the page: English is in index.html, Korean is in data-ko="...".
   Text created by this script: see the D dictionary below.
   ========================================================= */
const SITE = window.SITE || {};
const MAX_PHOTOS = SITE.maxPhotos || 5;
const PAGE = 6;
const $ = id => document.getElementById(id);

/* ---------- Dictionary for script-made text: [English, Korean] ---------- */
const D = {
  all:["All","전체"], allRegions:["All Regions","전체 지역"], calgary:["Calgary","캘거리"], alberta:["Other Alberta","앨버타 기타 지역"], bc:["British Columbia","브리티시컬럼비아"],
  anyPrice:["Any Price","가격 무관"], sortNew:["Newest","최신순"], sortLow:["Price: Low to High","가격 낮은 순"], sortHigh:["Price: High to Low","가격 높은 순"], sortSize:["Size: Largest","면적 큰 순"],
  "c.restaurant":["Restaurant","레스토랑"], "c.gas-station":["Gas Station","주유소"], "c.hotel":["Hotel & Motel","호텔 & 모텔"], "c.liquor-store":["Liquor Store","리커스토어"],
  "c.car-wash":["Car Wash","세차장"], "c.retail-office":["Retail & Office","상가 & 오피스"], "c.industrial":["Industrial","산업용"], "c.land":["Land","토지"],
  "c.multi-family":["Multi-Family","다세대 주택"], "c.other-business":["Other Business","기타 비즈니스"],
  "cs.restaurant":["Restaurants & cafés","레스토랑, 카페"], "cs.gas-station":["Gas & convenience","주유소, 편의점"], "cs.hotel":["Hotel, motel, campground","호텔, 모텔, 캠핑장"],
  "cs.liquor-store":["Liquor stores","리커스토어"], "cs.car-wash":["Self-serve & automatic","셀프, 자동 세차"], "cs.retail-office":["Plazas, retail, office","상가, 오피스"],
  "cs.industrial":["Warehouse & shop","창고, 공장"], "cs.land":["Commercial land","상업용 토지"], "cs.multi-family":["Apartment buildings","아파트, 다가구"], "cs.other-business":["Dry cleaning, salon, etc.","세탁소, 미용실 등"],
  sale:["For Sale","매매"], lease:["For Lease","리스"], sold:["Sold","판매 완료"], active:["Active","판매 중"],
  "off.business":["Business Only","비즈니스만"], "off.business_property":["Business + Property","비즈니스 + 건물"], "off.property":["Property","부동산"],
  "t.all":["All","전체"], "t.residential":["House","단독 주택"], "t.condo":["Condo","콘도"], "t.townhome":["Townhome","타운하우스"], "t.land":["Land","토지"],
  tabBiz:["Business","비즈니스"], tabLease:["Lease","리스"], tabInv:["Investment","투자"], tabRes:["Residential","주거용"],
  beds:["Beds","침실"], baths:["Baths","욕실"], sqft:["sq.ft.","sq.ft."], seats:["Seats","좌석"], rooms:["Rooms","객실"], persf:["/sq.ft./yr","/sq.ft./년"],
  more:["View Details →","자세히 보기 →"], back:["← Back","← 목록으로"], photoSoon:["Photo coming soon","사진 준비 중"], none:["No listings match your selection.","조건에 맞는 매물이 없습니다."],
  notFound:["Listing not found.","매물을 찾을 수 없습니다."], price:["Price","가격"], category:["Category","카테고리"], deal:["Sale / Lease","매매 / 리스"], offering:["Offering","매매 형태"],
  type:["Property Type","매물 종류"], status:["Status","상태"], leaseRate:["Base Rent","기본 임대료"], addRent:["Additional Rent (Op Costs)","추가 임대료 (Op Costs)"],
  term:["Lease Term","리스 기간"], avail:["Available","입주 가능일"], zoning:["Zoning","존닝"], land:["Land Size","대지 면적"], units:["Units","유닛 수"],
  noi:["NOI","NOI (순영업소득)"], cap:["Cap Rate","Cap Rate"], sales:["Annual Sales","연 매출"], fuel:["Fuel Volume","연간 연료 판매량"], year:["Year Built","건축 연도"],
  mls:["MLS® Number","MLS® 번호"], listedBy:["Listing Brokerage","매물 등록 브로커리지"], desc:["Description","매물 설명"], keyFacts:["Key Facts","주요 정보"],
  call:["Call","전화하기"], ask:["Ask About This Listing","이 매물 문의하기"], ndaBtn:["Request NDA & Financials","NDA 및 재무 자료 요청"],
  nda:["🔒 Financial details are shared after a signed NDA.","🔒 재무 자료는 NDA 서명 후 제공됩니다."],
  askMsg:["I am interested in this listing: ","다음 매물에 대해 문의드립니다: "], ndaMsg:["Please send me the NDA and financial details for: ","다음 매물의 NDA와 재무 자료를 요청합니다: "],
  brochure:["Download Brochure (PDF)","브로슈어 PDF 다운로드"], realtor:["View on REALTOR.ca","REALTOR.ca에서 보기"], map:["View on Google Maps","구글 지도에서 보기"],
  share:["Share This Listing","이 매물 공유하기"], copy:["Copy Link","링크 복사"], copied:["Link copied!","링크가 복사되었습니다!"],
  igTip:["Instagram: copy the link and add it to your story or bio.","인스타그램: 링크를 복사해 스토리나 프로필에 넣으세요."],
  ddf:["This listing is provided through REALTOR.ca DDF®. This REALTOR.ca listing content is owned and licensed by REALTOR® members of The Canadian Real Estate Association.",
       "이 매물은 REALTOR.ca DDF®를 통해 제공됩니다. This REALTOR.ca listing content is owned and licensed by REALTOR® members of The Canadian Real Estate Association."],
  follow:["Follow","팔로우"], a9Sub:["Digital business card","디지털 명함"], igSub:["Listing photos & reels","매물 사진 & 릴스"], fbSub:["New listings & market news","새 매물 & 시장 소식"], thSub:["Quick updates & tips","빠른 소식 & 팁"],
  "freq.12":["per month","월별 상환"], "freq.26":["bi-weekly","격주 상환"], "freq.acc":["accelerated bi-weekly","가속 격주 상환"], "freq.52":["per week","주별 상환"],
  wMin:["Minimum down payment for this price is $","이 가격의 최소 다운페이먼트는 $"], wMin2:[".","입니다."], wBig:["A minimum 20% down payment is required at $1,500,000 or more.","$1,500,000 이상은 최소 20% 다운페이먼트가 필요합니다."],
  bizAll:["Businesses for Sale","비즈니스 매물"], invAll:["Income-Producing Investment Properties","수익형 투자 부동산"], forSaleSuffix:[" for Sale"," 매물"],
  emptyT:["New listings coming soon","새 매물 준비 중"], emptyD:["Many of my business opportunities are shared privately. Tell me what you are looking for and I will contact you first.","많은 비즈니스 매물은 비공개로 소개됩니다. 원하시는 조건을 알려주시면 가장 먼저 연락드리겠습니다."],
  emptyF:["No listings match these filters.","조건에 맞는 매물이 없습니다."], contactBtn:["Contact Jason","상담 문의"],
  leaseAll:["All Space","전체"],
  soldB:["Sold","판매 완료"], leasedB:["Leased","리스 완료"], boughtB:["Purchased","구매 완료"],
  "side.seller":["Represented the Seller","매도인 대리"], "side.buyer":["Represented the Buyer","매수인 대리"],
  "side.landlord":["Represented the Landlord","임대인 대리"], "side.tenant":["Represented the Tenant","임차인 대리"], "side.both":["Represented Both Sides","양측 대리"],
  "grp.all":["All","전체"], "grp.biz":["Business Sales","비즈니스 매매"], "grp.lease":["Leasing","리스"], "grp.inv":["Investment","투자"], "grp.res":["Residential","주거용"],
  resEmpty:["New guides are coming soon. Contact me for any information you need.","새 자료를 준비 중입니다. 필요한 자료가 있으면 연락 주세요."], download:["Download →","다운로드 →"],
  rentM:["Total Rent / Month","월 총 임대료"],
  pocketB:["Off-Market","비공개"], reqDetails:["Request Details →","상세 정보 요청 →"], priceReq:["Price on request","가격 문의"],
  pocketEmpty:["New off-market opportunities are shared privately. Register below to hear about them first.","새 비공개 매물은 개별적으로 안내됩니다. 아래에 등록하시면 가장 먼저 연락드립니다."],
  ndaNote:["NDA required","NDA 필요"],
  trackEmpty:["Transaction history is being updated.","거래 실적을 업데이트하고 있습니다."], foodSpace:["Restaurant / Food Space","레스토랑 / 식당 공간"], otherSpace:["Other","기타"]
};
let lang = "en";
try { lang = localStorage.getItem("jc_lang") || "en"; } catch (e) {}
const t = k => (D[k] ? D[k][lang === "ko" ? 1 : 0] : k);

/* ---------- Static page text (data-ko) ---------- */
document.querySelectorAll("[data-ko]").forEach(el => el.dataset.en = el.textContent);
document.querySelectorAll(".lang button").forEach(b => b.onclick = () => {
  lang = b.dataset.lang; try { localStorage.setItem("jc_lang", lang); } catch (e) {} applyLang();
});
function applyLang() {
  document.documentElement.lang = lang;
  document.body.classList.toggle("ko", lang === "ko");
  document.querySelectorAll("[data-ko]").forEach(el => el.textContent = lang === "ko" ? el.dataset.ko : el.dataset.en);
  document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  fillSelects(); renderAll();
}

/* ---------- Icons ---------- */
const ICONS = {
  "all":'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  "restaurant":'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 4-3 7h3v11"/>',
  "gas-station":'<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M6 8h6M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3"/>',
  "hotel":'<path d="M3 21V7l9-4 9 4v14M3 21h18M8 10h2M14 10h2M8 14h2M14 14h2M10 21v-3h4v3"/>',
  "liquor-store":'<path d="M10 2h4M10 2v5l-2 3v11h8V10l-2-3V2M8 14h8"/>',
  "car-wash":'<path d="M5 17h14v-4l-2-5H7l-2 5zM5 17v2M19 17v2M7.5 14h1M15.5 14h1M8 4c0 1-1 1-1 2M12 3c0 1-1 1-1 2M16 4c0 1-1 1-1 2"/>',
  "retail-office":'<path d="M3 9l2-5h14l2 5M3 9v12h18V9M3 9h18M9 21v-6h6v6"/>',
  "industrial":'<path d="M3 21V11l6 4v-4l6 4V5h6v16zM3 21h18"/>',
  "land":'<path d="M3 20l6-9 4 5 3-4 5 8zM16 7a2 2 0 1 0 0-.1"/>',
  "multi-family":'<path d="M4 21V5h10v16M14 9h6v12M4 21h16M7 8h2M7 12h2M7 16h2M11 8h0M17 13h0M17 17h0"/>',
  "other-business":'<path d="M3 7h18v13H3zM8 7V4h8v3M3 12h18"/>',
  "home":'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'
};
const icon = (k, s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS["other-business"]}</svg>`;
const SOC = {
  instagram:{c:"#E1306C",p:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',n:"Instagram",s:"igSub"},
  facebook:{c:"#1877F2",p:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',n:"Facebook",s:"fbSub"},
  threads:{c:"#111",p:'<path d="M16.5 11.2c-.3-2.6-2-3.9-4.4-3.9-2.6 0-4.1 1.7-4.1 1.7M8.3 15.2c.3 1.6 1.9 2.4 3.6 2.3 2.4-.1 3.7-1.8 3.6-4.2-.1-1.9-1.7-2.7-3.5-2.6-1.9.1-3.1 1.1-3.1 2.4 0 1.2 1 2 2.4 1.9 2.6-.1 4.3-2.2 4.2-6C15.3 4.8 13 3 10.5 3.3 6.2 3.8 4 7.4 4 12c0 5 2.7 9 8 9 3.6 0 6-1.7 7.2-4.2"/>',n:"Threads",s:"thSub"},
  youtube:{c:"#FF0000",p:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',n:"YouTube"},
  a9ent:{c:"#C8282B",p:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16c.6-1.5 1.7-2 3-2s2.4.5 3 2M14 10h5M14 13h4"/>',n:"A9ENT",s:"a9Sub"},
  linkedin:{c:"#0A66C2",p:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',n:"LinkedIn"}
};
const socIcon = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${SOC[k].p}</svg>`;
function renderSocial() {
  const keys = Object.keys(SOC).filter(k => SITE[k]);
  const links = s => keys.map(k => `<a href="${SITE[k]}" target="_blank" rel="noopener" aria-label="${SOC[k].n}">${socIcon(k, s)}</a>`).join("");
  $("socialTop").innerHTML = links(19); $("socialFoot").innerHTML = links(24); $("socialContact").innerHTML = links(24);
  $("socialCards").innerHTML = ["instagram","facebook","threads","a9ent"].filter(k => SITE[k]).map(k =>
    `<a class="social-card" href="${SITE[k]}" target="_blank" rel="noopener"><span class="s-ic" style="background:${SOC[k].c}">${socIcon(k, 34)}</span>
     <b>${SOC[k].n}</b><small class="s-handle">${k === "a9ent" ? "a9ent.co/jasonchoirealestate" : "@" + (k === "facebook" ? (SITE.facebookHandle || SITE.handle || "") : (SITE.handle || ""))}</small><small>${t(SOC[k].s)}</small><span class="s-go">${lang === "ko" ? "팔로우 →" : "Follow →"}</span></a>`).join("");
}

/* ---------- Categories ---------- */
const BIZ_CATS = ["restaurant","gas-station","hotel","liquor-store","car-wash","other-business"];
const INV_CATS = ["retail-office","industrial","multi-family","hotel","gas-station","land"];
const HOME_CATS = ["restaurant","gas-station","hotel","liquor-store","car-wash","retail-office","industrial","multi-family","land","other-business"];
const RES_TYPES = ["all","residential","condo","townhome","land"];

/* ---------- Data & state ---------- */
let MINE = [], DDF = [], SOLD = [], REVIEWS = [], RES = [], POCKET = [], MARKET = {};
let trackGrp = "all";
const ALL = () => MINE.concat(DDF);
let bizCat = "all", invCat = "all", featTab = "biz", resType = "all", resStatus = "active";
let shown = { biz: PAGE, lease: PAGE, inv: PAGE };
let route = "home", photoIdx = 0, backTo = "business";

const money = n => "$" + Math.round(n).toLocaleString("en-CA");
const num = n => Number(n).toLocaleString("en-CA");
const isCom = l => l.type === "commercial" || l.type === "business";
const photos = l => (l.photos || []).filter(Boolean).slice(0, MAX_PHOTOS);
const title = l => (lang === "ko" && l.title_ko) ? l.title_ko : (l.title_en || "");
const desc = l => (lang === "ko" && l.desc_ko) ? l.desc_ko : (l.desc_en || "");
const priceText = l => l.price ? money(l.price) : (l.leaseRate ? "$" + l.leaseRate + " " + t("persf") : "—");
const kind = l => !isCom(l) ? "res" : l.deal === "lease" ? "lease" : (l.offering === "property" ? "inv" : "biz");
const isBiz = l => isCom(l) && l.deal !== "lease" && (l.offering === "business" || l.offering === "business_property");
const isInv = l => isCom(l) && l.deal !== "lease" && (l.offering === "property" || l.offering === "business_property") && INV_CATS.includes(l.category);
const isLease = l => isCom(l) && l.deal === "lease";

/* ---------- Select options built by script ---------- */
function fillSelects() {
  const keepFill = (sel, opts) => { const v = sel.value; sel.innerHTML = opts.map(([val, k]) => `<option value="${val}">${t(k)}</option>`).join(""); if (v && [...sel.options].some(o => o.value === v)) sel.value = v; };
  document.querySelectorAll(".region-sel").forEach(s => keepFill(s, [["all","allRegions"],["calgary","calgary"],["alberta","alberta"],["bc","bc"]]));
  document.querySelectorAll(".sort-sel").forEach(s => keepFill(s, [["new","sortNew"],["low","sortLow"],["high","sortHigh"],["size","sortSize"]]));
  document.querySelectorAll(".price-sel").forEach(s => { const v = s.value;
    s.innerHTML = `<option value="0">${t("anyPrice")}</option>` + [250000,500000,1000000,2000000,3000000,5000000,10000000].map(n => `<option value="${n}">${money(n)}</option>`).join("");
    if (v) s.value = v; });
  keepFill($("lCat"), [["all","leaseAll"],["retail-office","c.retail-office"],["restaurant","foodSpace"],["industrial","c.industrial"],["other","otherSpace"]]);
}
function sortItems(items, how) {
  const a = items.slice();
  if (how === "low") a.sort((x, y) => (x.price || x.leaseRate || 0) - (y.price || y.leaseRate || 0));
  if (how === "high") a.sort((x, y) => (y.price || y.leaseRate || 0) - (x.price || x.leaseRate || 0));
  if (how === "size") a.sort((x, y) => (y.sqft || 0) - (x.sqft || 0));
  return a;
}

/* ---------- Cards ---------- */
function photoHTML(l, i = 0) {
  const p = photos(l);
  if (p[i]) return `<img src="${p[i]}" alt="${l.address}" loading="lazy">`;
  return `<div class="ph">${icon(isCom(l) ? (l.category || "other-business") : "home", 44)}${t("photoSoon")}</div>`;
}
function kpiHTML(l) {
  const k = [], k2 = kind(l);
  if (k2 === "biz" && l.monthlyRent) k.push([t("rentM"), l.monthlyRent]);
  if (k2 === "lease") {
    if (l.leaseRate) k.push([t("leaseRate"), "$" + l.leaseRate]);
    if (l.addRent) k.push(["Op Costs", "$" + l.addRent]);
    if (l.sqft) k.push([t("sqft"), num(l.sqft)]);
  } else if (k2 === "inv") {
    if (l.capRate) k.push([t("cap"), l.capRate + "%"]);
    if (l.noi) k.push(["NOI", money(l.noi)]);
    if (l.sqft) k.push([t("sqft"), num(l.sqft)]);
    if (l.units) k.push([t("units"), l.units]);
  } else if (k2 === "biz") {
    if (l.annualSales) k.push([t("sales"), money(l.annualSales)]);
    if (l.sqft) k.push([t("sqft"), num(l.sqft)]);
    if (l.leaseTerm && !l.annualSales) k.push([t("term"), l.leaseTerm.split(" to ").pop().split(" +")[0]]);
    if (l.seats) k.push([t("seats"), l.seats]); else if (l.rooms) k.push([t("rooms"), l.rooms]); else if (l.landSize) k.push([t("land"), l.landSize]);
  }
  return k.length ? `<div class="kpis">${k.slice(0, 3).map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>` : "";
}
function cardHTML(l) {
  const com = isCom(l), n = photos(l).length;
  const status = l.status === "sold" ? `<span class="badge sold">${t("sold")}</span>`
    : `<span class="badge ${l.deal === "lease" ? "lease" : ""}">${t(com ? (l.deal || "sale") : "active")}</span>`;
  const typeB = com ? `<span class="badge cat-b">${t("c." + (l.category || "other-business"))}</span>` : `<span class="badge type">${t("t." + l.type)}</span>`;
  const facts = !com ? `<div class="facts">${l.beds != null ? `<span><b>${l.beds}</b> ${t("beds")}</span>` : ""}${l.baths != null ? `<span><b>${l.baths}</b> ${t("baths")}</span>` : ""}${l.sqft ? `<span><b>${num(l.sqft)}</b> ${t("sqft")}</span>` : ""}</div>` : kpiHTML(l);
  return `<a class="card" href="#${l.id}">
    <div class="card-img">${photoHTML(l)}${status}${typeB}${n > 1 ? `<span class="photo-count">📷 ${n}</span>` : ""}</div>
    <div class="card-body">
      ${com && l.offering ? `<div class="offer">${t("off." + l.offering)}</div>` : ""}
      <div class="price">${priceText(l)}</div>
      <div class="addr">${l.address}</div>
      <div class="city">${l.city || ""}</div>
      ${facts}
      <div class="muted" style="font-size:14px;margin-bottom:12px">${title(l)}</div>
      <div class="card-foot"><span>${l.source === "ddf" ? (l.listOffice || "") : "First Place Realty"}</span><span class="go">${t("more")}</span></div>
    </div></a>`;
}
const emptyBox = () => MINE.some(l => l.status === "active")
  ? `<div class="empty">${t("emptyF")}</div>`
  : `<div class="empty empty-cta"><b>${t("emptyT")}</b><p>${t("emptyD")}</p><a class="btn btn-red" href="#contact">${t("contactBtn")}</a></div>`;
const gridHTML = items => items.length ? items.map(cardHTML).join("") : emptyBox();
const catTiles = (cats, cur, base) => ["all", ...cats].map(c =>
  `<a class="cat ${cur === c ? "on" : ""}" href="#${c === "all" ? base : base + "-" + c}"><div class="cat-ic">${icon(c)}</div><b>${c === "all" ? t("all") : t("c." + c)}</b></a>`).join("");

/* ---------- Home ---------- */
/* ---------- Real deal photos (warmer look) ---------- */
const CAT_PHOTO = {   /* chosen photos per category; others are picked automatically */
  "gas-station": "uploads/sold/longview-gas-station.jpg",
  "restaurant": "uploads/sold/cochrane-restaurant.jpg",
  "liquor-store": "uploads/sold/calgary-ne-liquor.jpg",
  "hotel": "uploads/sold/stettler-hotel.jpg",
  "retail-office": "uploads/listings/new-horizon-mall-g11b-1.jpg",
  "industrial": "uploads/sold/manchester-office-industrial.jpg",
  "multi-family": "uploads/sold/panorama-hills-apartment-1.jpg",
  "other-business": "uploads/listings/convenience-store-condo-eau-claire-2.jpg"
};
function catPhoto(c) {
  if (CAT_PHOTO[c]) return CAT_PHOTO[c];
  const hit = SOLD.concat(MINE).find(x => x.category === c && ((x.photos && x.photos[0]) || x.photo));
  return hit ? (hit.photos ? hit.photos[0] : hit.photo) : "";
}
function allDealPhotos() {
  const seen = new Set(), out = ["uploads/brand/sold-sign-1.jpg", "uploads/brand/sold-sign-2.jpg"];
  SOLD.concat(MINE.filter(l => l.status === "active")).forEach(x => {
    const p = (x.photos && x.photos[0]) || x.photo;
    if (p && !seen.has(p)) { seen.add(p); out.push(p); }
  });
  return out;
}
function renderPhotos() {
  const ph = allDealPhotos();
  if (!ph.length) return;
  const mix = ph.slice().sort((a, b) => (a.length * 7 + a.charCodeAt(a.length - 6)) % 11 - (b.length * 7 + b.charCodeAt(b.length - 6)) % 11);
  const tiles = []; while (tiles.length < 24) tiles.push(...mix); 
  $("heroMosaic").innerHTML = tiles.slice(0, 24).map((p, i) => `<img src="${p}" alt="" loading="${i < 12 ? "eager" : "lazy"}" style="animation-delay:${(i % 8) * 0.25}s">`).join("");
  const strip = ph.slice(0, 18).map(p => `<img src="${p}" alt="" loading="lazy">`).join("");
  $("photoStrip").innerHTML = strip + strip;
}

function renderHome() {
  $("homeCats").innerHTML = HOME_CATS.map(c => {
    const base = BIZ_CATS.includes(c) ? "business" : "investment";
    const n = ALL().filter(l => l.category === c && l.status === "active").length;
    const ph = catPhoto(c);
    if (ph) return `<a class="cat cat-photo" href="#${base}-${c}"><img src="${ph}" alt="" loading="lazy"><span class="cat-txt"><b>${t("c." + c)}</b><small>${t("cs." + c)}${n ? " · " + n : ""}</small></span></a>`;
    return `<a class="cat cat-photo cat-noimg" href="#${base}-${c}"><span class="cat-bigic">${icon(c, 64)}</span><span class="cat-txt"><b>${t("c." + c)}</b><small>${t("cs." + c)}${n ? " · " + n : ""}</small></span></a>`;
  }).join("");
  const tabs = [["biz","tabBiz"],["lease","tabLease"],["inv","tabInv"],["res","tabRes"]];
  $("featTabs").innerHTML = tabs.map(([k, l]) => `<button class="${featTab === k ? "on" : ""}" data-k="${k}">${t(l)}</button>`).join("");
  $("featTabs").querySelectorAll("button").forEach(b => b.onclick = () => { featTab = b.dataset.k; renderHome(); });
  const pick = MINE.filter(l => l.status === "active" && kind(l) === featTab);
  $("featuredGrid").innerHTML = gridHTML(pick.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 6));
  const nActive = MINE.filter(l => l.status === "active").length;
  $("statActive").textContent = nActive;
  $("statListings").style.display = nActive ? "" : "none"; $("statService").style.display = nActive ? "none" : "";
  $("featuredSection").style.display = nActive ? "" : "none";
  document.querySelectorAll(".ddf-block").forEach(b => b.style.display = DDF.length ? "" : "none");
  document.querySelectorAll(".pillar-ic[data-icon]").forEach(e => e.innerHTML = icon(e.dataset.icon, 30));
}

/* ---------- Business / Leasing / Investment ---------- */
const region = (l, v) => v === "all" || l.region === v;
function renderBusiness() {
  $("bizCats").innerHTML = catTiles(BIZ_CATS, bizCat, "business");
  $("bizTitle").textContent = bizCat === "all" ? t("bizAll") : t("c." + bizCat) + t("forSaleSuffix");
  const max = +$("bMax").value, off = $("bOffer").value, rg = $("bRegion").value, srt = $("bSort").value;
  const f = l => isBiz(l) && l.status === "active" && (bizCat === "all" || l.category === bizCat) && (off === "all" || l.offering === off) && region(l, rg) && (!max || !l.price || l.price <= max);
  $("bizMine").innerHTML = gridHTML(sortItems(MINE.filter(f), srt));
  const d = sortItems(DDF.filter(f), srt);
  $("bizDdf").innerHTML = gridHTML(d.slice(0, shown.biz));
  document.querySelector('[data-target="biz"]').style.display = d.length > shown.biz ? "" : "none";
}
function renderLeasing() {
  const cat = $("lCat").value, rg = $("lRegion").value, min = +$("lMin").value, srt = $("lSort").value;
  const f = l => isLease(l) && l.status === "active" && region(l, rg) && (!min || (l.sqft || 0) >= min) &&
    (cat === "all" || (cat === "other" ? !["retail-office","restaurant","industrial"].includes(l.category) : l.category === cat));
  $("leaseMine").innerHTML = gridHTML(sortItems(MINE.filter(f), srt));
  const d = sortItems(DDF.filter(f), srt);
  $("leaseDdf").innerHTML = gridHTML(d.slice(0, shown.lease));
  document.querySelector('[data-target="lease"]').style.display = d.length > shown.lease ? "" : "none";
}
function renderInvestment() {
  $("invCats").innerHTML = catTiles(INV_CATS, invCat, "investment");
  $("invTitle").textContent = invCat === "all" ? t("invAll") : t("c." + invCat);
  const max = +$("iMax").value, rg = $("iRegion").value, cap = +$("iCap").value, srt = $("iSort").value;
  const f = l => isInv(l) && l.status === "active" && (invCat === "all" || l.category === invCat) && region(l, rg) && (!max || !l.price || l.price <= max) && (!cap || (l.capRate || 0) >= cap);
  $("invMine").innerHTML = gridHTML(sortItems(MINE.filter(f), srt));
  const d = sortItems(DDF.filter(f), srt);
  $("invDdf").innerHTML = gridHTML(d.slice(0, shown.inv));
  document.querySelector('[data-target="inv"]').style.display = d.length > shown.inv ? "" : "none";
}
["bOffer","bRegion","bMax","bSort"].forEach(id => $(id).addEventListener("change", () => { shown.biz = PAGE; renderBusiness(); }));
["lCat","lRegion","lMin","lSort"].forEach(id => $(id).addEventListener("change", () => { shown.lease = PAGE; renderLeasing(); }));
["iRegion","iMax","iCap","iSort"].forEach(id => $(id).addEventListener("change", () => { shown.inv = PAGE; renderInvestment(); }));
document.querySelectorAll(".more-btn").forEach(b => b.onclick = () => { shown[b.dataset.target] += PAGE; renderAll(); });

/* ---------- Residential ---------- */
function renderResidential() {
  $("typeChips").innerHTML = RES_TYPES.map(x => `<button class="chip ${resType === x ? "on" : ""}" data-t="${x}">${t("t." + x)}</button>`).join("");
  $("statusChips").innerHTML = ["active","sold"].map(x => `<button class="chip ${resStatus === x ? "on" : ""}" data-s="${x}">${t(x)}</button>`).join("");
  $("typeChips").querySelectorAll(".chip").forEach(b => b.onclick = () => { resType = b.dataset.t; renderResidential(); });
  $("statusChips").querySelectorAll(".chip").forEach(b => b.onclick = () => { resStatus = b.dataset.s; renderResidential(); });
  $("listGrid").innerHTML = gridHTML(MINE.filter(l => !isCom(l) && (resType === "all" || l.type === resType) && l.status === resStatus));
}

/* ---------- Listing detail ---------- */
function renderDetail(id) {
  const w = $("detailWrap"), l = ALL().find(x => x.id === id);
  const back = `<a class="back" href="#${backTo}">${t("back")}</a>`;
  if (!l) { w.innerHTML = back + `<div class="empty">${t("notFound")}</div>`; return; }
  const com = isCom(l), p = photos(l);
  if (photoIdx >= p.length) photoIdx = 0;
  const rows = [
    l.price ? ["price", money(l.price)] : null,
    com ? ["category", t("c." + (l.category || "other-business"))] : ["type", t("t." + l.type)],
    com ? ["deal", t(l.deal || "sale")] : ["status", t(l.status === "sold" ? "sold" : "active")],
    com && l.offering ? ["offering", t("off." + l.offering)] : null,
    l.leaseRate ? ["leaseRate", "$" + l.leaseRate + " " + t("persf")] : null,
    l.addRent ? ["addRent", "$" + l.addRent + " " + t("persf")] : null,
    l.monthlyRent ? ["rentM", l.monthlyRent] : null,
    l.leaseTerm ? ["term", l.leaseTerm] : null, l.available ? ["avail", l.available] : null,
    l.beds != null ? ["beds", l.beds] : null, l.baths != null ? ["baths", l.baths] : null,
    l.sqft ? ["sqft", num(l.sqft)] : null, l.landSize ? ["land", l.landSize] : null,
    l.zoning ? ["zoning", l.zoning] : null, l.units ? ["units", l.units] : null,
    l.seats ? ["seats", l.seats] : null, l.rooms ? ["rooms", l.rooms] : null,
    l.fuelVolume ? ["fuel", l.fuelVolume] : null, l.annualSales ? ["sales", money(l.annualSales)] : null,
    l.noi ? ["noi", money(l.noi)] : null, l.capRate ? ["cap", l.capRate + "%"] : null,
    l.yearBuilt ? ["year", l.yearBuilt] : null, l.mls ? ["mls", l.mls] : null,
    l.source === "ddf" && l.listOffice ? ["listedBy", l.listOffice] : null
  ].filter(Boolean).map(r => `<tr><td>${t(r[0])}</td><td><b>${r[1]}</b></td></tr>`).join("");
  const url = (SITE.siteUrl ? SITE.siteUrl.replace(/\/$/, "") + "/" : location.href.split("#")[0]) + "#" + l.id;
  const shareText = `${title(l) || l.address} – ${priceText(l)}`;
  w.innerHTML = `${back}
  <div class="detail">
    <div>
      <div class="gallery-main">${photoHTML(l, photoIdx)}
        ${p.length > 1 ? `<button class="g-nav g-prev" aria-label="Previous">‹</button><button class="g-nav g-next" aria-label="Next">›</button><span class="photo-count">${photoIdx + 1} / ${p.length}</span>` : ""}</div>
      ${p.length > 1 ? `<div class="thumbs">${p.map((s, i) => `<button class="${i === photoIdx ? "on" : ""}" data-i="${i}"><img src="${s}" alt=""></button>`).join("")}</div>` : ""}
      <div style="margin-top:28px">
        ${com && l.offering ? `<div class="offer">${t("off." + l.offering)} · ${t("c." + l.category)}</div>` : ""}
        <h1 style="font-size:30px">${l.address}</h1>
        <div class="muted">${l.city || ""}</div>
        <div class="price" style="font-size:34px;margin:10px 0">${priceText(l)}</div>
        ${com ? kpiHTML(l) : ""}
        <h3 style="margin:22px 0 8px">${title(l)}</h3>
        <h4 style="margin:18px 0 6px;font-size:16px">${t("desc")}</h4>
        <p style="white-space:pre-line">${desc(l)}</p>
        ${l.nda ? `<div class="nda-box">${t("nda")}</div>` : ""}
        <h4 style="margin:26px 0 0;font-size:16px">${t("keyFacts")}</h4>
        <table class="spec">${rows}</table>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${l.brochure ? `<a class="btn btn-outline" href="${l.brochure}" target="_blank">${t("brochure")}</a>` : ""}
          ${l.realtorUrl ? `<a class="btn btn-outline" href="${l.realtorUrl}" target="_blank" rel="noopener">${t("realtor")}</a>` : ""}
          <a class="btn btn-outline" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address + ", " + (l.city || ""))}">${t("map")}</a>
        </div>
        ${l.source === "ddf" ? `<p class="ddf-note"><span class="ddf-logo" style="font-size:11px;padding:2px 6px">REALTOR.ca</span> ${t("ddf")}</p>` : ""}
      </div>
    </div>
    <aside class="side-card">
      <div class="agent"><img src="assets/jason-choi.jpg" alt="Jason Choi"><div><b>Jason Choi 최재봉</b><div class="muted" style="font-size:14px">REALTOR® · First Place Realty</div></div></div>
      <a class="btn btn-red w100" href="tel:4033998124">${t("call")} (403) 399-8124</a>
      <a class="btn btn-outline w100" href="#contact" data-msg="askMsg">${t("ask")}</a>
      ${l.nda ? `<a class="btn btn-outline w100" href="#contact" data-msg="ndaMsg">${t("ndaBtn")}</a>` : ""}
      <div class="share"><small>${t("share")}</small>
        <div class="share-btns">
          <a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}">${socIcon("facebook", 15)} Facebook</a>
          <a target="_blank" rel="noopener" href="https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + " " + url)}">${socIcon("threads", 15)} Threads</a>
          <a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}">${socIcon("linkedin", 15)} LinkedIn</a>
          <button type="button" id="copyLink">${socIcon("instagram", 15)} ${t("copy")}</button>
        </div>
        <p class="note" id="copyNote" style="margin-top:8px">${t("igTip")}</p>
      </div>
    </aside>
  </div>`;
  const go = i => { photoIdx = (i + p.length) % p.length; renderDetail(id); };
  w.querySelectorAll(".thumbs button").forEach(b => b.onclick = () => go(+b.dataset.i));
  if (p.length > 1) { w.querySelector(".g-prev").onclick = () => go(photoIdx - 1); w.querySelector(".g-next").onclick = () => go(photoIdx + 1); }
  w.querySelectorAll("[data-msg]").forEach(a => a.onclick = () => {
    $("contactMsg").value = t(a.dataset.msg) + l.address + " (" + priceText(l) + (l.mls ? ", MLS® " + l.mls : "") + ")";
  });
  $("copyLink").onclick = async () => { try { await navigator.clipboard.writeText(url); $("copyNote").textContent = t("copied"); } catch (e) { $("copyNote").textContent = url; } };
}

/* ---------- Track record, testimonials, resources ---------- */
const tr = (l, k) => (lang === "ko" && l[k + "_ko"]) ? l[k + "_ko"] : (l[k + "_en"] || "");
const soldGroup = s => s.group || (["restaurant","gas-station","liquor-store","car-wash","other-business"].includes(s.category) ? "biz" : "inv");
const soldPhotos = s => (s.photos && s.photos.length ? s.photos : (s.photo ? [s.photo] : [])).filter(Boolean).slice(0, MAX_PHOTOS);
function soldCard(s, idx) {
  const ph = soldPhotos(s), cat = s.category || "other-business";
  const badge = s.result === "leased" ? t("leasedB") : s.result === "purchased" ? t("boughtB") : t("soldB");
  const isRes = soldGroup(s) === "res";
  return `<div class="card ${ph.length ? "clickable" : ""}" data-sold="${idx}">
    <div class="card-img">${ph[0] ? `<img src="${ph[0]}" alt="" loading="lazy">` : `<div class="ph">${icon(isRes ? "home" : cat, 44)}</div>`}
      <span class="badge sold">${badge}</span>${isRes ? "" : `<span class="badge cat-b">${t("c." + cat)}</span>`}
      ${ph.length > 1 ? `<span class="photo-count">📷 ${ph.length}</span>` : ""}</div>
    <div class="card-body">
      ${s.side ? `<div class="offer">${t("side." + s.side)}</div>` : ""}
      ${s.showPrice && s.price ? `<div class="price">${money(s.price)}</div>` : ""}
      <div class="addr">${tr(s, "title")}</div>
      <div class="city">${s.city || ""}</div>
      ${tr(s, "note") ? `<p class="muted" style="font-size:14px;margin-top:10px">${tr(s, "note")}</p>` : ""}
    </div></div>`;
}
/* Simple photo viewer for track-record cards */
let lbPhotos = [], lbIdx = 0;
function openLightbox(photos, title) {
  lbPhotos = photos; lbIdx = 0;
  let lb = $("lightbox");
  if (!lb) {
    lb = document.createElement("div"); lb.id = "lightbox";
    lb.innerHTML = `<div class="lb-inner"><button class="lb-close" aria-label="Close">×</button><img id="lbImg" alt=""><button class="g-nav g-prev lb-prev" aria-label="Previous">‹</button><button class="g-nav g-next lb-next" aria-label="Next">›</button><div class="lb-cap"><span id="lbTitle"></span><span id="lbCount"></span></div></div>`;
    document.body.appendChild(lb);
    lb.onclick = e => { if (e.target === lb || e.target.classList.contains("lb-close")) lb.classList.remove("on"); };
    lb.querySelector(".lb-prev").onclick = () => showLb(lbIdx - 1);
    lb.querySelector(".lb-next").onclick = () => showLb(lbIdx + 1);
    document.addEventListener("keydown", e => { if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") showLb(lbIdx - 1); if (e.key === "ArrowRight") showLb(lbIdx + 1); });
  }
  $("lbTitle").textContent = title; lb.classList.add("on"); showLb(0);
}
function showLb(i) {
  lbIdx = (i + lbPhotos.length) % lbPhotos.length;
  $("lbImg").src = lbPhotos[lbIdx]; $("lbCount").textContent = (lbIdx + 1) + " / " + lbPhotos.length;
  document.querySelectorAll("#lightbox .g-nav").forEach(b => b.style.display = lbPhotos.length > 1 ? "" : "none");
}
function bindSold(container, list) {
  container.querySelectorAll(".card[data-sold]").forEach(c => c.onclick = () => {
    const s = list[+c.dataset.sold]; const ph = soldPhotos(s); if (ph.length) openLightbox(ph, tr(s, "title"));
  });
}
function renderTrack() {
  $("trackSection").style.display = SOLD.length ? "" : "none";
  const homeList = SOLD.slice(0, 6);
  $("trackHome").innerHTML = homeList.map(soldCard).join(""); bindSold($("trackHome"), homeList);
  const groups = ["all","biz","lease","inv","res"].filter(g => g === "all" || SOLD.some(s => soldGroup(s) === g));
  $("trackChips").innerHTML = groups.length > 2 ? groups.map(g => `<button class="chip ${trackGrp === g ? "on" : ""}" data-g="${g}">${t("grp." + g)}</button>`).join("") : "";
  $("trackChips").querySelectorAll(".chip").forEach(b => b.onclick = () => { trackGrp = b.dataset.g; renderTrack(); });
  const items = SOLD.filter(s => trackGrp === "all" || soldGroup(s) === trackGrp);
  $("trackAll").innerHTML = items.length ? items.map(soldCard).join("") : `<div class="empty">${t("trackEmpty")}</div>`;
  bindSold($("trackAll"), items);
}
function renderReviews() {
  $("testimonials").style.display = REVIEWS.length ? "" : "none";
  $("quotesGrid").innerHTML = REVIEWS.map(r => `<div class="quote"><div class="stars">${"★".repeat(r.stars || 5)}</div>
    <p>${tr(r, "text")}</p><cite>— ${r.name || ""}${tr(r, "role") ? ", " + tr(r, "role") : ""}</cite></div>`).join("");
}
function renderResources() {
  $("resGrid").innerHTML = RES.length ? RES.map(r => `<div class="res-card"><div class="res-tag">${(r.file || "").toLowerCase().endsWith(".pdf") ? "PDF" : "FILE"}${r.lang ? " · " + r.lang : ""}</div>
    <h3>${tr(r, "title")}</h3><p>${tr(r, "desc")}</p>${r.file ? `<a href="${r.file}" target="_blank" rel="noopener">${t("download")}</a>` : ""}</div>`).join("")
    : `<div class="empty empty-cta" style="grid-column:1/-1"><p>${t("resEmpty")}</p><a class="btn btn-red" href="#contact">${t("contactBtn")}</a></div>`;
}

/* ---------- Off-market (pocket) listings ---------- */
function pocketCard(p, i) {
  const cat = p.category || "other-business", ph = (p.photos || []).filter(Boolean)[0];
  const k = [];
  if (p.size) k.push([t("sqft"), p.size]);
  if (p.revenue) k.push([t("sales"), p.revenue]);
  if (p.cap) k.push([t("cap"), p.cap]);
  return `<div class="card pocket-card">
    <div class="card-img">${ph ? `<img src="${ph}" alt="" loading="lazy">` : `<div class="ph pocket-ph">${icon(cat, 46)}<span>CONFIDENTIAL</span></div>`}
      <span class="badge pocket-b">${t("pocketB")}</span><span class="badge cat-b">${t("c." + cat)}</span></div>
    <div class="card-body">
      ${p.offering ? `<div class="offer">${t("off." + p.offering)}${p.deal === "lease" ? " · " + t("lease") : ""}</div>` : ""}
      <div class="price">${p.priceRange || t("priceReq")}</div>
      <div class="addr">${tr(p, "title")}</div>
      <div class="city">${p.area || ""}</div>
      ${k.length ? `<div class="kpis">${k.slice(0, 3).map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join("")}</div>` : ""}
      ${tr(p, "highlights") ? `<p class="muted" style="font-size:14px;margin-bottom:12px;white-space:pre-line">${tr(p, "highlights")}</p>` : ""}
      <div class="card-foot"><span>🔒 ${t("ndaNote")}</span><a href="#off-market" class="go" data-pocket="${i}">${t("reqDetails")}</a></div>
    </div></div>`;
}
function renderPocket() {
  const list = POCKET.filter(p => p.status !== "closed");
  $("pocketHome").style.display = list.length ? "" : "none";
  $("pocketHomeGrid").innerHTML = list.slice(0, 3).map(pocketCard).join("");
  $("pocketGrid").innerHTML = list.length ? list.map(pocketCard).join("")
    : `<div class="empty empty-cta"><p>${t("pocketEmpty")}</p></div>`;
  document.querySelectorAll("[data-pocket]").forEach(b => b.onclick = () => {
    const p = list[+b.dataset.pocket]; $("pocketListing").value = tr(p, "title") + (p.area ? " – " + p.area : "") + (p.ref ? " (Ref " + p.ref + ")" : "");
    setTimeout(() => $("pocket-request-box").scrollIntoView({ behavior: "smooth" }), 60);
  });
}

/* ---------- Brokerage logos ---------- */
const BROKERS = [
  { name: "First Place Realty", prov: ["Alberta", "앨버타"], logo: "assets/first-place-realty.jpg" },
  { name: "Maple Supreme Realty Inc.", prov: ["British Columbia", "브리티시컬럼비아"], logo: "assets/maple-supreme-realty.png" }
];
function renderBrokers() {
  const html = BROKERS.map(b => `<div class="broker"><div class="broker-box"><img src="${b.logo}" alt="${b.name}" onerror="this.parentNode.classList.add('nologo')"><span class="broker-name">${b.name}</span></div><small>${b.prov[lang === "ko" ? 1 : 0]}</small></div>`).join("");
  document.querySelectorAll(".brokers-slot").forEach(s => s.innerHTML = html);
}

/* ---------- Router ---------- */
const VIEWS = ["off-market","track-record","home","business","leasing","investment","sell-business","residential","mortgage","home-evaluation","guides","about"];
const JUMPS = { "leasing-calc": ["leasing","leasing-calc-box"], "space-request": ["leasing","space-request-box"], "cap-calc": ["investment","cap-calc-box"], "investor-list": ["investment","investor-list-box"] };
function router() {
  let h = (location.hash || "#home").slice(1);
  document.querySelector("nav.menu").classList.remove("open");
  if (h === "contact") { $("contactBand").scrollIntoView(); return; }
  if (h.startsWith("commercial")) h = h.replace("commercial", "business");   // old links
  let view, jump = null;
  if (JUMPS[h]) { [view, jump] = JUMPS[h]; }
  else if (h.startsWith("business-") && BIZ_CATS.includes(h.slice(9))) { view = "business"; bizCat = h.slice(9); }
  else if (h.startsWith("investment-") && INV_CATS.includes(h.slice(11))) { view = "investment"; invCat = h.slice(11); }
  else if (VIEWS.includes(h)) { view = h; if (h === "business") bizCat = "all"; if (h === "investment") invCat = "all"; }
  else if (ALL().some(l => l.id === h)) view = "detail";
  else view = "home";
  if (view === "detail") {
    if (route !== h) photoIdx = 0;
    const k = kind(ALL().find(x => x.id === h));
    backTo = { biz: bizCat === "all" ? "business" : "business-" + bizCat, lease: "leasing", inv: invCat === "all" ? "investment" : "investment-" + invCat, res: "residential" }[k];
  }
  route = view === "detail" ? h : view;
  shown = { biz: PAGE, lease: PAGE, inv: PAGE };
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("on", v.id === "view-" + view));
  const navKey = view === "detail" ? backTo.split("-")[0].replace("business", "business") : view;
  document.querySelectorAll("nav.menu a[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === navKey || (view === "detail" && backTo.startsWith(a.dataset.nav))));
  renderAll();
  if (jump) setTimeout(() => $(jump).scrollIntoView({ behavior: "smooth" }), 30); else window.scrollTo(0, 0);
}
window.addEventListener("hashchange", router);

/* ---------- Calgary market update ---------- */
const MK = { detached:["Detached","단독주택"], semi:["Semi-detached","세미 단독"], row:["Row / Townhouse","타운하우스"], apartment:["Apartment Condo","아파트 콘도"] };
function renderMarket() {
  const m = MARKET, ok = m && m.total && m.month;
  const sec = $("marketSection"); if (sec) sec.style.display = ok ? "" : "none";
  if (!ok) { document.querySelectorAll(".market-slot").forEach(e => e.innerHTML = ""); return; }
  const ko = lang === "ko", [y, mo] = m.month.split("-").map(Number);
  const mname = ko ? `${y}년 ${mo}월` : new Date(y, mo - 1, 1).toLocaleString("en-CA", { month: "long", year: "numeric" });
  const money = n => "$" + Math.round(n).toLocaleString("en-CA");
  const pct = n => `<span class="${n >= 0 ? "up" : "down"}">${n >= 0 ? "▲" : "▼"} ${Math.abs(n).toFixed(1)}%</span>`;
  const mkt = s => s < 4 ? (ko ? "판매자 우위" : "Seller's market") : s <= 6 ? (ko ? "균형 시장" : "Balanced") : (ko ? "구매자 우위" : "Buyer's market");
  const T = m.total;
  const kpis = [
    [ko ? "기준 가격 (전체)" : "Benchmark Price", money(T.benchmark), pct(T.yoy) + (ko ? " 전년 대비" : " vs last year")],
    [ko ? "월간 거래량" : "Sales", T.sales.toLocaleString("en-CA"), pct(T.salesYoy) + (ko ? " 전년 대비" : " vs last year")],
    [ko ? "매물 재고" : "Inventory", T.inventory.toLocaleString("en-CA"), (ko ? "신규 매물 " : "New listings ") + T.newListings.toLocaleString("en-CA")],
    [ko ? "재고 소진 기간" : "Months of Supply", T.monthsSupply.toFixed(1), mkt(T.monthsSupply)],
    [ko ? "평균 판매 기간" : "Days on Market", T.dom, ko ? "일" : "days"],
    [ko ? "호가 대비 판매가" : "Sale-to-List", T.saleToList.toFixed(1) + "%", ko ? "평균" : "average"]
  ].map(k => `<div class="mk-kpi"><small>${k[0]}</small><b>${k[1]}</b><span>${k[2]}</span></div>`).join("");
  const rows = (m.types || []).map(r => `<tr><td>${(MK[r.type] || [r.type, r.type])[ko ? 1 : 0]}</td><td>${money(r.benchmark)}</td><td>${pct(r.yoy)}</td><td>${r.sales.toLocaleString("en-CA")}</td><td>${r.monthsSupply.toFixed(1)} <em>${mkt(r.monthsSupply)}</em></td></tr>`).join("");
  const html = `<div class="section-head"><div><div class="eyebrow">${ko ? "캘거리 부동산 시장" : "Calgary Market Update"}</div>
    <h2>${ko ? mname + " 캘거리 시장 통계" : "Calgary Market Statistics – " + mname}</h2>
    <p class="muted small-mt">${ko ? m.summaryKo : m.summaryEn}</p></div>
    <a href="#contact" class="btn btn-outline">${ko ? "시장 상담 받기 →" : "Ask About Your Area →"}</a></div>
    <div class="mk-kpis">${kpis}</div>
    <div class="mk-table-wrap"><table class="mk-table"><thead><tr><th>${ko ? "유형" : "Property Type"}</th><th>${ko ? "기준 가격" : "Benchmark"}</th><th>${ko ? "전년 대비" : "Y/Y"}</th><th>${ko ? "거래량" : "Sales"}</th><th>${ko ? "재고 소진 기간 (개월)" : "Months of Supply"}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="note mk-src">${ko ? "출처" : "Source"}: <a href="${m.sourceUrl}" target="_blank" rel="noopener">${m.source}</a>. ${ko ? "캘거리 시 기준. 매월 업데이트됩니다." : "City of Calgary. Updated monthly."}</p>`;
  document.querySelectorAll(".market-slot").forEach(e => e.innerHTML = html);
}

function renderAll() {
  renderBrokers();
  renderTrack(); renderReviews(); renderResources(); renderPocket(); renderMarket();
  renderSocial(); renderHome(); renderBusiness(); renderLeasing(); renderInvestment(); renderResidential();
  if (ALL().some(l => l.id === route)) renderDetail(route);
  calcMortgage(); calcLease(); calcCap();
}

/* ---------- Calculators ---------- */
function cmhcRate(dp) { if (dp >= 20) return 0; if (dp >= 15) return .028; if (dp >= 10) return .031; return .04; }
const pmt = (loan, annualRate, years, perYear = 12) => { const r = Math.pow(1 + annualRate / 2, 2 / perYear) - 1, n = years * perYear; return annualRate ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n; };
function calcMortgage() {
  const price = +$("cPrice").value || 0, dp = +$("cDown").value || 0, rate = (+$("cRate").value || 0) / 100, yrs = +$("cAmort").value, fq = $("cFreq").value;
  const down = price * dp / 100;
  const minDown = price >= 1500000 ? price * .2 : (price <= 500000 ? price * .05 : 25000 + (price - 500000) * .1);
  let warn = ""; if (price >= 1500000 && dp < 20) warn = t("wBig"); else if (down < minDown) warn = t("wMin") + Math.ceil(minDown).toLocaleString("en-CA") + t("wMin2");
  const base = price - down, ins = price < 1500000 ? base * cmhcRate(dp) : 0, loan = base + ins, mPay = pmt(loan, rate, yrs, 12);
  const pay = fq === "12" ? mPay : fq === "acc" ? mPay / 2 : pmt(loan, rate, yrs, +fq);
  $("rPay").textContent = money(pay); $("rFreqLabel").textContent = t("freq." + fq);
  $("rDown").textContent = money(down) + " (" + dp + "%)"; $("rIns").textContent = money(ins); $("rLoan").textContent = money(loan);
  $("rInt").textContent = money(Math.max(mPay * yrs * 12 - loan, 0)); $("rWarn").textContent = warn;
}
function calcLease() {
  const sf = +$("lcSize").value || 0, b = +$("lcBase").value || 0, a = +$("lcAdd").value || 0, g = $("lcGst").value === "1";
  const bm = sf * b / 12, am = sf * a / 12, gm = g ? (bm + am) * .05 : 0;
  $("lcMonthly").textContent = money(bm + am + gm); $("lcBaseM").textContent = money(bm); $("lcAddM").textContent = money(am);
  $("lcGstM").textContent = money(gm); $("lcYear").textContent = money((bm + am + gm) * 12);
}
function calcCap() {
  const price = +$("ccPrice").value || 0, rent = +$("ccRent").value || 0, exp = +$("ccExp").value || 0, vac = (+$("ccVac").value || 0) / 100;
  const dp = (+$("ccDown").value || 0) / 100, rate = (+$("ccRate").value || 0) / 100, am = +$("ccAm").value || 25;
  const noi = rent * (1 - vac) - exp, loan = price * (1 - dp), debt = loan > 0 ? pmt(loan, rate, am, 12) * 12 : 0, cash = noi - debt, eq = price * dp;
  $("ccCap").textContent = price ? (noi / price * 100).toFixed(2) + "%" : "–";
  $("ccNoi").textContent = money(noi); $("ccDebt").textContent = money(debt); $("ccCash").textContent = money(cash);
  $("ccCoc").textContent = eq ? (cash / eq * 100).toFixed(2) + "%" : "–"; $("ccDscr").textContent = debt ? (noi / debt).toFixed(2) + "x" : "–";
}
["cPrice","cDown","cRate","cAmort","cFreq"].forEach(id => $(id).addEventListener("input", calcMortgage));
["lcSize","lcBase","lcAdd","lcGst"].forEach(id => $(id).addEventListener("input", calcLease));
["ccPrice","ccRent","ccExp","ccVac","ccDown","ccRate","ccAm"].forEach(id => $(id).addEventListener("input", calcCap));

/* ---------- Forms (Web3Forms) ---------- */
document.querySelectorAll(".lead-form").forEach(form => form.addEventListener("submit", async e => {
  e.preventDefault();
  if (SITE.formAccessKey) {
    const data = new FormData(form);
    data.append("access_key", SITE.formAccessKey);
    data.append("subject", form.dataset.subject + " – JasonChoiRealEstate.com");
    try { await fetch("https://api.web3forms.com/submit", { method: "POST", body: data }); } catch (err) {}
  }
  form.querySelector(".form-msg").style.display = "block"; form.reset();
}));

/* ---------- Start ---------- */
const yrs = new Date().getFullYear() - (SITE.startYear || 2007);
document.querySelectorAll(".yrs").forEach(e => e.textContent = yrs);
$("yr").textContent = new Date().getFullYear();
async function getJSON(url, fb) {
  try { const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) throw 0; return await r.json(); }
  catch (e) { try { return JSON.parse($(fb).textContent); } catch (_) { return []; } }
}
(async () => {
  [MINE, DDF, SOLD, REVIEWS, RES, POCKET, MARKET] = await Promise.all([getJSON("data/listings.json", "fallback-data"), getJSON("data/ddf-listings.json", "fallback-ddf"),
    getJSON("data/sold.json", "fallback-sold"), getJSON("data/testimonials.json", "fallback-reviews"), getJSON("data/resources.json", "fallback-res"), getJSON("data/pocket.json", "fallback-pocket"), getJSON("data/market.json", "fallback-market")]);
  MINE.forEach(l => l.source = "jason"); DDF.forEach(l => l.source = "ddf");
  fillSelects(); applyLang(); renderPhotos(); router();
})();
