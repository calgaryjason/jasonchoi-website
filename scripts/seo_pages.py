# Calgary-area SEO landing pages. Run: python3 scripts/seo_pages.py
# Writes calgary-home-buyers/, calgary-home-sellers/, airdrie-real-estate/, okotoks-real-estate/,
# cochrane-real-estate/ and ko/calgary-korean-realtor/. Market numbers come from data/market.json.
import json, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://jasonchoirealestate.com"
FORM_KEY = "f5c5f3c1-9ea2-4a7c-9b5f-9179bd184062"
M = json.loads((ROOT / "data/market.json").read_text())
T = M["total"]
TYPES = {t["type"]: t for t in M["types"]}
def money(n): return "${:,.0f}".format(n)
def pct(n): return ("+" if n > 0 else "") + f"{n:.1f}%"
MONTH = {"01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July",
         "08": "August", "09": "September", "10": "October", "11": "November", "12": "December"}
y, m = M["month"].split("-"); MON_EN = f"{MONTH[m]} {y}"; MON_KO = f"{y}년 {int(m)}월"

SOLD = [("arbour-lake-detached-1.jpg", "Arbour Lake", "Detached Home"), ("edgemont-detached-1.jpg", "Edgemont", "Detached Home"),
        ("evanston-detached-1.jpg", "Evanston", "Detached Home"), ("cougar-ridge-townhome-1.jpg", "Cougar Ridge", "Townhome"),
        ("montgomery-half-duplex-1.jpg", "Montgomery", "Semi-Detached"), ("beltline-apartment-1.jpg", "Beltline", "Apartment Condo")]
SOLD_KO = {"Detached Home": "단독주택", "Townhome": "타운하우스", "Semi-Detached": "세미 디태치드", "Apartment Condo": "아파트 콘도"}

def market_box(ko=False):
    rows = [("All homes" if not ko else "전체 주택", T["benchmark"], T["yoy"]),
            ("Detached" if not ko else "단독주택", TYPES["detached"]["benchmark"], TYPES["detached"]["yoy"]),
            ("Semi-detached" if not ko else "세미", TYPES["semi"]["benchmark"], TYPES["semi"]["yoy"]),
            ("Row / townhome" if not ko else "타운하우스", TYPES["row"]["benchmark"], TYPES["row"]["yoy"]),
            ("Apartment condo" if not ko else "아파트 콘도", TYPES["apartment"]["benchmark"], TYPES["apartment"]["yoy"])]
    cells = "".join(f'<div class="mk"><small>{a}</small><b>{money(b)}</b><span class="{"up" if c>0 else "dn"}">{pct(c)} {"y/y" if not ko else "전년 대비"}</span></div>' for a, b, c in rows)
    head = (f"캘거리 시장 현황 · {MON_KO}" if ko else f"Calgary Market Snapshot · {MON_EN}")
    sub = (f"벤치마크 가격 · 판매 {T['sales']:,}건 · 재고 {T['monthsSupply']:.1f}개월 · 평균 {T['dom']}일 만에 판매" if ko
           else f"Benchmark prices · {T['sales']:,} sales · {T['monthsSupply']:.1f} months of supply · {T['dom']} days on market")
    src = f'<p class="src">{"출처" if ko else "Source"}: <a href="{M["sourceUrl"]}" target="_blank" rel="noopener">{html.escape(M["source"])}</a></p>'
    return f'<section class="card"><h2>{head}</h2><p class="muted">{sub}</p><div class="mks">{cells}</div>{src}</section>'

def sold_gallery(ko=False):
    items = "".join(f'<figure><img src="/uploads/sold/{f}" alt="{t} sold in {c}, Calgary" loading="lazy"><figcaption><b>{c}</b>{SOLD_KO[t] if ko else t}</figcaption></figure>' for f, c, t in SOLD)
    h = "제가 거래를 도와드린 캘거리 주택" if ko else "Homes I Have Helped Clients Buy and Sell in Calgary"
    return f'<section><h2>{h}</h2><div class="gal">{items}</div><p><a href="/{"ko/" if ko else ""}#track-record">{"전체 거래 실적 보기 →" if ko else "See my full track record →"}</a></p></section>'

