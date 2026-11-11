# FAQ content (EN + KO). Run:  python3 scripts/faq_content.py   → writes faq/index.html and ko/faq/index.html
import json, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://jasonchoirealestate.com"

EN = [
 ("Is there a Korean-speaking REALTOR® in Calgary?",
  "Yes. Jason Choi (최재봉) is a Calgary REALTOR® who serves clients in both English and Korean. He has worked in real estate since 2007 and is licensed in Alberta (First Place Realty) and British Columbia (Maple Supreme Realty Inc.)."),
 ("What kinds of real estate does Jason Choi handle?",
  "Business sales (restaurants, gas stations, hotels and motels, liquor stores, car washes, convenience and grocery stores, dry cleaners, salons and more), commercial leasing, investment properties, and residential homes and condos."),
 ("Which areas does he serve?",
  "Calgary and surrounding communities such as Airdrie, Chestermere, Cochrane and Okotoks, other Alberta towns (including Red Deer and Lethbridge), and British Columbia."),
 ("How do I buy a business in Calgary?",
  "The usual steps are: sign a confidentiality agreement, review the information package, make an offer with conditions (financing, due diligence, lease assignment, licences), complete due diligence with your accountant and lawyer, remove conditions, and close with an inventory count and handover. A free step-by-step checklist is available on the Free Guides page."),
 ("How much is my business worth?",
  "Small businesses are usually valued as a multiple of the owner’s earnings (SDE) or EBITDA, plus inventory and equipment. The multiple depends on the industry, the lease, how stable the earnings are and how much the business depends on the owner. Jason offers a free, confidential opinion of value for business owners."),
 ("Can I sell my business confidentially?",
  "Yes. Businesses can be marketed without naming the business, with buyers signing a confidentiality agreement before receiving details. Some businesses are offered off-market to a private list of qualified buyers."),
 ("What are off-market (pocket) listings?",
  "Businesses and properties that are not advertised on MLS®. Qualified buyers can request details after agreeing to keep the information confidential. See the Off-Market page on the website."),
 ("Do you help with commercial leases?",
  "Yes — finding retail, restaurant, office and industrial space, comparing total occupancy costs, and negotiating lease terms such as rent, free rent, improvements, renewal options and assignment rights."),
 ("What does it cost to buy a home in Alberta compared with BC?",
  "Alberta has no land transfer tax — buyers pay small land titles registration fees (about $1,300 on a $600,000 home with a typical mortgage). BC charges Property Transfer Tax (about $10,000 on $600,000), though first-time buyers and buyers of new homes may be exempt. See the free Home Purchase Cost Guide."),
 ("Is the website available in Korean?",
  "Yes. The Korean version is at jasonchoirealestate.com/ko/, and several free guides are written in Korean, including home buying costs, new home buying, home selling, condo documents and a business purchase checklist."),
 ("How can I contact Jason Choi?",
  "Call or text (403) 399-8124, email CalgaryJason@gmail.com, WhatsApp +1 403-399-8124, or KakaoTalk ID calgaryjason. Office: First Place Realty, #305, 1822 10th Avenue SW, Calgary AB."),
]
KO = [
 ("캘거리에 한국어가 가능한 부동산 리얼터가 있나요?",
  "네. 최재봉(Jason Choi)은 영어와 한국어로 상담하는 캘거리 REALTOR®입니다. 2007년부터 부동산 업무를 해 왔으며, 앨버타(First Place Realty)와 BC(Maple Supreme Realty Inc.) 두 개 주의 면허를 갖고 있습니다."),
 ("어떤 부동산을 주로 다루나요?",
  "비즈니스 매매(식당, 주유소, 호텔·모텔, 리커스토어, 세차장, 편의점·그로서리, 세탁소, 미용실 등), 상업용 리스, 투자 부동산, 주택과 콘도 매매를 모두 다룹니다."),
 ("어느 지역에서 활동하나요?",
  "캘거리와 에어드리, 체스터미어, 코크런, 오코톡스 등 주변 도시, 레드디어·레스브리지 등 앨버타 지역, 그리고 BC에서 활동합니다."),
 ("캘거리에서 비즈니스를 인수하려면 어떻게 하나요?",
  "일반적인 순서는 비밀 유지 계약서 서명 → 정보 패키지 검토 → 조건부 오퍼(융자, 실사, 리스 양도, 라이선스) → 회계사·변호사와 실사 → 조건 해제 → 재고 조사와 인수인계 후 클로징입니다. 무료 한국어 체크리스트를 Free Guides 페이지에서 받을 수 있습니다."),
 ("제 비즈니스의 가치는 얼마인가요?",
  "소규모 비즈니스는 보통 오너 수익(SDE)이나 EBITDA에 업종별 배수를 곱하고, 재고와 장비를 더해 평가합니다. 배수는 업종, 리스 조건, 수익의 안정성, 오너 의존도에 따라 달라집니다. 사업주를 위한 무료 비공개 가치 평가 상담을 제공합니다."),
 ("비즈니스를 비밀리에 팔 수 있나요?",
  "네. 상호를 공개하지 않고 홍보할 수 있으며, 구매자는 비밀 유지 계약서에 서명한 후에만 자세한 정보를 받습니다. 일부 매물은 MLS®에 올리지 않고 확인된 구매자에게만 비공개로 소개합니다."),
 ("비공개 매물(Pocket Listing)이 무엇인가요?",
  "MLS®에 공개하지 않는 비즈니스와 부동산입니다. 비밀 유지에 동의한 확인된 구매자는 상세 정보를 요청할 수 있습니다. 웹사이트의 '비공개 매물' 페이지를 참고하세요."),
 ("상업용 리스도 도와주나요?",
  "네. 매장, 식당, 사무실, 창고 공간을 찾고, 총 임대 비용을 비교하고, 임대료·무료 임대 기간·인테리어 지원·갱신 옵션·양도 조건 등을 협상해 드립니다."),
 ("앨버타와 BC에서 집을 살 때 비용 차이는?",
  "앨버타는 토지 양도세가 없고 소액의 등기 수수료만 냅니다($600,000 주택 기준 약 $1,300). BC는 부동산 양도세가 있습니다($600,000 기준 약 $10,000). 단, 첫 주택 구매자와 신축 주택 구매자는 면제받을 수 있습니다. 무료 한국어 '주택 구매 비용 가이드'를 참고하세요."),
 ("웹사이트를 한국어로 볼 수 있나요?",
  "네. 한국어 페이지는 jasonchoirealestate.com/ko/ 입니다. 주택 구매 비용, 신축 주택 구매, 집 팔기, 콘도 서류 검토, 비즈니스 인수 체크리스트 등 한국어 무료 가이드도 있습니다."),
 ("연락은 어떻게 하나요?",
  "전화·문자 (403) 399-8124, 이메일 CalgaryJason@gmail.com, WhatsApp +1 403-399-8124, 카카오톡 ID calgaryjason. 사무실: First Place Realty, #305, 1822 10th Avenue SW, Calgary AB."),
]

