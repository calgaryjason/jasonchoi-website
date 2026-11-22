#!/usr/bin/env python3
"""Build the monthly client newsletter (English + Korean) as email-safe HTML.

Reads:  data/market.json      - CREB monthly statistics
        data/listings.json    - Jason's own listings (active ones are shown)
        data/newsletter.json  - personal note for this month (editable in Pages CMS)
Writes: newsletter/latest-en.html, newsletter/latest-ko.html
        newsletter/YYYY-MM-en.html, newsletter/YYYY-MM-ko.html  (web archive copy)
        newsletter/meta.json  (subjects, issue month, data month - used by the sender)
"""
import json, os, html, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://jasonchoirealestate.com"
OUT = os.path.join(ROOT, "newsletter")

RED, DARK, GREY, LIGHT, LINE = "#c8102e", "#1f2328", "#5b6270", "#f5f5f3", "#e4e4e0"
MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July",
             "August", "September", "October", "November", "December"]
TYPE_NAMES = {"detached": ("Detached", "단독주택"), "semi": ("Semi-detached", "세미 디태치드"),
              "row": ("Row / Townhome", "타운하우스"), "apartment": ("Apartment Condo", "아파트 콘도")}
CAT_KO = {"restaurant": "식당", "grocery": "편의점·식료품점", "laundry": "세탁소·수선", "beauty": "미용실·네일",
          "retail-office": "상가·사무실", "gas-station": "주유소", "liquor-store": "리커 스토어", "hotel": "호텔·모텔"}


def load(name):
    with open(os.path.join(ROOT, "data", name), encoding="utf-8") as f:
        return json.load(f)


def esc(s):
    return html.escape(str(s or ""), quote=True)


def money(n):
    return "${:,.0f}".format(n)


def pct(n, ko=False):
    sign = "+" if n > 0 else ""
    return f"{sign}{n:.1f}%"


def market_word(months, ko):
    """CREB rule of thumb: under 4 months = sellers' market, 4-6 = balanced, over 6 = buyers'."""
    if months < 4:
        return ("판매자 우위" if ko else "Seller's market"), RED
    if months <= 6:
        return ("균형 시장" if ko else "Balanced"), "#b26a00"
    return ("구매자 우위" if ko else "Buyer's market"), "#1a7f37"


def stat_box(label, value, sub):
    return f"""<td width="25%" valign="top" style="padding:6px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{LIGHT};border-radius:8px">
    <tr><td style="padding:14px 10px;text-align:center;font-family:Arial,Helvetica,sans-serif">
      <div style="font-size:12px;color:{GREY};line-height:16px">{label}</div>
      <div style="font-size:20px;font-weight:bold;color:{DARK};line-height:28px;margin-top:4px">{value}</div>
      <div style="font-size:12px;color:{GREY};line-height:16px">{sub}</div>
    </td></tr>
  </table></td>"""


def h2(text):
    return (f'<tr><td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif">'
            f'<div style="font-size:12px;letter-spacing:1px;color:{RED};font-weight:bold;text-transform:uppercase">{text[0]}</div>'
            f'<div style="font-size:22px;color:{DARK};font-weight:bold;line-height:30px;margin-top:4px">{text[1]}</div></td></tr>')


def p(text, size=15, color=DARK, pad="8px 28px"):
    return (f'<tr><td style="padding:{pad};font-family:Arial,Helvetica,sans-serif;font-size:{size}px;'
            f'line-height:{int(size * 1.6)}px;color:{color}">{text}</td></tr>')


def button(href, text, bg=RED):
    return (f'<a href="{href}" style="display:inline-block;background:{bg};color:#ffffff;text-decoration:none;'
            f'font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;padding:12px 22px;border-radius:6px">{text}</a>')


