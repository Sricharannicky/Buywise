#!/bin/bash
# Search real product images for all 30 products in parallel batches.
# Outputs a JSON map: { "<slug>": "<imageUrl>", ... } to /home/z/my-project/scripts/image-map.json

set -u
OUT_DIR="/home/z/my-project/scripts/img-search"
mkdir -p "$OUT_DIR"

# product_slug :: search query
declare -a QUERIES=(
  "aurora-pro-14::silver ultrabook laptop product photo on white background"
  "vertex-strike-16::gaming laptop with rgb keyboard product photo"
  "nimbus-air-13::slim silver laptop computer product photo"
  "forge-workstation-15::professional workstation laptop product photo"
  "lumen-quiet-anc::over ear wireless noise cancelling headphones product photo"
  "drift-buds-pro::true wireless earbuds in charging case product photo"
  "quartz-studio-monitor::studio monitor over ear headphones product photo"
  "atlas-x-pro::modern smartphone with triple camera product photo"
  "mira-lite-5g::budget 5g smartphone product photo on white"
  "aurora-watch-series-7::smartwatch with amoled display product photo"
  "drift-band-fit-3::fitness tracker band wearable product photo"
  "forge-ergonomic-office-chair::ergonomic mesh office chair product photo"
  "halcyon-3-seater-sofa::modern fabric three seater sofa product photo"
  "atlas-standing-desk-pro::electric standing desk with bamboo top product photo"
  "vertex-brew-pro-espresso::espresso coffee machine product photo"
  "nimbus-air-fryer::digital air fryer kitchen appliance product photo"
  "lumen-chef-knife-set::stainless steel knife set with wooden block product photo"
  "halcyon-aroma-diffuser::ultrasonic aroma essential oil diffuser product photo"
  "quartz-table-lamp::modern ceramic table lamp product photo"
  "drift-run-pro-shoes::running shoes with carbon plate product photo"
  "atlas-trek-hiking-boots::leather hiking boots product photo"
  "mira-commuter-backpack::black commuter laptop backpack product photo"
  "halcyon-leather-tote::brown leather tote bag product photo"
  "quartz-heritage-auto-watch::automatic wristwatch with steel bracelet product photo"
  "forge-adjustable-dumbbell::adjustable dumbbell weight set product photo"
  "drift-yoga-mat-pro::rolled yoga mat product photo"
  "atlas-camping-tent::outdoor camping tent product photo"
  "mira-glow-vitamin-c::vitamin c serum dropper bottle skincare product photo"
  "lumen-hydra-moisturiser::moisturizer cream jar skincare product photo"
  "forge-pro-beard-trimmer::cordless beard trimmer grooming product photo"
)

run_search() {
  local slug="$1"
  local query="$2"
  local outfile="$OUT_DIR/$slug.json"
  z-ai image-search -q "$query" -c 1 --no-rank --gl us -o "$outfile" 2>/dev/null
}

export -f run_search
export OUT_DIR

# Run in parallel batches of 8 to avoid overwhelming
BATCH=8
i=0
for entry in "${QUERIES[@]}"; do
  slug="${entry%%::*}"
  query="${entry##*::}"
  run_search "$slug" "$query" &
  i=$((i+1))
  if [ $((i % BATCH)) -eq 0 ]; then
    wait
    echo "Completed batch $((i/BATCH))..."
  fi
done
wait
echo "All searches complete."

# Build the JSON map
node -e '
const fs = require("fs");
const dir = "/home/z/my-project/scripts/img-search";
const map = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const slug = f.replace(".json", "");
  try {
    const data = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    if (data.success && data.results && data.results[0]) {
      map[slug] = data.results[0].original_url;
    }
  } catch (e) {}
}
fs.writeFileSync("/home/z/my-project/scripts/image-map.json", JSON.stringify(map, null, 2));
console.log(`Built image map with ${Object.keys(map).length} entries:`);
for (const [k, v] of Object.entries(map)) console.log(`  ${k}: ${v}`);
'
