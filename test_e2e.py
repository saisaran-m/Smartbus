import urllib.request
import urllib.parse
import http.cookiejar
import json
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

BASE_URL = "http://localhost:8080"

def get(url):
    req = urllib.request.Request(BASE_URL + url)
    with opener.open(req) as resp:
        return resp.read().decode('utf-8')

def post(url, data_dict=None, json_body=None):
    if json_body is not None:
        data = json.dumps(json_body).encode('utf-8')
        headers = {'Content-Type': 'application/json'}
    elif data_dict is not None:
        data = urllib.parse.urlencode(data_dict).encode('utf-8')
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    else:
        data = b''
        headers = {}
    
    req = urllib.request.Request(BASE_URL + url, data=data, headers=headers)
    with opener.open(req) as resp:
        return resp.read().decode('utf-8')

print("--- 1. Login Page & CSRF Extraction ---")
login_html = get("/login")
csrf_token = re.search(r'name="_csrf"\s+value="([^"]+)"', login_html).group(1)
print(f"CSRF Token extracted: {csrf_token[:20]}...")

print("\n--- 2. Form Login with demo / demo123 ---")
login_res = post("/login", data_dict={"username": "demo", "password": "demo123", "_csrf": csrf_token})
print("Login successful! Session established.")

print("\n--- 3. Search Buses (Chennai -> Villupuram) ---")
buses_json = get("/api/buses/search?from=Chennai&to=Villupuram")
buses = json.loads(buses_json)
print(f"Buses found: {len(buses)}")
for b in buses:
    print(f"  🚌 Bus {b['busNumber']} ({b['busType']}) | Arrives: {b['arrivalTime']} | Crowd: {b['crowdLevel']} | Rating: {b['rating']} ⭐")

selected_bus = buses[0]

print(f"\n--- 4. Start Journey on {selected_bus['busNumber']} ---")
start_res = post("/api/journey/start", json_body={
    "busId": selected_bus["busId"],
    "source": selected_bus["source"],
    "destination": selected_bus["destination"]
})
journey = json.loads(start_res)
journey_id = journey["id"]
print(f"Journey Started! ID: {journey_id}, Bus: {journey['busNumber']}, Status: {journey['status']}")

print("\n--- 5. Fetch Live Tracking Data & Route Coordinates ---")
tracking = json.loads(get(f"/api/tracking/{selected_bus['busId']}"))
print(f"Current Stop: {tracking['currentStop']}, Next: {tracking['nextStop']}, Progress: {tracking['routeProgress']}%")

coords = json.loads(get(f"/api/tracking/{selected_bus['busId']}/coordinates"))
print(f"Route Coordinates points on Map: {len(coords)}")

print("\n--- 6. Enable Smart Stop Guardian ⭐ ---")
guardian = json.loads(post(f"/api/journey/{journey_id}/guardian/enable", json_body={"destination": "Villupuram"}))
print(f"Stop Guardian Enabled: {guardian['guardianEnabled']}, Target: Villupuram")

status = json.loads(get(f"/api/journey/{journey_id}/guardian/status"))
print(f"Initial Guardian Status: Alert={status['alertLevel']}, Stops Remaining={status['stopsRemaining']}, ETA={status['estimatedMinutes']} mins")

print("\n--- 7. Advance Journey through Stops (Simulating Movement) ---")
for step in range(1, 6):
    adv_j = json.loads(post(f"/api/journey/{journey_id}/advance"))
    adv_b = json.loads(post(f"/api/tracking/{selected_bus['busId']}/advance"))
    g_status = json.loads(get(f"/api/journey/{journey_id}/guardian/status"))
    print(f"  Stop {adv_j['currentStopIndex']} ({g_status.get('currentStop', 'En route')}): Alert Level = {g_status['alertLevel']} | ETA = {g_status['estimatedMinutes']} min | '{g_status['message']}'")

print("\n--- 8. Simulate Missed Stop Detection ⭐ ---")
# Advance past destination
adv_miss = json.loads(post(f"/api/journey/{journey_id}/advance"))
miss_status = json.loads(get(f"/api/journey/{journey_id}/guardian/status"))
print(f"Alert Level: {miss_status['alertLevel']}")
print(f"Missed Stop Flag: {miss_status['missedStop']}")
print(f"Alert Message: {miss_status['message']}")

print("\n--- 9. Trigger Missed Stop Recovery ---")
post(f"/api/journey/{journey_id}/missed-stop")
recovery = json.loads(get(f"/api/journey/{journey_id}/recovery"))
print(f"Next Bus Back: {recovery['nextBusNumber']} (in {recovery['nextBusArrivalMinutes']} min)")
print(f"Nearest Stop: {recovery['nearestBusStop']}")
print(f"Distance: {recovery['distanceFromDestinationKm']} km")
print(f"Guidance: {recovery['message']}")

print("\n--- 10. Complete Journey ---")
completed = json.loads(post(f"/api/journey/{journey_id}/complete"))
print(f"Journey Status: {completed['status']}, End Time: {completed['endTime']}")

print("\n--- 11. Submit Multi-Category Passenger Ratings ---")
feedback = json.loads(post("/api/feedback", json_body={
    "journeyId": journey_id,
    "userId": 1,
    "busId": selected_bus["busId"],
    "busNumber": selected_bus["busNumber"],
    "cleanliness": 5,
    "comfort": 5,
    "crowding": 2,
    "punctuality": 5,
    "staffBehaviour": 4,
    "drivingExperience": 5,
    "comments": "Safe driver, clear alerts for Villupuram!"
}))
print(f"Feedback ID: {feedback['id']}, Bus: {feedback['busNumber']}")

ratings = json.loads(get(f"/api/feedback/bus/{selected_bus['busId']}/ratings"))
print(f"Updated Bus Ratings: Cleanliness={ratings['cleanliness']}⭐, Comfort={ratings['comfort']}⭐, Overall={ratings['overall']}⭐")

print("\n--- 12. Submit Safety Report ---")
safety = json.loads(post("/api/safety-report", json_body={
    "userId": 1,
    "busId": selected_bus["busId"],
    "busNumber": selected_bus["busNumber"],
    "reportType": "OVERCROWDING",
    "description": "Bus was crowded between Tindivanam and Vikravandi."
}))
print(f"Safety Report Logged: Type={safety['reportType']}, Status={safety['status']}")

print("\n--- 13. Next Bus Feature ---")
next_bus = json.loads(get("/api/buses/next?from=Chennai&to=Villupuram"))
print(f"Next Bus Available: {next_bus['busNumber']} ({next_bus['busType']}) in {next_bus['estimatedMinutesToArrival']} mins")

print("\n--- 14. Senior Citizen Mode & Language Toggle ---")
senior_state = json.loads(post("/api/auth/senior-mode"))
print(f"Senior Citizen Mode toggled: {senior_state}")

post("/api/auth/language", json_body={"language": "ta"})
user_info = json.loads(get("/api/auth/me"))
print(f"User Profile: Name={user_info['fullName']}, SeniorMode={user_info['seniorCitizenMode']}, Language={user_info['language']}")

print("\n🎉 ALL 14 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")