def page(lang, items):
    ko = lang == "ko"
    url = f"{SITE}/ko/faq/" if ko else f"{SITE}/faq/"
    title = "자주 묻는 질문 | 최재봉 부동산 – 캘거리 한인 리얼터" if ko else "FAQ | Jason Choi Real Estate – Korean-Speaking REALTOR® in Calgary"
    desc = ("캘거리 한인 리얼터 최재봉(Jason Choi)에게 자주 묻는 질문: 비즈니스 매매, 가치 평가, 상업용 리스, 주택 구매 비용, 한국어 상담."
            if ko else "Frequently asked questions for Jason Choi, a Korean-speaking Calgary REALTOR® since 2007: business sales, valuations, commercial leasing, home buying costs.")
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang,
          "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}
    qa = "\n".join(f'<div class="qa"><h2>{html.escape(q)}</h2><p>{html.escape(a)}</p></div>' for q, a in items)
    other = ('<a href="/faq/">English</a>' if ko else '<a href="/ko/faq/">한국어</a>')
    home = "/ko/" if ko else "/"
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{SITE}/faq/">
<link rel="alternate" hreflang="ko" href="{SITE}/ko/faq/">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{SITE}/assets/jason-choi.jpg">
<meta property="og:url" content="{url}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="stylesheet" href="/css/style.css">
<style>
body{{background:#f4f4f5}}.fq{{max-width:860px;margin:0 auto;padding:28px 20px 60px}}
.fq-top{{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:26px}}.fq-top img{{height:48px}}
.fq-top nav{{display:flex;gap:14px;align-items:center;font-size:14px}}
.fq h1{{font-size:30px;margin:0 0 6px}}.fq .lead{{color:#5b5f68;margin-bottom:22px}}
.qa{{background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:12px}}.qa h2{{font-size:17px;margin:0 0 8px;color:#1d1f24}}
.qa p{{margin:0;line-height:1.75;color:#3d4048}}
</style>
</head>
<body>
<div class="fq">
  <div class="fq-top"><a href="{home}"><img src="/assets/logo.jpg" alt="Jason Choi Real Estate"></a>
    <nav>{other}<a class="btn btn-red" href="tel:4033998124">(403) 399-8124</a></nav></div>
  <div class="eyebrow">{"자주 묻는 질문" if ko else "FAQ"}</div>
  <h1>{"최재봉 부동산 — 자주 묻는 질문" if ko else "Jason Choi Real Estate — Frequently Asked Questions"}</h1>
  <p class="lead">{"캘거리 한인 리얼터 · 2007년부터 · 앨버타 & BC 면허 · 영어·한국어 상담" if ko else "Korean-speaking REALTOR® in Calgary · Since 2007 · Licensed in Alberta & BC · English and 한국어"}</p>
  {qa}
  <div class="cta" style="margin-top:22px"><a class="btn btn-red" href="{home}">{"웹사이트 홈으로 →" if ko else "Visit the website →"}</a> <a class="btn btn-outline" href="{home}#guides">{"무료 가이드 보기" if ko else "Free Guides"}</a></div>
</div>
</body>
</html>
"""

for lang, items, path in [("en", EN, ROOT / "faq" / "index.html"), ("ko", KO, ROOT / "ko" / "faq" / "index.html")]:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page(lang, items), encoding="utf-8")
print("FAQ pages written")
