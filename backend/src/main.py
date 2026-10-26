import json
from urllib.parse import urlparse

from workers import WorkerEntrypoint, Response

# For a demo, any website may call this API.
# For real use, replace "*" with your Pages URL, e.g. "https://my-site.pages.dev"
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def calculate_bmi(weight_kg, height_cm):
    """Return (bmi, category). Raises ValueError on bad input."""
    if not isinstance(weight_kg, (int, float)) or not isinstance(height_cm, (int, float)):
        raise ValueError("weight_kg and height_cm must be numbers.")
    if not (1 <= weight_kg <= 500):
        raise ValueError("weight_kg must be between 1 and 500.")
    if not (30 <= height_cm <= 275):
        raise ValueError("height_cm must be between 30 and 275.")

    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 1)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal weight"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
    return bmi, category


def json_response(data, status=200):
    headers = {"Content-Type": "application/json", **CORS_HEADERS}
    return Response(json.dumps(data), status=status, headers=headers)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        path = urlparse(request.url).path

        # Browsers send an OPTIONS "preflight" request before POST
        if request.method == "OPTIONS":
            return Response("", status=204, headers=CORS_HEADERS)

        if path == "/api/health" and request.method == "GET":
            return json_response({"status": "ok"})

        if path == "/api/bmi" and request.method == "POST":
            try:
                body = json.loads(await request.text())
                bmi, category = calculate_bmi(body.get("weight_kg"), body.get("height_cm"))
            except (ValueError, TypeError, AttributeError) as err:
                return json_response({"error": str(err) or "Invalid JSON body."}, 400)
            return json_response({"bmi": bmi, "category": category})

        return json_response({"error": "Not found"}, 404)
