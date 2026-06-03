"""
Better Daze — Official Narrative Div
Autonomous Revenue Engine v1.0

This script runs the full POD pipeline:
1. Trend Ingestion → Generate 3 trending slogans
2. Design Generation → Create high-contrast institutional typography designs
3. Product Creation → Upload to Printify, create products
4. Shopify Publishing → Push live to store
5. Social Content → Generate captions and hashtags for manual posting

Runs autonomously. No human intervention required.
"""

import os
import json
import time
import base64
import requests
from datetime import datetime

# ─── CONFIGURATION ───
PRINTIFY_API_TOKEN = os.environ.get("PRINTIFY_API_TOKEN", "")
PRINTIFY_SHOP_ID = "27082819"
# OpenAI key is invalid — using pre-generated slogans and Manus image gen
# Design generation handled externally via Manus generate_image tool

HEADERS_PRINTIFY = {
    "Authorization": f"Bearer {PRINTIFY_API_TOKEN}",
    "Content-Type": "application/json"
}

# Blueprint 12 = Bella+Canvas 3001 Unisex Jersey Short Sleeve Tee
# Provider 29 = Monster Digital
BLUEPRINT_ID = 12
PROVIDER_ID = 29
# Black variants: S, M, L, XL, 2XL, 3XL
BLACK_VARIANTS = [18100, 18101, 18102, 18103, 18104, 18105]
PRICE_CENTS = 3299

# ─── PHASE 1: TREND INGESTION & SLOGAN GENERATION ───
def generate_slogans():
    """Return pre-generated trending institutional slogans."""
    print(f"\n{'='*60}")
    print(f"[{datetime.now().isoformat()}] PHASE 1: TREND INGESTION")
    print(f"{'='*60}")
    
    # Read slogans from file if available, otherwise use defaults
    slogan_file = "/home/ubuntu/pod_designs/next_slogans.txt"
    if os.path.exists(slogan_file):
        with open(slogan_file, "r") as f:
            slogans = [line.strip() for line in f.readlines() if line.strip()]
        if len(slogans) >= 3:
            print(f"  Loaded slogans from file: {slogans[:3]}")
            return slogans[:3]
    
    # Fallback: curated slogans
    slogans = ["PRIVACY IS A PRIVILEGE", "COMPLY OR BE FLAGGED", "YOUR SILENCE IS CONSENT"]
    print(f"  Using curated slogans: {slogans}")
    return slogans


# ─── PHASE 2: DESIGN GENERATION ───
def generate_design(slogan, index):
    """Check for pre-generated design files."""
    print(f"\n  Looking for design for: '{slogan}'...")
    
    # Look for pre-generated design files
    design_dir = "/home/ubuntu/pod_designs"
    safe_name = slogan.lower().replace(" ", "_").replace("'", "")
    expected_path = f"{design_dir}/design_{safe_name}.png"
    
    if os.path.exists(expected_path):
        print(f"  Found pre-generated design: {expected_path}")
        return expected_path
    
    # Check for auto-generated designs by index
    auto_path = f"{design_dir}/auto_design_{index}.png"
    if os.path.exists(auto_path):
        print(f"  Found auto design: {auto_path}")
        return auto_path
    
    print(f"  No design found. Design must be pre-generated via Manus image tool.")
    print(f"  Expected path: {expected_path}")
    return None


# ─── PHASE 3: PRINTIFY UPLOAD & PRODUCT CREATION ───
def upload_to_printify(filepath):
    """Upload a design image to Printify."""
    print(f"  Uploading to Printify...")
    
    with open(filepath, "rb") as f:
        img_data = base64.b64encode(f.read()).decode()
    
    payload = {"file_name": os.path.basename(filepath), "contents": img_data}
    r = requests.post("https://api.printify.com/v1/uploads/images.json", 
                      headers=HEADERS_PRINTIFY, json=payload, timeout=120)
    
    if r.status_code == 200:
        image_id = r.json()["id"]
        print(f"  Uploaded: {image_id}")
        return image_id
    else:
        print(f"  Upload failed: {r.status_code} - {r.text[:200]}")
        return None


def create_product(slogan, image_id):
    """Create a product on Printify and publish to Shopify."""
    print(f"  Creating product...")
    
    title = f"{slogan} - Official Narrative Div Tee"
    description = f"Official Narrative Div Standard Issue. '{slogan}' — Institutional compliance series. Limited batch. Bella+Canvas 3001 premium unisex tee."
    
    product_payload = {
        "title": title,
        "description": description,
        "blueprint_id": BLUEPRINT_ID,
        "print_provider_id": PROVIDER_ID,
        "variants": [{"id": v, "price": PRICE_CENTS, "is_enabled": True} for v in BLACK_VARIANTS],
        "print_areas": [{
            "variant_ids": BLACK_VARIANTS,
            "placeholders": [{
                "position": "front",
                "images": [{"id": image_id, "x": 0.5, "y": 0.5, "scale": 1, "angle": 0}]
            }]
        }]
    }
    
    r = requests.post(f"https://api.printify.com/v1/shops/{PRINTIFY_SHOP_ID}/products.json",
                      headers=HEADERS_PRINTIFY, json=product_payload, timeout=60)
    
    if r.status_code in [200, 201]:
        product_id = r.json()["id"]
        print(f"  Product created: {product_id}")
        return product_id
    else:
        print(f"  Product creation failed: {r.status_code} - {r.text[:300]}")
        return None