def thumb(photo):
    """Crop each listing photo to the same 4:3 size so the cards line up in every email app."""
    if not photo:
        return photo
    out = f"newsletter/img/{os.path.splitext(os.path.basename(photo))[0]}.jpg"
    src, dst = os.path.join(ROOT, photo), os.path.join(ROOT, out)
    try:
        from PIL import Image, ImageOps
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            ImageOps.fit(im, (528, 396), Image.LANCZOS).save(dst, quality=82, optimize=True)
        return out
    except Exception as e:  # Pillow missing or bad file: fall back to the original photo
        print("thumbnail skipped:", photo, e)
        return photo


def listing_card(l, ko):
    url = f"{SITE}/listing/{l['id']}/"
    photo = (l.get("photos") or [l.get("photo")])[0]
    title = (l.get("title_ko") if ko else None) or l.get("title_en") or l.get("address")
    if l.get("type") in ("residential", "condo", "townhome"):
        bits = []
        if l.get("beds"): bits.append(f"침실 {l['beds']}" if ko else f"{l['beds']} bed")
        if l.get("baths"): bits.append(f"욕실 {l['baths']}" if ko else f"{l['baths']} bath")
        if l.get("sqft"): bits.append(f"{l['sqft']:,} sq.ft.")
    else:
        cat = l.get("category", "")
        bits = [CAT_KO.get(cat, "상업용") if ko else cat.replace("-", " ").title()]
        if l.get("sqft"): bits.append(f"{l['sqft']:,} sq.ft.")
    price = money(l["price"]) if l.get("price") else ("임대 문의" if ko else "For lease")
    view = "자세히 보기 →" if ko else "View details →"
    photo = thumb(photo)
    img = (f'<a href="{url}"><img src="{SITE}/{photo}" width="264" height="198" alt="{esc(title)}" '
           f'style="display:block;width:100%;max-width:264px;height:auto;border-radius:8px 8px 0 0;border:0"></a>') if photo else ""
    return f"""<td width="50%" valign="top" style="padding:8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid {LINE};border-radius:8px">
    <tr><td>{img}</td></tr>
    <tr><td style="padding:12px 14px 16px;font-family:Arial,Helvetica,sans-serif">
      <div style="font-size:18px;font-weight:bold;color:{RED}">{price}</div>
      <div style="font-size:15px;font-weight:bold;color:{DARK};line-height:21px;margin-top:4px"><a href="{url}" style="color:{DARK};text-decoration:none">{esc(title)}</a></div>
      <div style="font-size:13px;color:{GREY};line-height:19px;margin-top:4px">{esc(l.get('city', ''))} · {esc(' · '.join(bits))}</div>
      <div style="font-size:13px;margin-top:8px"><a href="{url}" style="color:{RED};text-decoration:none;font-weight:bold">{view}</a></div>
    </td></tr>
  </table></td>"""


