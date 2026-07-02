import datetime
import json
import os
import re
import secrets
import ssl
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, HTTPServer

try:
    import certifi
    _SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _SSL_CONTEXT = None


def _load_local_env(path=".env.local"):
    """Load KEY=VALUE lines from a local, untracked env file, without overriding
    variables already set in the real environment."""
    if not os.path.exists(path):
        return
    with open(path, "r") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


_load_local_env()

SUPABASE_URL = "https://jyexuwdmqdsxfsrjawvw.supabase.co"

# Default admin password for /maincontrol. Override with the ADMIN_PASSWORD
# environment variable to change it without editing source.
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "89130975")
SESSION_TTL_SECONDS = 12 * 60 * 60
LOGIN_MAX_ATTEMPTS = 5
LOGIN_LOCKOUT_SECONDS = 300

ADMIN_TABLES = {
    "jobs": "job_posts",
    "intake": "ai_intake_sessions",
    "seekers": "job_seeker_profiles",
    "matches": "job_matches",
}

_sessions = {}
_login_attempts = {}


def _now_iso():
    return datetime.datetime.utcnow().isoformat() + "Z"


class ClaudeProxyHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith((".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".ico")):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        super().end_headers()

    # ---------- routing ----------

    def do_GET(self):
        if self.path in ("/maincontrol", "/maincontrol/"):
            self.path = "/maincontrol.html"
            return super().do_GET()
        if self.path.startswith("/api/admin/"):
            self.handle_admin_get()
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/claude":
            self.handle_claude_request()
            return
        if self.path == "/validate":
            self.handle_validation_request()
            return
        if self.path == "/api/admin/login":
            self.handle_admin_login()
            return
        if self.path == "/api/admin/logout":
            self.handle_admin_logout()
            return
        super().do_POST()

    def do_PATCH(self):
        if self.path.startswith("/api/admin/"):
            self.handle_admin_patch()
            return
        self.send_error(405, "Method not allowed")

    def do_DELETE(self):
        if self.path.startswith("/api/admin/"):
            self.handle_admin_delete()
            return
        self.send_error(405, "Method not allowed")

    # ---------- helpers ----------

    def _client_ip(self):
        return self.client_address[0]

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0) or 0)
        if content_length == 0:
            return {}
        payload = self.rfile.read(content_length)
        return json.loads(payload)

    def _send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _require_session(self):
        auth = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if not token:
            return False
        expiry = _sessions.get(token)
        if not expiry or expiry < time.time():
            _sessions.pop(token, None)
            return False
        return True

    def _supabase_request(self, method, table, service_key, query="", body=None, extra_headers=None):
        url = f"{SUPABASE_URL}/rest/v1/{table}"
        if query:
            url += f"?{query}"
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        }
        if extra_headers:
            headers.update(extra_headers)
        data = json.dumps(body).encode("utf-8") if body is not None else None
        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=15, context=_SSL_CONTEXT) as response:
                raw = response.read()
                return json.loads(raw.decode("utf-8")) if raw else None
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase error {error.code}: {detail}")

    # ---------- admin auth ----------

    def handle_admin_login(self):
        try:
            data = self._read_json_body()
        except Exception:
            self._send_json(400, {"error": "Invalid request payload"})
            return

        ip = self._client_ip()
        now = time.time()
        attempts = [t for t in _login_attempts.get(ip, []) if now - t < LOGIN_LOCKOUT_SECONDS]
        if len(attempts) >= LOGIN_MAX_ATTEMPTS:
            self._send_json(429, {"error": "Too many attempts. Try again later."})
            return

        password = str(data.get("password", ""))
        if not secrets.compare_digest(password, ADMIN_PASSWORD):
            attempts.append(now)
            _login_attempts[ip] = attempts
            self._send_json(401, {"error": "Incorrect password"})
            return

        _login_attempts.pop(ip, None)
        token = secrets.token_urlsafe(32)
        _sessions[token] = now + SESSION_TTL_SECONDS
        self._send_json(200, {"token": token, "expires_in": SESSION_TTL_SECONDS})

    def handle_admin_logout(self):
        auth = self.headers.get("Authorization", "")
        token = auth[7:] if auth.startswith("Bearer ") else None
        if token:
            _sessions.pop(token, None)
        self._send_json(200, {"ok": True})

    # ---------- admin data ----------

    def handle_admin_get(self):
        parts = self.path.split("?", 1)
        route = parts[0]
        query = parts[1] if len(parts) > 1 else ""

        if route == "/api/admin/session":
            self._send_json(200, {"valid": self._require_session()})
            return

        if not self._require_session():
            self._send_json(401, {"error": "Unauthorized"})
            return

        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not service_key:
            self._send_json(500, {"error": "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"})
            return

        if route == "/api/admin/stats":
            self._admin_stats(service_key)
            return

        match = re.match(r"^/api/admin/(jobs|intake|seekers|matches)$", route)
        if not match:
            self._send_json(404, {"error": "Not found"})
            return

        table = ADMIN_TABLES[match.group(1)]
        supa_query = "select=*&order=created_at.desc"
        if query:
            supa_query += f"&{query}"

        try:
            rows = self._supabase_request("GET", table, service_key, query=supa_query)
            self._send_json(200, rows)
        except Exception as error:
            self._send_json(502, {"error": str(error)})

    def _admin_stats(self, service_key):
        try:
            jobs = self._supabase_request("GET", "job_posts", service_key, query="select=status")
            intake = self._supabase_request("GET", "ai_intake_sessions", service_key, query="select=id")
            seekers = self._supabase_request("GET", "job_seeker_profiles", service_key, query="select=id")
        except Exception as error:
            self._send_json(502, {"error": str(error)})
            return

        self._send_json(200, {
            "total_jobs": len(jobs),
            "published_jobs": sum(1 for j in jobs if j.get("status") == "published"),
            "draft_jobs": sum(1 for j in jobs if j.get("status") == "draft"),
            "rejected_jobs": sum(1 for j in jobs if j.get("status") == "rejected"),
            "intake_sessions": len(intake),
            "seeker_profiles": len(seekers),
        })

    def handle_admin_patch(self):
        if not self._require_session():
            self._send_json(401, {"error": "Unauthorized"})
            return

        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not service_key:
            self._send_json(500, {"error": "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"})
            return

        match = re.match(r"^/api/admin/(jobs|intake|seekers)/([0-9a-fA-F-]{36})$", self.path)
        if not match:
            self._send_json(404, {"error": "Not found"})
            return

        table = ADMIN_TABLES[match.group(1)]
        record_id = match.group(2)

        try:
            body = self._read_json_body()
        except Exception:
            self._send_json(400, {"error": "Invalid request payload"})
            return

        body["updated_at"] = _now_iso()

        try:
            self._supabase_request(
                "PATCH",
                table,
                service_key,
                query=f"id=eq.{record_id}",
                body=body,
                extra_headers={"Prefer": "return=representation"},
            )
            self._send_json(200, {"ok": True})
        except Exception as error:
            self._send_json(502, {"error": str(error)})

    def handle_admin_delete(self):
        if not self._require_session():
            self._send_json(401, {"error": "Unauthorized"})
            return

        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not service_key:
            self._send_json(500, {"error": "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"})
            return

        match = re.match(r"^/api/admin/(jobs|intake|seekers)/([0-9a-fA-F-]{36})$", self.path)
        if not match:
            self._send_json(404, {"error": "Not found"})
            return

        table = ADMIN_TABLES[match.group(1)]
        record_id = match.group(2)

        try:
            self._supabase_request("DELETE", table, service_key, query=f"id=eq.{record_id}")
            self._send_json(200, {"ok": True})
        except Exception as error:
            self._send_json(502, {"error": str(error)})

    # ---------- existing public endpoints ----------

    def handle_validation_request(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            payload = self.rfile.read(content_length)
            job_data = json.loads(payload)
        except Exception:
            self.send_error(400, "Invalid request payload")
            return

        validation_result = self.validate_job_posting(job_data)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(validation_result).encode("utf-8"))

    def handle_claude_request(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            payload = self.rfile.read(content_length)
            request_data = json.loads(payload)
        except Exception:
            self.send_error(400, "Invalid request payload")
            return

        prompt = request_data.get("prompt", "").strip()
        role = request_data.get("role", "Job Provider")
        if not prompt:
            self.send_error(400, "Prompt is required")
            return

        api_key = os.environ.get("CLAUDE_API_KEY")
        if not api_key:
            self.send_error(500, "CLAUDE_API_KEY environment variable is not set")
            return

        anthropic_prompt = (
            "Human: You are a helpful assistant for job seekers and job providers. "
            f"The user role is {role}. Respond clearly and succinctly.\n\n"
            f"Human: {prompt}\nAssistant:"
        )

        try:
            claude_response = self.call_claude_api(anthropic_prompt, api_key)
        except Exception as error:
            self.send_error(502, f"Claude request failed: {error}")
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        response_payload = {"answer": claude_response}
        self.wfile.write(json.dumps(response_payload).encode("utf-8"))

    def call_claude_api(self, prompt, api_key):
        url = "https://api.anthropic.com/v1/messages"
        request_body = {
            "model": "claude-3-5-sonnet-20241022",
            "max_tokens": 1024,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
        }
        request = urllib.request.Request(
            url,
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )

        with urllib.request.urlopen(request, timeout=30, context=_SSL_CONTEXT) as response:
            body = json.loads(response.read().decode("utf-8"))
            content = body.get("content", [])
            if content and len(content) > 0:
                return content[0].get("text", "")
            return ""

    def validate_job_posting(self, job_data):
        """Validate job posting for legitimacy"""
        issues = []
        spam_score = 0

        # Check required fields
        company_name = job_data.get("company_name", "").strip() if job_data.get("company_name") else ""
        contact_details = job_data.get("contact_details", "").strip() if job_data.get("contact_details") else ""
        title = job_data.get("title", "").strip() if job_data.get("title") else ""
        description = job_data.get("description", "").strip() if job_data.get("description") else ""
        skills = job_data.get("skills_required", [])
        pay_min = job_data.get("pay_min")
        pay_max = job_data.get("pay_max")
        work_setup = job_data.get("work_setup", "").strip() if job_data.get("work_setup") else ""
        location = job_data.get("location", "").strip() if job_data.get("location") else ""
        schedule_type = job_data.get("schedule_type", "").strip() if job_data.get("schedule_type") else ""
        pay_type = job_data.get("pay_type", "hourly").strip() if job_data.get("pay_type") else "hourly"

        # 1. Check for missing required fields
        if not company_name or len(company_name) < 2:
            issues.append("Company name is required (minimum 2 characters)")
        if not contact_details or len(contact_details) < 5:
            issues.append("Contact details (email or phone) is required")
        if not title or len(title) < 3:
            issues.append("Job title is missing or too short")
        if not description or len(description) < 50:
            issues.append("Job description must be at least 50 characters")
        if not skills or len(skills) == 0:
            issues.append("At least one required skill must be specified")
        if pay_min is None or pay_max is None:
            issues.append("Pay range (min and max) is required")
        if not work_setup or work_setup not in ["remote", "onsite", "hybrid"]:
            issues.append("Work setup must be specified (remote, onsite, or hybrid)")
        if work_setup in ["onsite", "hybrid"] and not location:
            issues.append("Location is required for onsite or hybrid roles")
        if not schedule_type or schedule_type not in ["full_time", "part_time", "contract", "flexible"]:
            issues.append("Schedule type must be specified (full_time, part_time, contract, or flexible)")

        # 2. Validate pay ranges
        if pay_min is not None and pay_max is not None:
            try:
                pay_min_val = float(pay_min)
                pay_max_val = float(pay_max)

                if pay_type == "hourly":
                    if pay_min_val < 15 or pay_min_val > 150:
                        issues.append("Hourly rate too low or too high (expected $15-$150/hr)")
                        spam_score += 15
                    if pay_max_val < 15 or pay_max_val > 150:
                        issues.append("Hourly rate too low or too high (expected $15-$150/hr)")
                        spam_score += 15
                elif pay_type == "salary":
                    if pay_min_val < 20000 or pay_min_val > 500000:
                        issues.append("Salary range unrealistic (expected $20k-$500k/year)")
                        spam_score += 15
                    if pay_max_val < 20000 or pay_max_val > 500000:
                        issues.append("Salary range unrealistic (expected $20k-$500k/year)")
                        spam_score += 15

                # Check pay_max > pay_min
                if pay_max_val <= pay_min_val:
                    issues.append("Maximum pay must be greater than minimum pay")
                    spam_score += 10
            except (ValueError, TypeError):
                issues.append("Pay range must be numeric values")

        # 3. Detect spam keywords
        spam_keywords = [
            "passive income", "no experience needed", "guarantee", "pyramid",
            "work from beach", "easy money", "get rich", "arbitrage",
            "crypto", "no qualification", "100% profit", "secret method",
            "proven system", "limited time", "act now", "risk free"
        ]

        description_lower = description.lower()
        for keyword in spam_keywords:
            if keyword in description_lower:
                issues.append(f"Suspicious keyword detected: '{keyword}'")
                spam_score += 20

        # 4. Check for coherence between title and skills
        title_lower = title.lower()
        if "python" in title_lower and not any("python" in s.lower() for s in skills):
            issues.append("Skills don't match job title (Python mentioned in title but not in skills)")
            spam_score += 10
        if "video" in title_lower and not any("video" in s.lower() or "editing" in s.lower() for s in skills):
            issues.append("Skills don't match job title (Video work mentioned but not in skills)")
            spam_score += 10

        # 5. Check for unrealistic requirements
        if any("20+ years" in s or "25+ years" in s for s in skills):
            issues.append("Experience requirement unrealistic (more than 20 years)")
            spam_score += 15

        # Final determination
        is_legitimate = len(issues) == 0 and spam_score < 30

        return {
            "is_legitimate": is_legitimate,
            "spam_score": min(spam_score, 100),
            "issues": issues,
            "reason": "Posting approved and ready to publish" if is_legitimate else f"Posting rejected. Issues: {', '.join(issues[:3])}"
        }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, ClaudeProxyHandler)
    print(f"Serving on http://{server_address[0]}:{server_address[1]}")
    if not os.environ.get("SUPABASE_SERVICE_ROLE_KEY"):
        print("Warning: SUPABASE_SERVICE_ROLE_KEY is not set. /maincontrol will be able to log in but not read/write data.")
    httpd.serve_forever()