def form(subject, ko=False, msg_placeholder=""):
    L = (lambda e, k: k if ko else e)
    return f'''<section class="card lead" id="contact"><h2>{L("Talk to Jason – Free Consultation", "무료 상담 신청")}</h2>
<p class="muted">{L("Call or text (403) 399-8124 any time, or send a message below. All consultations are free.", "(403) 399-8124로 언제든지 전화나 문자 주세요. 아래 양식으로 보내셔도 됩니다. 모든 상담은 무료입니다.")}</p>
<form class="lf" data-subject="{html.escape(subject)}">
<input name="name" required placeholder="{L("Your name", "성함")}">
<input name="phone" placeholder="{L("Phone", "전화번호")}">
<input name="email" type="email" required placeholder="{L("Email", "이메일")}">
<textarea name="message" rows="3" placeholder="{html.escape(msg_placeholder)}"></textarea>
<button class="btn btn-red" type="submit">{L("Send Message", "보내기")}</button>
<p class="ok" hidden>{L("Thank you! I will get back to you promptly.", "감사합니다! 빠르게 연락드리겠습니다.")}</p>
</form></section>'''

def page(path, lang, title, desc, h1, lead, body, subject, msg_ph, alt=None, hero=None):
    ko = lang == "ko"; url = f"{SITE}/{path}/"; home = "/ko/" if ko else "/"
    ld = [{"@context": "https://schema.org", "@type": "RealEstateAgent", "name": "Jason Choi Real Estate", "url": SITE + "/",
           "telephone": "+1-403-399-8124", "image": f"{SITE}/assets/jason-choi.jpg", "knowsLanguage": ["en", "ko"],
           "areaServed": ["Calgary", "Airdrie", "Cochrane", "Okotoks", "Chestermere"],
           "address": {"@type": "PostalAddress", "streetAddress": "#305, 1822 10th Avenue SW", "addressLocality": "Calgary", "addressRegion": "AB", "postalCode": "T3C 0J8", "addressCountry": "CA"}},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
              {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + home},
              {"@type": "ListItem", "position": 2, "name": h1, "item": url}]}]
    alt_link = f'<link rel="alternate" hreflang="{alt[0]}" href="{SITE}/{alt[1]}/">' if alt else ""
    hero_img = f'<div class="sp-hero" style="background-image:linear-gradient(90deg,rgba(16,17,20,.88),rgba(16,17,20,.45)),url(/{hero})">' if hero else '<div class="sp-hero">'
    L = (lambda e, k: k if ko else e)
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">{alt_link}
<meta property="og:type" content="website"><meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/{hero or 'assets/jason-choi.jpg'}">
<link rel="icon" href="/assets/logo.jpg">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="stylesheet" href="/css/style.css">
<style>
body{{background:#f4f4f5}}.sp{{max-width:1000px;margin:0 auto;padding:0 20px 50px}}
.sp-top{{background:#fff;border-bottom:2px solid var(--red)}}.sp-top .in{{max-width:1000px;margin:0 auto;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;gap:12px}}
.sp-top img{{height:46px}}@media(max-width:600px){{.sp-top .in{{flex-wrap:wrap}}.sp-top nav{{gap:10px}}}}.sp-top nav{{display:flex;gap:14px;align-items:center;font-size:14px;flex-wrap:wrap}}
.sp-hero{{background:#1d1f24;background-size:cover;background-position:center;color:#fff;border-radius:0 0 16px 16px;padding:54px 34px 46px;margin-bottom:26px}}
.sp-hero h1{{font-size:clamp(26px,4vw,38px);margin:6px 0 12px;line-height:1.2}}.sp .sp-hero p{{color:#e4e5e8;max-width:640px;line-height:1.65;margin:0 0 20px}}
.sp-hero .btns{{display:flex;gap:10px;flex-wrap:wrap}}
.sp section{{margin:0 0 26px}}.sp h2{{font-size:22px;margin:0 0 12px}}.sp p,.sp li{{line-height:1.75;color:#3d4048}}
.card{{background:#fff;border-radius:14px;padding:24px 26px}}.muted{{color:#6b6f78;margin-top:0}}
.mks{{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}}.mk{{background:#f7f7f8;border-radius:10px;padding:12px}}
.mk small{{display:block;color:#6b6f78;font-size:12px}}.mk b{{display:block;font-size:18px;margin:4px 0}}.mk .up{{color:#2f7d4f;font-size:12.5px}}.mk .dn{{color:#C8282B;font-size:12.5px}}
.src{{font-size:12.5px;color:#8a8d94;margin:12px 0 0}}
.gal{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}}.gal figure{{margin:0;background:#fff;border-radius:12px;overflow:hidden}}
.gal img{{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}}.gal figcaption{{padding:10px 12px;font-size:13.5px;color:#6b6f78}}.gal b{{display:block;color:#1d1f24}}
.sp-steps{{counter-reset:s;list-style:none;padding:0;display:grid;gap:10px}}.sp-steps li{{background:#fff;border-radius:12px;padding:14px 18px 14px 58px;position:relative}}
.sp-steps li span{{display:block}}.sp-steps li::before{{counter-increment:s;content:counter(s);position:absolute;left:16px;top:14px;width:28px;height:28px;border-radius:50%;background:var(--red);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center}}
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}.grid2 .card h3{{margin:0 0 6px;font-size:17px}}.grid2 .card p{{margin:0}}
.lf{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}}.lf textarea{{grid-column:1/-1}}.lf input,.lf textarea{{padding:11px 12px;border:1px solid #d9dadf;border-radius:8px;font:inherit}}
.lf button{{justify-self:start}}.lf .ok{{grid-column:1/-1;color:#2f7d4f;font-weight:600}}
.links{{display:flex;gap:8px;flex-wrap:wrap}}.links a{{background:#fff;border:1px solid #e3e4e8;border-radius:20px;padding:7px 14px;font-size:14px}}
.sp-foot{{font-size:13px;color:#6b6f78;border-top:1px solid #e3e4e8;padding-top:18px;margin-top:30px;line-height:1.7}}
@media(max-width:760px){{.mks{{grid-template-columns:1fr 1fr}}.gal{{grid-template-columns:1fr 1fr}}.grid2,.lf{{grid-template-columns:1fr}}.sp-hero{{padding:38px 22px}}}}
</style>
</head>
<body>
<div class="sp-top"><div class="in"><a href="{home}"><img src="/assets/logo.jpg" alt="Jason Choi Real Estate"></a>
<nav><a href="{home}#residential">{L("Homes", "주거용")}</a><a href="{home}#business">{L("Business", "비즈니스")}</a><a href="{"/" if ko else "/ko/"}">{L("한국어", "English")}</a><a class="btn btn-red" href="tel:4033998124">(403) 399-8124</a></nav></div></div>
<div class="sp">
{hero_img}<div class="eyebrow light">{L("Jason Choi, REALTOR® · Since 2007", "최재봉 REALTOR® · 2007년부터")}</div><h1>{h1}</h1><p>{lead}</p>
<div class="btns"><a class="btn btn-red" href="#contact">{L("Free Consultation", "무료 상담")}</a><a class="btn btn-ghost" href="{home}#home-evaluation">{L("What's My Home Worth?", "내 집 가치 알아보기")}</a></div></div>
{body}
{form(subject, ko, msg_ph)}
<section><h2>{L("More for Calgary-Area Buyers and Sellers", "더 알아보기")}</h2><div class="links">
<a href="/calgary-home-buyers/">Calgary Home Buyers</a><a href="/calgary-home-sellers/">Calgary Home Sellers</a><a href="/airdrie-real-estate/">Airdrie</a><a href="/cochrane-real-estate/">Cochrane</a><a href="/okotoks-real-estate/">Okotoks</a><a href="/ko/calgary-korean-realtor/">캘거리 한인 부동산</a><a href="{home}#guides">{L("Free Guides", "무료 가이드")}</a><a href="{"/ko/faq/" if ko else "/faq/"}">FAQ</a></div></section>
<div class="sp-foot">{L("Jason Choi is a REALTOR® with First Place Realty (Alberta), #305, 1822 10th Avenue SW, Calgary AB T3C 0J8, and Maple Supreme Realty Inc. (British Columbia).", "최재봉(Jason Choi)은 First Place Realty(앨버타, #305, 1822 10th Avenue SW, Calgary AB T3C 0J8)와 Maple Supreme Realty Inc.(BC) 소속 REALTOR®입니다.")} {L("Market figures are for general information and are not an appraisal.", "시장 수치는 일반 정보이며 감정 평가가 아닙니다.")} <a href="{home}#privacy">{L("Privacy Policy", "개인정보 처리방침")}</a></div>
</div>
<script>
document.querySelectorAll(".lf").forEach(f=>f.addEventListener("submit",async e=>{{e.preventDefault();const d=new FormData(f);d.append("access_key","{FORM_KEY}");d.append("subject",f.dataset.subject+" – JasonChoiRealEstate.com");d.append("page",location.pathname);
try{{await fetch("https://api.web3forms.com/submit",{{method:"POST",body:d}})}}catch(x){{}}f.querySelector(".ok").hidden=false;f.reset();}}));
</script>
<script src="/js/config.js"></script>
<script>if(window.SITE&&SITE.ga4Id){{var s=document.createElement("script");s.async=1;s.src="https://www.googletagmanager.com/gtag/js?id="+SITE.ga4Id;document.head.appendChild(s);window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config",SITE.ga4Id);}}</script>
</body>
</html>
"""

def steps(items): return '<ol class="sp-steps">' + "".join(f"<li><b>{a}</b><span>{b}</span></li>" for a, b in items) + "</ol>"
def cards(items): return '<div class="grid2">' + "".join(f'<div class="card"><h3>{a}</h3><p>{b}</p></div>' for a, b in items) + "</div>"

PAGES = []

# ---------- Calgary Home Buyers ----------
body = market_box() + f"""
<section><h2>How to Buy a Home in Calgary – Step by Step</h2>{steps([
 ("Get pre-approved", "Talk to a lender or mortgage broker first. The stress test qualifies you at your rate + 2% or 5.25%, whichever is higher. Try my <a href='/#afford'>affordability calculator</a>."),
 ("Pick your area and home type", f"Calgary has 8 CREB® districts with very different prices. A detached home's benchmark is {money(TYPES['detached']['benchmark'])}; an apartment condo's is {money(TYPES['apartment']['benchmark'])}."),
 ("Tour homes with a local expert", "At showings I check Calgary-specific items: hail damage, radon, legal suites, older plumbing, flood maps and school designation."),
 ("Make an offer with conditions", "Most offers include financing, inspection and (for condos) document review conditions, usually 5–10 days."),
 ("Remove conditions and close", "Your lawyer registers the title. Alberta has no land transfer tax – only small Land Titles fees.")])}</section>
<section><h2>Why Buy with Jason Choi</h2>{cards([
 ("Calgary since 2007", "19 years helping first-time buyers, move-up families and investors across Calgary."),
 ("Residential and commercial", "I look at legal suites, rental income and resale value – not just the kitchen."),
 ("English and 한국어", "Contracts, conditions and closing steps explained clearly in your language."),
 ("Free tools and guides", "<a href='/#afford'>Affordability</a>, <a href='/#mortgage'>mortgage</a> and closing cost calculators, plus a free <a href='/#guides'>home purchase cost guide</a>.")])}</section>
""" + sold_gallery()
PAGES.append(("calgary-home-buyers", "en", "Buy a House in Calgary | Calgary Home Buyer Guide – Jason Choi, REALTOR®",
  f"Buying a home in Calgary? Step-by-step guide, {MON_EN} market prices, affordability calculator and free consultation with Jason Choi, Calgary REALTOR® since 2007.",
  "Buying a Home in Calgary", "Local advice, current market data and a clear plan from your first showing to closing day. English and Korean service.",
  body, "Calgary home buyer inquiry", "What are you looking for? Area, type of home, budget, timing…", None, "uploads/sold/edgemont-detached-1.jpg"))

# ---------- Calgary Home Sellers ----------
body = market_box() + f"""
<section><h2>What Is Your Calgary Home Worth?</h2><div class="card"><p>Calgary homes are selling in an average of <b>{T['dom']} days</b> at about <b>{T['saleToList']:.1f}%</b> of list price ({MON_EN}). Pricing right from day one matters. I compare recent sales on your street with CREB® monthly data and give you a free, written market evaluation.</p>
<p><a class="btn btn-red" href="/#home-evaluation">Get a Free Home Evaluation</a></p></div></section>
<section><h2>How I Sell Your Home – 5 Steps</h2>{steps([
 ("Pricing", "Recent sales and CREB® data set a price that attracts buyers without leaving money on the table."),
 ("Preparation", "I order the Real Property Report with City compliance and the RMS measurement early, so there are no delays after an offer."),
 ("Marketing", "Professional photos, MLS®, this website, Instagram, Facebook and the Korean community."),
 ("Offers and negotiation", "Price, conditions, deposits and dates – I negotiate for your best overall result."),
 ("Closing", "I track every condition, lawyer deadline and key handover until closing day.")])}</section>
""" + sold_gallery()
PAGES.append(("calgary-home-sellers", "en", "Sell My House in Calgary | Free Home Evaluation – Jason Choi, REALTOR®",
  f"Selling a home in Calgary? Free market evaluation, {MON_EN} CREB® data and a 5-step selling plan from Jason Choi, Calgary REALTOR® since 2007.",
  "Selling Your Home in Calgary", "A data-based price, careful preparation and strong marketing – with a REALTOR® who has worked in Calgary since 2007.",
  body, "Calgary home seller inquiry", "Your address, home type, and when you would like to sell…", None, "uploads/sold/arbour-lake-detached-1.jpg"))

# ---------- Towns ----------
def town(slug, name, where, why, notes, hero):
    body = f"""
<section class="card"><h2>Living in {name}</h2><p>{where}</p><p>{why}</p></section>
<section><h2>What to Check When Buying in {name}</h2>{cards(notes)}</section>
<section class="card"><h2>Buying or Selling in {name}?</h2><p>I work across Calgary and nearby communities, including {name}. I can compare {name} with Calgary neighbourhoods for you – price, commute, taxes and resale – and show you homes in both. Sellers can get a free market evaluation.</p>
<p><a class="btn btn-red" href="/#home-evaluation">Free Home Evaluation</a> <a class="btn btn-outline" href="/#afford">What Can I Afford?</a></p></section>
""" + market_box()
    PAGES.append((slug, "en", f"{name} Real Estate | REALTOR® in {name}, Alberta – Jason Choi",
      f"Buying or selling a home in {name}, Alberta? Local advice, Calgary-area market data and a free consultation with Jason Choi, REALTOR® since 2007. English and Korean service.",
      f"{name} Real Estate", f"Homes for buyers and sellers in {name} and the Calgary area – with a REALTOR® who has worked here since 2007.",
      body, f"{name} real estate inquiry", f"Tell me what you are looking for in {name}…", None, hero))

town("airdrie-real-estate", "Airdrie",
  "Airdrie is a fast-growing city just north of Calgary on Highway 2 (QEII). Many residents commute to Calgary, and the CrossIron Mills and Balzac area sits between the two cities.",
  "Buyers often look at Airdrie for newer homes and larger lots at prices that can be lower than similar homes in Calgary. It is a popular choice for young families and first-time buyers.",
  [("Commute", "Test the drive on Highway 2 at rush hour. It can change your daily routine."),
   ("New-build warranty", "Many homes are newer. Check the Alberta new home warranty and builder deficiencies."),
   ("Property taxes", "Airdrie sets its own tax rate. Compare the actual tax bill, not just the price."),
   ("Schools and growth", "Check school designation and planned construction near the home.")], "uploads/sold/evanston-detached-1.jpg")
town("cochrane-real-estate", "Cochrane",
  "Cochrane is a town west of Calgary on Highway 1A, along the Bow River, with views toward the Rocky Mountains.",
  "Buyers like Cochrane for its small-town feel, quick access to the mountains and a historic main street, while staying close to Calgary's northwest.",
  [("Hills and slopes", "Many lots are on hills. Check drainage, retaining walls and the Real Property Report."),
   ("Commute", "Highway 1A and Cochrane traffic can be busy at peak times. Test the drive."),
   ("River areas", "Near the Bow River, check flood maps and insurance options."),
   ("Property taxes", "Cochrane sets its own tax rate. Compare the actual tax bill.")], "uploads/sold/cougar-ridge-townhome-1.jpg")
town("okotoks-real-estate", "Okotoks",
  "Okotoks is a town just south of Calgary, connected by Highway 2 and Highway 2A, close to Calgary's southern communities.",
  "Buyers choose Okotoks for its family-friendly neighbourhoods, pathways along the Sheep River and a quieter pace, with an easy drive into south Calgary.",
  [("Commute", "Test the drive to your workplace on Highway 2 or 2A."),
   ("River areas", "Near the Sheep River, check flood maps and insurance options."),
   ("Water and growth", "Ask about town servicing and new development plans near the home."),
   ("Property taxes", "Okotoks sets its own tax rate. Compare the actual tax bill.")], "uploads/sold/arbour-lake-detached-1.jpg")

# ---------- Korean page ----------
body = market_box(ko=True) + f"""
<section><h2>왜 최재봉 리얼터인가요?</h2>{cards([
 ("2007년부터 캘거리", "19년 동안 첫 집 구매, 이사, 투자, 비즈니스 매매를 도와드렸습니다."),
 ("주거용 + 상업용", "주택, 콘도, 타운하우스부터 식당, 주유소, 리커스토어, 호텔 등 비즈니스 매매와 상업용 리스까지 한 사람에게 맡기세요."),
 ("한국어로 쉽고 정확하게", "계약서, 조건, 클로징 절차를 한국어로 쉽게 설명해 드립니다. 카카오톡(calgaryjason) 상담도 가능합니다."),
 ("앨버타 + BC 면허", "First Place Realty(앨버타)와 Maple Supreme Realty Inc.(BC) 소속으로 두 개 주에서 활동합니다.")])}</section>
<section><h2>이런 분들을 도와드립니다</h2>{steps([
 ("캘거리 첫 집 구매", "구매 가능 금액 계산, 동네 비교, 클로징 비용까지 처음부터 함께합니다. <a href='/ko/#afford'>구매 가능 금액 계산기</a>"),
 ("집 팔기", "CREB® 통계와 같은 동네 최근 거래로 무료 시장 가치 평가를 해 드립니다. <a href='/ko/#home-evaluation'>무료 가치 평가</a>"),
 ("부동산 투자", "캡레이트, 현금 흐름, 합법 스위트, 세금 기본까지 숫자로 함께 검토합니다."),
 ("비즈니스 매매", "식당, 편의점, 주유소, 리커스토어 등 비즈니스를 비공개로 사고팔 수 있도록 돕습니다. <a href='/ko/#business'>비즈니스 매물</a>"),
 ("캐나다에 새로 오신 분", "캘거리 동네, 학교, 렌트와 구매 비교 등 정착에 필요한 부동산 정보를 안내합니다.")])}</section>
<section class="card"><h2>한국어 무료 가이드</h2><p>주택 구매 비용, 신축 주택 구매, 집 팔기, 콘도 서류 검토, 비즈니스 인수 체크리스트, 비즈니스 가치 평가, 투자 부동산 가이드 등을 한국어로 받아 보세요.</p>
<p><a class="btn btn-red" href="/ko/#guides">무료 가이드 보기</a> <a class="btn btn-outline" href="/ko/faq/">자주 묻는 질문</a></p></section>
""" + sold_gallery(ko=True)
PAGES.append(("ko/calgary-korean-realtor", "ko", "캘거리 한인 부동산 | 한국어 리얼터 최재봉 (Jason Choi) – 2007년부터",
  "캘거리 한인 부동산 리얼터 최재봉(Jason Choi). 2007년부터 캘거리 주택·콘도 매매, 비즈니스 매매, 상업용 리스, 투자 부동산. 한국어 상담, 무료 가치 평가와 한국어 가이드.",
  "캘거리 한인 부동산 – 한국어로 편하게 상담하세요", "2007년부터 캘거리에서 활동한 최재봉 REALTOR®가 집 사기, 집 팔기, 투자, 비즈니스 매매를 한국어로 도와드립니다.",
  body, "캘거리 한인 부동산 문의 (Korean page)", "원하시는 지역, 주택 종류, 예산, 시기 등을 적어 주세요.", None, "uploads/sold/edgemont-detached-1.jpg"))

for path, lang, title, desc, h1, lead, body, subj, ph, alt, hero in PAGES:
    out = ROOT / path / "index.html"; out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(path, lang, title, desc, h1, lead, body, subj, ph, alt, hero), encoding="utf-8")
print("SEO pages written:", len(PAGES))
