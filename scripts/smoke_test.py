#!/usr/bin/env python3
import json
import os
import sys
import time
import uuid
from urllib import request, parse, error


def http_post_json(url: str, payload: dict, timeout: int = 10):
    data = json.dumps(payload).encode('utf-8')
    req = request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
            body = resp.read()
            return status, body
    except error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        print(f"POST {url} failed: {e}", file=sys.stderr)
        return None, None


def http_get(url: str, timeout: int = 10):
    try:
        with request.urlopen(url, timeout=timeout) as resp:
            status = resp.getcode()
            body = resp.read()
            return status, body
    except error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        print(f"GET {url} failed: {e}", file=sys.stderr)
        return None, None


def test_demo_booking(base_url: str) -> bool:
    print("[1/2] Testing demo booking API...")
    unique = int(time.time())
    email = f"demo_test_{unique}@example.com"

    payload = {
        "firstName": "Test",
        "lastName": "User",
        "email": email,
        "phone": None,
        "company": "SmokeTest Inc",
        "roles": ["engineering", "product"],
        "mainGoal": "aiTraining",
        "budget": "medium",
        "emailUpdates": "yes",
        "language": "zh",
    }

    status, body = http_post_json(f"{base_url}/api/demo-booking", payload)
    if status != 200:
        print(f"  ❌ POST /api/demo-booking failed: HTTP {status}, body={body and body.decode('utf-8', 'ignore')}")
        return False
    data = json.loads(body)
    print(f"  ✓ Submitted. id={data.get('id')}")

    # verify via query API
    qs = parse.urlencode({"email": email})
    status, body = http_get(f"{base_url}/api/demo-booking?{qs}")
    if status != 200:
        print(f"  ❌ GET /api/demo-booking failed: HTTP {status}, body={body and body.decode('utf-8', 'ignore')}")
        return False
    q = json.loads(body)
    if not q.get("success"):
        print(f"  ❌ Query response not success: {q}")
        return False
    items = q.get("data", [])
    ok = any(item.get("email") == email for item in items)
    if not ok:
        print(f"  ❌ Insert not found in query result. items={items}")
        return False
    print(f"  ✓ Query confirmed {len(items)} record(s) for {email}")
    return True


def test_analytics(analytics_base_url: str) -> bool:
    print("[2/2] Testing analytics ingest API...")
    event = {
        "version": "v1",
        "eventName": "demo_form_submit_success",
        "eventId": str(uuid.uuid4()),
        "rid": str(uuid.uuid4()),
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "sessionId": str(uuid.uuid4()),
        "isLoggedIn": False,
        "language": "zh",
        "routeFrom": "/demo",
        "routeTo": "/demo-success",
        "utm": {"source": "smoke", "medium": "script", "campaign": "book-demo"},
        "device": {"ua": "smoke-test/1.0", "platform": "linux", "screen": "1920x1080"},
        "eventProps": {"company": "SmokeTest Inc"},
    }

    # service supports both /analytics/track and /api/analytics/track
    url = f"{analytics_base_url}/api/analytics/track"
    status, _ = http_post_json(url, event)
    if status != 204:
        # fallback to /analytics/track (in case gateway not used)
        url2 = f"{analytics_base_url}/analytics/track"
        status2, body2 = http_post_json(url2, event)
        if status2 != 204:
            print(f"  ❌ POST {url} & {url2} failed: HTTP {status}/{status2}")
            return False
    print("  ✓ Event ingested (HTTP 204)")
    return True


def main():
    contact_base = os.getenv("CONTACT_BASE_URL", "http://127.0.0.1:8080")
    analytics_base = os.getenv("ANALYTICS_BASE_URL", "http://127.0.0.1:8081")

    ok1 = test_demo_booking(contact_base)
    ok2 = test_analytics(analytics_base)

    if ok1 and ok2:
        print("\nAll tests passed ✅")
        sys.exit(0)
    else:
        print("\nSome tests failed ❌")
        sys.exit(1)


if __name__ == "__main__":
    main()


