// Ensures the E2E account exists before tests run. Registration creates a new
// tenant; a repeat run returns a conflict, which is fine (the account persists).
async function globalSetup(): Promise<void> {
  const base = process.env.CONDUCTOR_API_ORIGIN ?? "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_name: "Northwind E2E",
        email: "e2e@northwind.test",
        password: "e2e-pass-123",
      }),
    });
    // 200/201 created, 409 already exists: both acceptable.
    if (![200, 201, 409].includes(res.status)) {
      console.warn(`global-setup: unexpected register status ${res.status}`);
    }
  } catch (err) {
    console.warn(
      "global-setup: could not reach the backend to seed the E2E account. " +
        "Start the backend on :8000 before running E2E.",
      err,
    );
  }
}

export default globalSetup;
