#!/bin/bash
set -u
OUT_DIR="/home/z/my-project/scripts/img-search"

declare -a QUERIES=(
  "aurora-pro-14::macbook style silver laptop product photo white background"
  "nimbus-air-13::thin silver ultrabook laptop product photo"
  "atlas-x-pro::flagship smartphone triple camera product photo"
  "drift-band-fit-3::fitness tracker wristband product photo"
  "atlas-standing-desk-pro::height adjustable standing desk product photo"
  "nimbus-air-fryer::air fryer kitchen appliance product photo"
  "halcyon-aroma-diffuser::essential oil diffuser product photo"
  "drift-run-pro-shoes::athletic running shoes product photo"
  "halcyon-leather-tote::leather handbag tote product photo"
  "mira-glow-vitamin-c::skincare serum bottle product photo"
)

BATCH=2
i=0
for entry in "${QUERIES[@]}"; do
  slug="${entry%%::*}"
  query="${entry##*::}"
  z-ai image-search -q "$query" -c 1 --no-rank --gl us -o "$OUT_DIR/$slug.json" 2>/dev/null &
  i=$((i+1))
  if [ $((i % BATCH)) -eq 0 ]; then
    wait
    sleep 3
    echo "Completed batch $((i/BATCH))..."
  fi
done
wait
echo "Done."

node -e '
const fs = require("fs");
const dir = "/home/z/my-project/scripts/img-search";
const map = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const slug = f.replace(".json", "");
  try {
    const data = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    if (data.success && data.results && data.results[0]) map[slug] = data.results[0].original_url;
  } catch (e) {}
}
fs.writeFileSync("/home/z/my-project/scripts/image-map.json", JSON.stringify(map, null, 2));
console.log(`Total: ${Object.keys(map).length}/30`);
const all = ["aurora-pro-14","vertex-strike-16","nimbus-air-13","forge-workstation-15","lumen-quiet-anc","drift-buds-pro","quartz-studio-monitor","atlas-x-pro","mira-lite-5g","aurora-watch-series-7","drift-band-fit-3","forge-ergonomic-office-chair","halcyon-3-seater-sofa","atlas-standing-desk-pro","vertex-brew-pro-espresso","nimbus-air-fryer","lumen-chef-knife-set","halcyon-aroma-diffuser","quartz-table-lamp","drift-run-pro-shoes","atlas-trek-hiking-boots","mira-commuter-backpack","halcyon-leather-tote","quartz-heritage-auto-watch","forge-adjustable-dumbbell","drift-yoga-mat-pro","atlas-camping-tent","mira-glow-vitamin-c","lumen-hydra-moisturiser","forge-pro-beard-trimmer"];
const missing = all.filter(s => !map[s]);
if (missing.length) console.log("Missing:", missing.join(", "));
else console.log("ALL 30 IMAGES FOUND!");
'