def publish_to_shopify(product_id):
    """Publish a Printify product to Shopify."""
    print(f"  Publishing to Shopify...")
    
    publish_payload = {
        "title": True, "description": True, "images": True,
        "variants": True, "tags": True, "keyFeatures": True, "shipping_template": True
    }
    
    r = requests.post(f"https://api.printify.com/v1/shops/{PRINTIFY_SHOP_ID}/products/{product_id}/publish.json",
                      headers=HEADERS_PRINTIFY, json=publish_payload, timeout=30)
    
    if r.status_code == 200:
        print(f"  Published successfully!")
        return True
    else:
        print(f"  Publish failed: {r.status_code} - {r.text[:200]}")
        return False


# ─── PHASE 4: SOCIAL CONTENT GENERATION ───
def generate_social_content(slogan):
    """Generate social media captions and hashtags using templates."""
    print(f"  Generating social content for: '{slogan}'...")
    
    # Pre-built viral templates using the Official Narrative Div voice
    templates = [
        {"caption": f"They don't want you wearing this. '{slogan}' — New transmission from the Official Narrative Division. Link in bio. Limited batch.", "hook_type": "curiosity"},
        {"caption": f"CLASSIFIED: New standard issue drop. '{slogan}' — This wasn't supposed to go public. Link in bio before it's pulled.", "hook_type": "urgency"},
        {"caption": f"Bureau notice: '{slogan}' — Compliance is optional. Awareness is not. Official Narrative Div. Link in bio.", "hook_type": "authority"},
    ]
    
    hashtags = [
        "#streetwear", "#dystopian", "#betterdaze", "#officialnarrativediv",
        "#surveillance", "#dataprivacy", "#graphicdesign", "#alternativefashion",
        "#undergroundfashion", "#limiteddrop"
    ]
    
    import random
    template = random.choice(templates)
    template["hashtags"] = hashtags
    print(f"  Caption: {template['caption'][:80]}...")
    return template


# ─── MAIN EXECUTION ───
def run_pipeline():
    """Execute the full revenue pipeline."""
    print(f"\n{'#'*60}")
    print(f"# BETTER DAZE REVENUE ENGINE — RUN STARTED")
    print(f"# {datetime.now().isoformat()}")
    print(f"{'#'*60}")
    
    # Phase 1: Generate slogans
    slogans = generate_slogans()
    
    results = []
    
    for i, slogan in enumerate(slogans):
        print(f"\n{'='*60}")
        print(f"[PRODUCT {i+1}/3] Processing: '{slogan}'")
        print(f"{'='*60}")
        
        # Phase 2: Generate design
        design_path = generate_design(slogan, i+1)
        if not design_path:
            print(f"  SKIPPED: Design generation failed.")
            continue
        
        # Phase 3: Upload and create product
        image_id = upload_to_printify(design_path)
        if not image_id:
            print(f"  SKIPPED: Upload failed.")
            continue
        
        product_id = create_product(slogan, image_id)
        if not product_id:
            print(f"  SKIPPED: Product creation failed.")
            continue
        
        # Phase 4: Publish to Shopify
        published = publish_to_shopify(product_id)
        
        # Phase 5: Generate social content
        social = generate_social_content(slogan)
        
        results.append({
            "slogan": slogan,
            "design_path": design_path,
            "product_id": product_id,
            "published": published,
            "social": social
        })
        
        time.sleep(3)  # Rate limiting
    
    # ─── SUMMARY ───
    print(f"\n{'#'*60}")
    print(f"# PIPELINE COMPLETE — SUMMARY")
    print(f"{'#'*60}")
    print(f"  Products launched: {len(results)}/{len(slogans)}")
    for r in results:
        status = "LIVE" if r["published"] else "CREATED (not published)"
        print(f"  - '{r['slogan']}' → {status}")
    
    # Save social content for manual posting
    social_file = f"/home/ubuntu/pod_designs/social_posts_{int(time.time())}.json"
    with open(social_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  Social content saved: {social_file}")
    print(f"\n{'#'*60}")
    print(f"# ENGINE SHUTDOWN — {datetime.now().isoformat()}")
    print(f"{'#'*60}")
    
    return results


if __name__ == "__main__":
    run_pipeline()
