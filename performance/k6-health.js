import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  thresholds: { http_req_duration: ["p(95)<500"], checks: ["rate>0.99"] },
  vus: 5,
  duration: "15s",
};

export default function () {
  const base = __ENV.BASE_URL || "http://127.0.0.1:3000";
  const response = http.get(`${base}/api/health`);
  check(response, { "health is 200": (r) => r.status === 200 });
  sleep(1);
}
