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

# Targeted Blueprints
# Mug: 68 (Black Mug 11oz, 15oz)
# Poster: 282 (Matte Vertical Posters)
# Hoodie: 77 (Unisex Heavy Blend™ Hoodie)

TARGET_BLUEPRINTS = [68, 282, 77]

def get_details():
    for bp_id in TARGET_BLUEPRINTS:
        print(f"\n--- Blueprint ID: {bp_id} ---")
        r = requests.get(f"https://api.printify.com/v1/catalog/blueprints/{bp_id}/print_providers.json", headers=headers)
        if r.status_code == 200:
            providers = r.json()
            for p in providers[:2]: # Check first 2 providers
                p_id = p['id']
                p_title = p['title']
                print(f"  Provider: {p_title} ({p_id})")
                
                # Get variants for this provider
                vr = requests.get(f"https://api.printify.com/v1/catalog/blueprints/{bp_id}/print_providers/{p_id}/variants.json", headers=headers)
                if vr.status_code == 200:
                    variants = vr.json().get("variants", [])
                    for v in variants[:5]: # List first 5 variants
                        print(f"    Variant ID: {v['id']} | Name: {v['title']}")
                else:
                    print(f"    Error variants: {vr.status_code}")
        else:
            print(f"  Error providers: {r.status_code}")

if __name__ == "__main__":
    get_details()
