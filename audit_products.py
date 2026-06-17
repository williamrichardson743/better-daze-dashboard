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

def list_products():
    r = requests.get(f"https://api.printify.com/v1/shops/{shop_id}/products.json", headers=headers)
    if r.status_code == 200:
        products = r.json().get("data", [])
        print(f"Found {len(products)} products.")
        for p in products:
            print(f"ID: {p['id']} | Title: {p['title']}")
        return products
    else:
        print(f"Error: {r.status_code} - {r.text}")
        return []

if __name__ == "__main__":
    list_products()
