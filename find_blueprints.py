import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

token = os.environ.get("PRINTIFY_API_TOKEN")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

def find_blueprints():
    r = requests.get("https://api.printify.com/v1/catalog/blueprints.json", headers=headers)
    if r.status_code != 200:
        print(f"Error: {r.status_code}")
        return

    blueprints = r.json()
    targets = ["Mug", "Poster", "Hoodie", "Sweatshirt"]
    found = {}
    
    for b in blueprints:
        for t in targets:
            if t.lower() in b['title'].lower():
                if t not in found:
                    found[t] = []
                found[t].append({"id": b['id'], "title": b['title']})
    
    print(json.dumps(found, indent=2))

if __name__ == "__main__":
    find_blueprints()