def build(ko, market, listings, cfg, issue_label, data_label, web_url):
    t = market["total"]
    word, color = market_word(t["monthsSupply"], ko)

    if ko:
        title = f"캘거리 부동산 소식 · {issue_label}"
        hello = "안녕하세요, 최재봉(Jason Choi) 리얼터입니다."
        note = cfg.get("note_ko", "")
    else:
        title = f"Calgary Real Estate Update · {issue_label}"
        hello = "Hello,"
        note = cfg.get("note_en", "")

    rows = []
    # Header
    rows.append(f"""<tr><td style="padding:22px 28px;border-bottom:3px solid {RED}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td valign="middle"><a href="{SITE}/"><img src="{SITE}/assets/logo.jpg" width="170" alt="Jason Choi Real Estate" style="display:block;border:0;width:170px;height:auto"></a></td>
    <td valign="middle" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{GREY};line-height:19px">
      {"월간 뉴스레터" if ko else "Monthly Newsletter"}<br><b style="color:{DARK}">{issue_label}</b></td>
  </tr></table></td></tr>""")
    rows.append(p(f'<span style="font-size:24px;font-weight:bold;line-height:32px">{esc(title)}</span>', pad="26px 28px 4px"))
    rows.append(p(f"{hello}<br>{esc(note)}"))

    # Market snapshot
    rows.append(h2(("시장 동향" if ko else "Market snapshot",
                    f"캘거리 {data_label} 시장 통계" if ko else f"Calgary market – {data_label}")))
    sales_sub = (f"전년 대비 {pct(t['salesYoy'])}" if ko else f"{pct(t['salesYoy'])} vs last year")
    bench_sub = (f"전년 대비 {pct(t['yoy'])}" if ko else f"{pct(t['yoy'])} vs last year")
    boxes = [
        stat_box("기준 가격" if ko else "Benchmark price", money(t["benchmark"]), bench_sub),
        stat_box("거래량" if ko else "Sales", f"{t['sales']:,}", sales_sub),
        stat_box("매물 재고" if ko else "Inventory", f"{t['inventory']:,}", (f"신규 매물 {t['newListings']:,}" if ko else f"{t['newListings']:,} new listings")),
        stat_box("재고 소진 기간" if ko else "Months of supply", f"{t['monthsSupply']:.1f}", f'<span style="color:{color};font-weight:bold">{word}</span>'),
    ]
    rows.append(f'<tr><td style="padding:6px 22px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{"".join(boxes)}</tr></table></td></tr>')
    extra = (f"평균 판매 기간은 {t['dom']}일, 호가 대비 판매가 비율은 {t['saleToList']:.1f}%입니다." if ko
             else f"Homes sold in {t['dom']} days on average, at {t['saleToList']:.1f}% of the list price.")
    rows.append(p(esc(market.get("summaryKo" if ko else "summaryEn", "")) + " " + extra))

    # By property type
    head = ("주택 유형", "기준 가격", "전년 대비", "소진 기간", "시장") if ko else ("Property type", "Benchmark", "Year over year", "Months supply", "Market")
    th = "".join(f'<td style="padding:9px 8px;font-size:12px;color:{GREY};font-weight:bold;border-bottom:2px solid {LINE}">{h}</td>' for h in head)
    trs = []
    for row in market.get("types", []):
        w, c = market_word(row["monthsSupply"], ko)
        name = TYPE_NAMES.get(row["type"], (row["type"], row["type"]))[1 if ko else 0]
        yc = "#1a7f37" if row["yoy"] > 0 else RED if row["yoy"] < 0 else DARK
        trs.append(
            f'<tr><td style="padding:9px 8px;border-bottom:1px solid {LINE};font-size:14px;color:{DARK}">{name}</td>'
            f'<td style="padding:9px 8px;border-bottom:1px solid {LINE};font-size:14px;color:{DARK};font-weight:bold">{money(row["benchmark"])}</td>'
            f'<td style="padding:9px 8px;border-bottom:1px solid {LINE};font-size:14px;color:{yc}">{pct(row["yoy"])}</td>'
            f'<td style="padding:9px 8px;border-bottom:1px solid {LINE};font-size:14px;color:{DARK}">{row["monthsSupply"]:.1f}</td>'
            f'<td style="padding:9px 8px;border-bottom:1px solid {LINE};font-size:13px;color:{c};font-weight:bold">{w}</td></tr>')
    rows.append(f'<tr><td style="padding:10px 28px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif"><tr>{th}</tr>{"".join(trs)}</table></td></tr>')

    # What it means - written from this month's numbers
    hot = [TYPE_NAMES[r["type"]][1 if ko else 0] for r in market.get("types", []) if r["monthsSupply"] < 4 and r["type"] in TYPE_NAMES]
    soft = [TYPE_NAMES[r["type"]][1 if ko else 0] for r in market.get("types", []) if r["monthsSupply"] >= 4 and r["type"] in TYPE_NAMES]
    j = (lambda xs: ", ".join(xs)) if ko else (lambda xs: " and ".join(xs) if len(xs) < 3 else ", ".join(xs[:-1]) + " and " + xs[-1])
    if ko:
        buy = []
        if soft: buy.append(f"{j(soft)}는 매물이 넉넉해 가격 협상의 여지가 있습니다.")
        if hot: buy.append(f"{j(hot)}는 경쟁이 있으니 모기지 사전 승인을 먼저 받아 두세요.")
        sell = "적정한 가격 설정이 가장 중요합니다. 우리 동네의 최근 거래 사례를 바탕으로 무료로 가치를 평가해 드립니다."
        mean = f"<b>구매자께:</b> {' '.join(buy)}<br><b>판매자께:</b> {sell}"
    else:
        buy = []
        if soft: buy.append(f"{j(soft)} buyers have more choice and room to negotiate.")
        if hot: buy.append(f"{j(hot)} homes are still competitive, so get your mortgage pre-approval first.")
        sell = "The right price matters most. I can give you a free evaluation based on recent sales in your neighbourhood."
        mean = f"<b>Buyers:</b> {' '.join(buy)}<br><b>Sellers:</b> {sell}"
    rows.append(p(mean, size=14, pad="14px 28px 6px"))
    src = "자료: " if ko else "Source: "
    rows.append(p(f'{src}<a href="{esc(market.get("sourceUrl", ""))}" style="color:{GREY}">{esc(market.get("source", ""))}</a>', size=12, color=GREY, pad="2px 28px 6px"))

    # Listings
    act = [l for l in listings if l.get("status") == "active"]
    act.sort(key=lambda l: (not l.get("featured"), l.get("type") not in ("residential", "condo", "townhome")))
    act = act[: int(cfg.get("maxListings", 6))]
    if act:
        rows.append(h2(("내 매물" if ko else "My listings",
                        "현재 진행 중인 매물" if ko else "Properties I am marketing now")))
        cards = [listing_card(l, ko) for l in act]
        grid = ""
        for i in range(0, len(cards), 2):
            pair = cards[i:i + 2] + (['<td width="50%"></td>'] if len(cards[i:i + 2]) == 1 else [])
            grid += f"<tr>{''.join(pair)}</tr>"
        rows.append(f'<tr><td style="padding:4px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">{grid}</table></td></tr>')
        more = "모든 매물 보기" if ko else "See all listings"
        rows.append(f'<tr><td align="center" style="padding:10px 28px 4px">{button(SITE + "/#business", more, DARK)}</td></tr>')

    # Call to action
    if ko:
        cta_t, cta_p = "내 집, 내 비즈니스는 지금 얼마일까요?", "최근 거래 자료를 바탕으로 무료로 가치를 평가해 드립니다. 부담 없이 연락 주세요."
        b1, b2 = button(SITE + "/#home-evaluation", "무료 가치 평가 받기"), button("tel:+14033998124", "전화 403-399-8124", DARK)
    else:
        cta_t, cta_p = "What is your home or business worth today?", "Get a free, no-obligation evaluation based on recent sales."
        b1, b2 = button(SITE + "/#home-evaluation", "Get a free evaluation"), button("tel:+14033998124", "Call 403-399-8124", DARK)
    rows.append(f"""<tr><td style="padding:26px 28px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{LIGHT};border-radius:10px">
  <tr><td style="padding:22px;text-align:center;font-family:Arial,Helvetica,sans-serif">
    <div style="font-size:19px;font-weight:bold;color:{DARK};line-height:27px">{cta_t}</div>
    <div style="font-size:14px;color:{GREY};line-height:22px;margin:6px 0 16px">{cta_p}</div>
    {b1}&nbsp;&nbsp;{b2}
  </td></tr></table></td></tr>""")

    # Signature + footer (CASL: name, mailing address, contact, unsubscribe)
    rows.append(f"""<tr><td style="padding:22px 28px 10px;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td valign="top" style="padding-right:14px"><img src="{SITE}/assets/jason-choi.jpg" width="72" alt="Jason Choi" style="display:block;border-radius:50%;width:72px;height:72px;object-fit:cover"></td>
    <td valign="top" style="font-size:14px;line-height:21px;color:{DARK}">
      <b>Jason Choi (최재봉), REALTOR®</b><br>
      <span style="color:{GREY}">{"주거용 · 상업용 부동산 전문 · 2007년부터" if ko else "Residential &amp; Commercial · Since 2007"}</span><br>
      <a href="tel:+14033998124" style="color:{RED};text-decoration:none">403-399-8124</a> ·
      <a href="mailto:CalgaryJason@gmail.com" style="color:{RED};text-decoration:none">CalgaryJason@gmail.com</a><br>
      <a href="{SITE}/" style="color:{RED};text-decoration:none">JasonChoiRealEstate.com</a>
    </td></tr></table></td></tr>""")
    if ko:
        foot = ("이 메일은 Jason Choi와 거래하셨거나 문의하셨던 분, 또는 소식 받기에 동의하신 분께 보내 드립니다. "
                "더 이상 받기를 원하지 않으시면 언제든지 아래에서 수신 거부하실 수 있습니다.")
        unsub, webv = "수신 거부", "웹 브라우저로 보기"
    else:
        foot = ("You are receiving this email because you are a past or current client, you contacted me, "
                "or you signed up for updates. You can unsubscribe at any time.")
        unsub, webv = "Unsubscribe", "View in browser"
    rows.append(f"""<tr><td style="padding:18px 28px 26px;border-top:1px solid {LINE};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:{GREY}">
  Jason Choi, REALTOR® · First Place Realty · #305, 1822 10th Avenue SW, Calgary, AB T3C 0J8<br>
  {foot}<br>
  <a href="{{{{ unsubscribe }}}}" style="color:{GREY}">{unsub}</a> · <a href="{web_url}" style="color:{GREY}">{webv}</a><br>
  {"이 뉴스레터는 정보 제공 목적이며, 이미 다른 리얼터와 계약 중인 분께 권유하려는 것이 아닙니다." if ko else "This newsletter is for information only and is not intended to solicit clients already under contract with another brokerage."}
</td></tr>""")

    preheader = (f"{data_label} 캘거리 기준 가격 {money(t['benchmark'])}, 거래 {t['sales']:,}건, 그리고 새 매물 소식"
                 if ko else f"Calgary benchmark {money(t['benchmark'])}, {t['sales']:,} sales in {data_label}, plus my current listings")
    lang = "ko" if ko else "en"
    return f"""<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>{esc(title)}</title></head>
<body style="margin:0;padding:0;background:#eceae6">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eceae6"><tr><td align="center" style="padding:20px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden">
{''.join(rows)}
</table></td></tr></table></body></html>"""


