#!/bin/bash
# Generate one real image per subcategory, then copy to all products in that subcategory.

OUT_DIR="/home/z/my-project/public/categories"
PROD_DIR="/home/z/my-project/public/products"

# Subcategory slugs + search prompts (only for subcats missing real images)
declare -a SUBCATS=(
  "shampoo-conditioner:shampoo bottle product photo white background"
  "face-wash-cleansers:face wash tube skincare product photo"
  "skincare:skincare serum bottle product photo white background"
  "makeup:makeup lipstick cosmetic product photo"
  "perfumes-deodorants:perfume bottle product photo white background"
  "mens-grooming:beard trimmer grooming product photo"
  "mobile-phones:smartphone product photo white background"
  "laptops-tablets:laptop computer product photo white background"
  "headphones-earbuds:headphones earbuds product photo white background"
  "smartwatches-wearables:smartwatch product photo white background"
  "televisions:television tv product photo"
  "power-banks-chargers:power bank charger product photo"
  "speakers-audio:bluetooth speaker product photo white background"
  "mens-clothing:mens t-shirt shirt clothing product photo"
  "womens-clothing:womens dress clothing product photo"
  "footwear:shoes sneakers product photo white background"
  "bags-wallets:backpack bag product photo white background"
  "sunglasses:sunglasses product photo white background"
  "furniture:furniture chair product photo"
  "kitchen-dining:kitchen cookware product photo"
  "home-decor:home decor vase product photo"
  "bedding:bedsheet pillow product photo"
  "lighting:lamp lighting product photo"
  "staples:rice grains grocery product photo"
  "snacks:snacks chips product photo"
  "beverages:tea coffee beverage product photo"
  "dairy-eggs:milk dairy product photo"
  "vitamins-supplements:vitamins supplement bottle product photo"
  "personal-care-devices:electric toothbrush product photo"
  "ayurveda-herbal:ayurveda herbal medicine product photo"
  "gym-equipment:dumbbell gym equipment product photo"
  "yoga-meditation:yoga mat product photo"
  "cycling:bicycle cycling product photo"
  "fiction-books:book novel product photo"
  "notebooks-diaries:notebook journal product photo"
  "pens-office-supplies:pens office supplies product photo"
  "toys-games:toys games product photo"
  "baby-care:baby care diaper product photo"
  "kids-clothing:kids clothing product photo"
  "cleaning-supplies:cleaning supplies product photo"
  "cookware:cookware pot pan product photo"
  "storage-containers:storage containers jars product photo"
  "car-care:car care wax product photo"
  "car-electronics:dashcam car electronics product photo"
  "pet-food:pet food dog cat product photo"
  "pet-accessories:pet collar leash product photo"
)

# Top-level categories
declare -a CATS=(
  "beauty-personal-care:beauty cosmetics products flat lay"
  "electronics:electronics gadgets technology products"
  "fashion:fashion clothing accessories flat lay"
  "home-living:home furniture decor interior"
  "groceries-food:grocery food products shopping"
  "health-wellness:health wellness supplements product"
  "sports-fitness:fitness sports equipment product"
  "books-stationery:books stationery product photo"
  "toys-kids-baby:toys kids baby products flat lay"
  "household-cleaning:household cleaning supplies product"
  "automotive:automotive car accessories product"
  "pet-supplies:pet supplies dog cat product"
)

generated=0
failed=0

for entry in "${SUBCATS[@]}"; do
  slug="${entry%%:*}"
  prompt="${entry##*:}"
  file="$OUT_DIR/$slug.jpg"
  
  # Skip if already has a real image (>100 bytes)
  if [ -f "$file" ] && [ $(stat -c%s "$file" 2>/dev/null || echo 0) -gt 100 ]; then
    continue
  fi
  
  z-ai image -p "Professional e-commerce product photo of $prompt, single product centered, clean white studio background, soft natural shadow, sharp focus, high resolution, square 1:1, no text, no watermark, no logo" -o "$file" -s 1024x1024 2>/dev/null
  if [ $? -eq 0 ] && [ $(stat -c%s "$file" 2>/dev/null || echo 0) -gt 100 ]; then
    generated=$((generated+1))
    echo "✅ $slug"
  else
    failed=$((failed+1))
    echo "❌ $slug"
  fi
  sleep 2
done

echo ""
echo "Subcategories: $generated generated, $failed failed"

# Now generate top-level category images
for entry in "${CATS[@]}"; do
  slug="${entry%%:*}"
  prompt="${entry##*:}"
  file="$OUT_DIR/$slug.jpg"
  
  if [ -f "$file" ] && [ $(stat -c%s "$file" 2>/dev/null || echo 0) -gt 100 ]; then
    continue
  fi
  
  z-ai image -p "E-commerce category tile photo featuring $prompt, soft pastel background, studio lighting, no text, no watermark" -o "$file" -s 1024x1024 2>/dev/null
  if [ $? -eq 0 ] && [ $(stat -c%s "$file" 2>/dev/null || echo 0) -gt 100 ]; then
    echo "✅ cat: $slug"
  else
    echo "❌ cat: $slug"
  fi
  sleep 2
done

# Final count
echo ""
echo "Real category images: $(find $OUT_DIR -type f -size +100c | wc -l)"
echo "Real product images: $(find $PROD_DIR -type f -size +100c | wc -l)"
