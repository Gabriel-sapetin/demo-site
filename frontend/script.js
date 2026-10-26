// After you deploy the Python Worker, replace this with your Worker URL,
// e.g. "https://bmi-api.your-subdomain.workers.dev"
// For local testing (pywrangler dev) it runs on port 8787.
const API_URL = "http://localhost:8787";

const form = document.getElementById("bmi-form");
const btn = document.getElementById("submit-btn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const statusEl = document.getElementById("status");

async function checkApi() {
  try {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error("bad status");
    statusEl.textContent = "API online";
    statusEl.className = "status ok";
  } catch {
    statusEl.textContent = "API offline: check API_URL in script.js";
    statusEl.className = "status down";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const weight = parseFloat(document.getElementById("weight").value);
  const height = parseFloat(document.getElementById("height").value);

  if (!(weight > 0) || !(height > 0)) {
    showError("Enter a weight and a height greater than zero.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Calculating…";

  try {
    const res = await fetch(`${API_URL}/api/bmi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight_kg: weight, height_cm: height }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "The API rejected that input.");
      return;
    }
    showResult(data);
  } catch {
    showError("Could not reach the API. Check that it is running and API_URL is correct.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Calculate BMI";
  }
});

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultEl.hidden = true;
}

function showResult({ bmi, category }) {
  document.getElementById("bmi").textContent = bmi.toFixed(1);
  document.getElementById("category").textContent = category;

  // Gauge spans BMI 15 to 40
  const pct = Math.min(Math.max((bmi - 15) / 25, 0), 1) * 100;
  document.getElementById("marker").style.left = `${pct}%`;
  resultEl.hidden = false;
}

checkApi();