def main():
    market, listings, cfg = load("market.json"), load("listings.json"), load("newsletter.json")
    if isinstance(listings, dict):
        listings = listings.get("listings", [])
    y, m = map(int, market["month"].split("-"))
    iy, im = (y + 1, 1) if m == 12 else (y, m + 1)   # newsletter goes out the month after the data month
    issue = f"{iy}-{im:02d}"
    labels = {
        "en": (f"{MONTHS_EN[im - 1]} {iy}", f"{MONTHS_EN[m - 1]} {y}"),
        "ko": (f"{iy}년 {im}월호", f"{y}년 {m}월"),
    }
    os.makedirs(OUT, exist_ok=True)
    meta = {"issue": issue, "dataMonth": market["month"], "subjects": {}}
    for lang in ("en", "ko"):
        web_url = f"{SITE}/newsletter/{issue}-{lang}"
        doc = build(lang == "ko", market, listings, cfg, labels[lang][0], labels[lang][1], web_url)
        for name in (f"latest-{lang}.html", f"{issue}-{lang}.html"):
            with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
                f.write(doc)
    meta["subjects"]["en"] = f"Calgary Real Estate Update – {labels['en'][0]}: {labels['en'][1]} market + my listings"
    meta["subjects"]["ko"] = f"[캘거리 부동산 소식] {labels['ko'][0]} – {labels['ko'][1]} 시장 동향과 추천 매물"
    with open(os.path.join(OUT, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"Built newsletter {issue} (data {market['month']})")


if __name__ == "__main__":
    main()
