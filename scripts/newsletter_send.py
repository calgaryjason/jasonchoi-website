#!/usr/bin/env python3
"""Create the monthly newsletter campaigns in Brevo (free plan) and send them.

Settings (GitHub -> Settings -> Secrets and variables -> Actions):
  Secret   BREVO_API_KEY      - Brevo API key
  Variable BREVO_LIST_EN      - Brevo list ID for English subscribers (number)
  Variable BREVO_LIST_KO      - Brevo list ID for Korean subscribers (number)
  Variable NEWSLETTER_SENDER  - verified sender email in Brevo, e.g. jason@jasonchoirealestate.com
  Variable AUTO_SEND          - "true" = send to the lists automatically.
                                Anything else = create drafts + send a test copy to Jason only.
Safety: if data/market.json is not last month's data, nothing goes to clients (test copy only).
"""
import json, os, sys, datetime, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.brevo.com/v3"
KEY = os.environ.get("BREVO_API_KEY", "").strip()
SENDER = os.environ.get("NEWSLETTER_SENDER", "").strip()
TEST_TO = os.environ.get("NEWSLETTER_TEST_TO", "CalgaryJason@gmail.com").strip()
AUTO = os.environ.get("AUTO_SEND", "").strip().lower() == "true"
FORCE = os.environ.get("FORCE_SEND", "").strip().lower() == "true"


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"api-key": KEY, "accept": "application/json",
                                          "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Brevo {method} {path} failed: {e.code} {e.read().decode()[:400]}")


def main():
    if not KEY or not SENDER:
        print("BREVO_API_KEY or NEWSLETTER_SENDER is not set - newsletter built but not sent.")
        return
    meta = json.load(open(os.path.join(ROOT, "newsletter", "meta.json"), encoding="utf-8"))
    today = datetime.date.today()
    last = (today.replace(day=1) - datetime.timedelta(days=1)).strftime("%Y-%m")
    fresh = meta["dataMonth"] == last
    live = AUTO and (fresh or FORCE)
    if AUTO and not fresh and not FORCE:
        print(f"Market data is for {meta['dataMonth']}, expected {last}. Sending a test copy only.")

    for lang in ("en", "ko"):
        list_id = os.environ.get(f"BREVO_LIST_{lang.upper()}", "").strip()
        if not list_id:
            print(f"No list ID for {lang} - skipped.")
            continue
        html = open(os.path.join(ROOT, "newsletter", f"latest-{lang}.html"), encoding="utf-8").read()
        camp = call("POST", "/emailCampaigns", {
            "name": f"Newsletter {meta['issue']} ({lang.upper()})",
            "subject": meta["subjects"][lang],
            "sender": {"name": "Jason Choi, REALTOR®" if lang == "en" else "최재봉 Jason Choi 리얼터", "email": SENDER},
            "replyTo": "CalgaryJason@gmail.com",
            "htmlContent": html,
            "recipients": {"listIds": [int(list_id)]},
        })
        cid = camp.get("id")
        print(f"Created Brevo campaign {cid} ({lang})")
        if live:
            call("POST", f"/emailCampaigns/{cid}/sendNow")
            print(f"Sent campaign {cid} to list {list_id}")
        else:
            try:
                call("POST", f"/emailCampaigns/{cid}/sendTest", {"emailTo": [TEST_TO]})
                print(f"Test copy sent to {TEST_TO}. Open Brevo -> Campaigns to send it to clients.")
            except SystemExit as e:
                print(f"Draft saved in Brevo (test copy not sent: {e})")


if __name__ == "__main__":
    main()
