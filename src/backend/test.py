import requests

# Read the sample.txt file
with open("test.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Make a POST request to your FastAPI endpoint
response = requests.post(
    "http://localhost:8000/summarize",  # Change port if needed
    json={"text": text}
)

print("Status code:", response.status_code)
print("Response:", response.json())
