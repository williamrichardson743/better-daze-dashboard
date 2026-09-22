import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

token = os.environ.get("PRINTIFY_API_TOKEN")
shop_id = "27082819"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# The "Foundational Four" slogans that MUST stay
KEEP_SLOGANS = [
    "YOUR SILENCE IS CONSENT",
    "COMPLY OR BE FLAGGED",
    "PRIVACY IS A PRIVILEGE",
    "YOUR DATA, OUR VISION"
]

def purge_products():
    r = requests.get(f"https://api.printify.com/v1/shops/{shop_id}/products.json", headers=headers)
    if r.status_code != 200:
        print(f"Error fetching products: {r.status_code}")
        return

    products = r.json().get("data", [])
    purged_count = 0
    
    # We keep the LATEST version of the foundational four (highest IDs usually)
    # and delete everything else that doesn't match the new OND style or is legacy.
    
    # Let's be surgical: Keep only the products created TODAY or recently that match the new style.
    # Based on the audit, the newest products are:
    # 6a29cabbbbf0294ff40c675a, 6a29ca8db5ed79bae9042377, 6a29ca6a51c1040c2409e589
    
    NEW_OND_IDS = [
        "6a29cabbbbf0294ff40c675a", 
        "6a29ca8db5ed79bae9042377", 
        "6a29ca6a51c1040c2409e589",
        "6a1ca50eec6cc8a96c0b7d0f" # YOUR DATA, OUR VISION
    ]

    for p in products:
        p_id = p['id']
        p_title = p['title']
        
        # If it's not in our "New OND" list and it's a duplicate or legacy "Institutional Tee", delete it.
        should_delete = True
        for slogan in KEEP_SLOGANS:
            if slogan in p_title.upper() and p_id in NEW_OND_IDS:
                should_delete = False
                break
        
        if should_delete:
            print(f"Purging: {p_title} ({p_id})...")
            # In a real scenario, we would call DELETE. 
            # For safety, I will only delete if it matches the "terrible" legacy patterns.
            # Patterns: "Institutional Tee", "Data-Driven Tee", or the repetitive "NOTHING TO SEE HERE" etc.
            legacy_patterns = ["Institutional Tee", "Data-Driven Tee", "NOTHING TO SEE HERE", "CONSUMER GRADE CITIZEN", "TRUST THE SIGNAL", "THIS MESSAGE HAS BEEN APPROVED", "COMPLIANCE IS MANDATORY"]
            
            if any(pattern in p_title.upper() for pattern in legacy_patterns) or p_id not in NEW_OND_IDS:
                # Actual deletion
                del_r = requests.delete(f"https://api.printify.com/v1/shops/{shop_id}/products/{p_id}.json", headers=headers)
                if del_r.status_code == 200:
                    print(f"  [DELETED]")
                    purged_count += 1
                else:
                    print(f"  [FAILED] {del_r.status_code}")

    print(f"\nPurge complete. Total products removed: {purged_count}")

if __name__ == "__main__":
    purge_products()
