#!/bin/bash
# Retry missing image searches in small batches with delays
set -u
OUT_DIR="/home/z/my-project/scripts/img-search"

declare -a QUERIES=(
  "aurora-pro-14::silver ultrabook laptop product photo on white background"
  "nimbus-air-13::slim silver laptop computer product photo"
  "forge-workstation-15::professional workstation laptop product photo"
  "drift-buds-pro::true wireless earbuds in charging case product photo"
  "quartz-studio-monitor::studio monitor over ear headphones product photo"
  "atlas-x-pro::modern smartphone with triple camera product photo"
  "aurora-watch-series-7::smartwatch with amoled display product photo"
  "drift-band-fit-3::fitness tracker band wearable product photo"
  "forge-ergonomic-office-chair::ergonomic mesh office chair product photo"
  "atlas-standing-desk-pro::electric standing desk with bamboo top product photo"
  "vertex-brew-pro-espresso::espresso coffee machine product photo"
  "nimbus-air-fryer::digital air fryer kitchen appliance product photo"
  "lumen-chef-knife-set::stainless steel knife set with wooden block product photo"
  "halcyon-aroma-diffuser::ultrasonic aroma essential oil diffuser product photo"
  "drift-run-pro-shoes::running shoes with carbon plate product photo"
  "atlas-trek-hiking-boots::leather hiking boots product photo"
  "mira-commuter-backpack::black commuter laptop backpack product photo"
  "halcyon-leather-tote::brown leather tote bag product photo"
  "mira-glow-vitamin-c::vitamin c serum dropper bottle skincare product photo"
  "lumen-hydra-moisturiser::moisturizer cream jar skincare product photo"
)

BATCH=4
i=0
for entry in "${QUERIES[@]}"; do
  slug="${entry%%::*}"
  query="${entry##*::}"
  if [ -f "$OUT_DIR/$slug.json" ]; then
    # check if it has a valid url
    if node -e "const d=JSON.parse(require('fs').readFileSync('$OUT_DIR/$slug.json','utf8')); process.exit(d.success&&d.results&&d.results[0]?0:1)" 2>/dev/null; then
      continue
    fi
  fi
  z-ai image-search -q "$query" -c 1 --no-rank --gl us -o "$OUT_DIR/$slug.json" 2>/dev/null &
  i=$((i+1))
  if [ $((i % BATCH)) -eq 0 ]; then
    wait
    sleep 2
    echo "Completed batch $((i/BATCH))..."
  fi
done
wait
echo "Retry complete."

# Rebuild the JSON map
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
console.log(`Built image map with ${Object.keys(map).length} entries`);
const missing = [];
const all = ["aurora-pro-14","vertex-strike-16","nimbus-air-13","forge-workstation-15","lumen-quiet-anc","drift-buds-pro","quartz-studio-monitor","atlas-x-pro","mira-lite-5g","aurora-watch-series-7","drift-band-fit-3","forge-ergonomic-office-chair","halcyon-3-seater-sofa","atlas-standing-desk-pro","vertex-brew-pro-espresso","nimbus-air-fryer","lumen-chef-knife-set","halcyon-aroma-diffuser","quartz-table-lamp","drift-run-pro-shoes","atlas-trek-hiking-boots","mira-commuter-backpack","halcyon-leather-tote","quartz-heritage-auto-watch","forge-adjustable-dumbbell","drift-yoga-mat-pro","atlas-camping-tent","mira-glow-vitamin-c","lumen-hydra-moisturiser","forge-pro-beard-trimmer"];
for (const s of all) if (!map[s]) missing.push(s);
if (missing.length) console.log("Still missing:", missing.join(", "));
'
