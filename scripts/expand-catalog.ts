// Comprehensive catalog expansion — 12 categories, ~60 subcategories, 10 products each
// Generates ~600 products with realistic names, prices, specs, ratings, and tags
import { db } from '../src/lib/db'
import { slugify } from '../src/lib/format'
import imageMap from './subcategory-images.json' assert { type: 'json' }

// ---------------------------------------------------------------------------
// Helper: generate a product record from compact template data
// ---------------------------------------------------------------------------
function makeProduct(
  name: string,
  _brand: string, // brand is passed separately as brandId
  price: number,
  compareAt: number | undefined,
  shortDesc: string,
  description: string,
  tags: string[],
  specs: Record<string, string>,
  emoji: string,
  image: string | undefined,
  i: number,
) {
  const ratings = [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8]
  const ratingCounts = [47, 89, 124, 203, 318, 445, 612, 789, 1024, 1567]
  const stocks = [8, 15, 23, 34, 45, 56, 67, 78, 89, 100, 120, 150, 200]
  const flagOptions = [
    { isFeatured: true }, { isTrending: true }, { isNewArrival: true },
    { isDeal: true }, { isFeatured: true, isTrending: true }, {},
    { isTrending: true, isDeal: true }, { isNewArrival: true, isFeatured: true },
    { isDeal: true, isTrending: true }, {},
  ]
  return {
    name,
    price,
    compareAtPrice: compareAt ?? null,
    shortDescription: shortDesc,
    description,
    tags: tags.join(','),
    attributes: JSON.stringify(specs),
    images: JSON.stringify(image ? [image, emoji] : [emoji]),
    stock: stocks[i % stocks.length],
    rating: ratings[i % ratings.length],
    ratingCount: ratingCounts[i % ratingCounts.length],
    sku: 'SKU-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    ...flagOptions[i % flagOptions.length],
  }
}

// ---------------------------------------------------------------------------
// Catalog definition — compact format, expanded by the generator
// ---------------------------------------------------------------------------
interface SubCatDef {
  name: string
  slug: string
  emoji: string
  imageQuery: string
  brands: string[]
  // 10 product names per subcategory — realistic and varied
  products: { name: string; brand: string; price: number; compareAt?: number; desc: string; specs: Record<string, string>; tags: string[] }[]
}

interface CatDef {
  name: string
  slug: string
  emoji: string
  subcategories: SubCatDef[]
}

const CATALOG: CatDef[] = [
  // ===== 1. BEAUTY & PERSONAL CARE =====
  {
    name: 'Beauty & Personal Care', slug: 'beauty-personal-care', emoji: '💄',
    subcategories: [
      {
        name: 'Shampoo & Conditioner', slug: 'shampoo-conditioner', emoji: '🧴', imageQuery: 'shampoo bottle product photo white background',
        brands: ['Herbal Essence', 'Lumina', 'Pureflow', 'AquaMax', 'Botanica', 'SilkPro'],
        products: [
          { name: 'Anti-Dandruff Shampoo 340ml', brand: 'Pureflow', price: 289, compareAt: 349, desc: 'Zinc pyrithione formula clears dandruff from first wash', specs: { Volume: '340ml', Type: 'Anti-Dandruff', Hair: 'All' }, tags: ['shampoo','anti-dandruff','hair care','pureflow'] },
          { name: 'Herbal Shampoo with Aloe Vera 400ml', brand: 'Botanica', price: 349, desc: 'Nourishing aloe vera and hibiscus for healthy scalp', specs: { Volume: '400ml', Type: 'Herbal', Hair: 'Normal' }, tags: ['shampoo','herbal','aloe vera','botanica'] },
          { name: 'Dry Hair Repair Shampoo 300ml', brand: 'SilkPro', price: 399, compareAt: 499, desc: 'Argan oil and keratin for dry, damaged hair', specs: { Volume: '300ml', Type: 'Repair', Hair: 'Dry' }, tags: ['shampoo','dry hair','argan oil','silkpro'] },
          { name: 'Oily Hair Balancing Shampoo 350ml', brand: 'AquaMax', price: 259, desc: 'Tea tree oil controls excess oil and refreshes scalp', specs: { Volume: '350ml', Type: 'Balancing', Hair: 'Oily' }, tags: ['shampoo','oily hair','tea tree'] },
          { name: 'Kids Gentle Shampoo 250ml', brand: 'Botanica', price: 199, desc: 'Tear-free formula for children sensitive scalp', specs: { Volume: '250ml', Type: 'Kids', Hair: 'All' }, tags: ['shampoo','kids','gentle','tear-free'] },
          { name: 'Hair Fall Control Shampoo 380ml', brand: 'Pureflow', price: 449, compareAt: 549, desc: 'Biotin and caffeine strengthen roots and reduce fall', specs: { Volume: '380ml', Type: 'Anti-Hair Fall', Hair: 'All' }, tags: ['shampoo','hair fall','biotin','caffeine'] },
          { name: 'Colour Protect Shampoo 300ml', brand: 'Lumina', price: 529, desc: 'UV filter protects coloured hair from fading', specs: { Volume: '300ml', Type: 'Colour Protect', Hair: 'Coloured' }, tags: ['shampoo','colour protect','uv filter'] },
          { name: 'Deep Conditioning Shampoo 450ml', brand: 'SilkPro', price: 379, desc: '2-in-1 shampoo with conditioner for daily use', specs: { Volume: '450ml', Type: '2-in-1', Hair: 'All' }, tags: ['shampoo','conditioner','2-in-1','daily'] },
          { name: 'Frizz Control Shampoo 320ml', brand: 'Lumina', price: 459, compareAt: 599, desc: 'Smoothes frizz and adds shine for 72 hours', specs: { Volume: '320ml', Type: 'Anti-Frizz', Hair: 'Frizzy' }, tags: ['shampoo','frizz control','smooth','shine'] },
          { name: 'Scalp Detox Shampoo 280ml', brand: 'AquaMax', price: 489, desc: 'Charcoal and menthol deep cleanse and cool the scalp', specs: { Volume: '280ml', Type: 'Detox', Hair: 'All' }, tags: ['shampoo','scalp detox','charcoal','menthol'] },
        ],
      },
      {
        name: 'Face Wash & Cleansers', slug: 'face-wash-cleansers', emoji: '🧼', imageQuery: 'face wash tube product photo skincare',
        brands: ['GlowLab', 'PureSkin', 'DermaClear', 'Naturals', 'FreshFace', 'ClearZinc'],
        products: [
          { name: 'Gentle Daily Face Wash 100ml', brand: 'PureSkin', price: 179, desc: 'Soap-free formula cleanses without drying', specs: { Volume: '100ml', Skin: 'All', Type: 'Gel' }, tags: ['face wash','gentle','daily','cleanser'] },
          { name: 'Acne Control Salicylic Face Wash 150ml', brand: 'DermaClear', price: 249, compareAt: 299, desc: '2% salicylic acid clears acne and prevents breakouts', specs: { Volume: '150ml', Skin: 'Oily', Type: 'Acne Care' }, tags: ['face wash','acne','salicylic acid'] },
          { name: 'Vitamin C Brightening Face Wash 100ml', brand: 'GlowLab', price: 299, desc: 'Vitamin C and niacinamide for radiant skin', specs: { Volume: '100ml', Skin: 'Dull', Type: 'Brightening' }, tags: ['face wash','vitamin c','brightening'] },
          { name: 'Charcoal Detox Face Wash 120ml', brand: 'FreshFace', price: 199, desc: 'Activated charcoal draws out dirt and pollution', specs: { Volume: '120ml', Skin: 'Oily', Type: 'Detox' }, tags: ['face wash','charcoal','detox','pollution'] },
          { name: 'Hydrating Cream Cleanser 150ml', brand: 'PureSkin', price: 329, compareAt: 399, desc: 'Creamy formula with hyaluronic acid for dry skin', specs: { Volume: '150ml', Skin: 'Dry', Type: 'Cream' }, tags: ['cleanser','hydrating','hyaluronic acid','dry skin'] },
          { name: 'Sensitive Skin Micellar Wash 200ml', brand: 'Naturals', price: 219, desc: 'Fragrance-free micellar technology for sensitive skin', specs: { Volume: '200ml', Skin: 'Sensitive', Type: 'Micellar' }, tags: ['face wash','micellar','sensitive','fragrance-free'] },
          { name: 'Exfoliating Scrub Wash 100ml', brand: 'DermaClear', price: 279, desc: 'Gentle walnut shell exfoliants for smooth skin', specs: { Volume: '100ml', Skin: 'All', Type: 'Exfoliating' }, tags: ['face wash','scrub','exfoliating','walnut'] },
          { name: 'Oil Control Neem Face Wash 150ml', brand: 'Naturals', price: 169, desc: 'Neem and turmeric purify oily and acne-prone skin', specs: { Volume: '150ml', Skin: 'Oily', Type: 'Oil Control' }, tags: ['face wash','neem','turmeric','oil control'] },
          { name: 'Anti-Pollution Face Wash 130ml', brand: 'GlowLab', price: 349, compareAt: 449, desc: 'Removes PM2.5 pollution particles and city grime', specs: { Volume: '130ml', Skin: 'All', Type: 'Anti-Pollution' }, tags: ['face wash','anti-pollution','city','pm2.5'] },
          { name: 'Pore Refining Face Wash 100ml', brand: 'ClearZinc', price: 259, desc: 'Zinc PCA minimizes pores and controls sebum', specs: { Volume: '100ml', Skin: 'Combination', Type: 'Pore Refining' }, tags: ['face wash','pore refining','zinc','sebum'] },
        ],
      },
      {
        name: 'Skincare', slug: 'skincare', emoji: '🧪', imageQuery: 'skincare serum moisturizer bottle product photo',
        brands: ['GlowLab', 'PureSkin', 'DermaClear', 'LuminaSkin', 'Naturals', 'BioBloom'],
        products: [
          { name: 'Vitamin C Serum 30ml', brand: 'GlowLab', price: 599, compareAt: 799, desc: '15% L-ascorbic acid brightens and evens skin tone', specs: { Volume: '30ml', Key: '15% Vit-C', Skin: 'All' }, tags: ['serum','vitamin c','brightening','skincare'] },
          { name: 'Hyaluronic Acid Serum 30ml', brand: 'LuminaSkin', price: 449, desc: 'Multi-weight HA plumps and hydrates deeply', specs: { Volume: '30ml', Key: 'Hyaluronic', Skin: 'Dry' }, tags: ['serum','hyaluronic acid','hydrating','skincare'] },
          { name: 'Niacinamide 10% Serum 30ml', brand: 'DermaClear', price: 399, compareAt: 499, desc: 'Minimizes pores and controls oil production', specs: { Volume: '30ml', Key: '10% Niacinamide', Skin: 'Oily' }, tags: ['serum','niacinamide','pores','oil control'] },
          { name: 'Retinol Night Serum 30ml', brand: 'BioBloom', price: 799, desc: '0.3% retinol for anti-aging and skin renewal', specs: { Volume: '30ml', Key: '0.3% Retinol', Skin: 'Mature' }, tags: ['serum','retinol','anti-aging','night'] },
          { name: 'Daily Moisturizer with SPF 30 50ml', brand: 'PureSkin', price: 349, desc: 'Lightweight moisturizer with sun protection', specs: { Volume: '50ml', Key: 'SPF 30', Skin: 'All' }, tags: ['moisturizer','spf 30','daily','sunscreen'] },
          { name: 'Gel Moisturizer for Oily Skin 50ml', brand: 'DermaClear', price: 299, compareAt: 379, desc: 'Oil-free gel hydration without greasiness', specs: { Volume: '50ml', Key: 'Oil-free', Skin: 'Oily' }, tags: ['moisturizer','gel','oil-free','lightweight'] },
          { name: 'Sunscreen SPF 50+ PA++++ 60ml', brand: 'GlowLab', price: 499, desc: 'Broad-spectrum protection with no white cast', specs: { Volume: '60ml', Key: 'SPF 50+', Skin: 'All' }, tags: ['sunscreen','spf 50','broad spectrum','pa'] },
          { name: 'Under Eye Cream 20ml', brand: 'LuminaSkin', price: 379, compareAt: 449, desc: 'Caffeine and peptide reduce dark circles', specs: { Volume: '20ml', Key: 'Caffeine', Skin: 'All' }, tags: ['eye cream','dark circles','caffeine','peptide'] },
          { name: 'AHA BHA Exfoliating Serum 30ml', brand: 'BioBloom', price: 649, desc: 'Chemical exfoliant for smooth, glowing skin', specs: { Volume: '30ml', Key: 'AHA+BHA', Skin: 'All' }, tags: ['serum','aha','bha','exfoliating'] },
          { name: 'Overnight Repair Cream 50ml', brand: 'PureSkin', price: 549, desc: 'Ceramides and peptides restore skin overnight', specs: { Volume: '50ml', Key: 'Ceramides', Skin: 'All' }, tags: ['night cream','ceramides','repair','overnight'] },
        ],
      },
      {
        name: 'Makeup', slug: 'makeup', emoji: '💄', imageQuery: 'makeup lipstick foundation cosmetic product photo',
        brands: ['LushColor', 'GlamArt', 'PureBeauty', 'ColorPop', 'VelvetTouch', 'Muse'],
        products: [
          { name: 'Matte Liquid Lipstick - Ruby Red', brand: 'LushColor', price: 299, compareAt: 399, desc: '8-hour transfer-proof matte finish', specs: { Shade: 'Ruby Red', Finish: 'Matte', Volume: '5ml' }, tags: ['lipstick','matte','liquid','red'] },
          { name: 'Full Coverage Foundation - Medium', brand: 'GlamArt', price: 499, desc: '24-hour wear foundation with SPF 15', specs: { Shade: 'Medium', Coverage: 'Full', Volume: '30ml' }, tags: ['foundation','full coverage','spf 15'] },
          { name: 'Waterproof Kajal - Black', brand: 'VelvetTouch', price: 149, compareAt: 199, desc: 'Smudge-proof kajal with 12-hour staying power', specs: { Shade: 'Black', Type: 'Kajal', Hours: '12h' }, tags: ['kajal','eyeliner','waterproof','black'] },
          { name: 'Compact Powder - Natural Beige', brand: 'ColorPop', price: 249, desc: 'Oil-control compact with mirror and puff', specs: { Shade: 'Natural Beige', Type: 'Compact' }, tags: ['compact','powder','oil control'] },
          { name: 'Mascara Volume Boost 10ml', brand: 'LushColor', price: 349, compareAt: 449, desc: '5x volume without clumping', specs: { Volume: '10ml', Type: 'Volume' }, tags: ['mascara','volume','eyes'] },
          { name: 'Eyeshadow Palette 12 Shades', brand: 'GlamArt', price: 699, desc: 'Matte and shimmer mix for day to night looks', specs: { Shades: '12', Type: 'Matte+Shimmer' }, tags: ['eyeshadow','palette','12 shades'] },
          { name: 'Blush On - Peach Pink', brand: 'PureBeauty', price: 279, desc: 'Silky powder blush with natural flush', specs: { Shade: 'Peach Pink', Type: 'Powder' }, tags: ['blush','peach','pink','powder'] },
          { name: 'Makeup Remover 200ml', brand: 'Muse', price: 199, compareAt: 259, desc: 'Gentle micellar water removes all makeup', specs: { Volume: '200ml', Type: 'Micellar' }, tags: ['makeup remover','micellar','gentle'] },
          { name: 'Primer Base 30ml', brand: 'GlamArt', price: 399, desc: 'Pore-filling primer for smooth makeup base', specs: { Volume: '30ml', Type: 'Primer' }, tags: ['primer','base','pore filling'] },
          { name: 'Nail Polish Set of 6', brand: 'ColorPop', price: 449, compareAt: 599, desc: 'Quick-dry long-lasting nail colors', specs: { Count: '6', Type: 'Nail Polish' }, tags: ['nail polish','set','6 colors'] },
        ],
      },
      {
        name: 'Perfumes & Deodorants', slug: 'perfumes-deodorants', emoji: '🌸', imageQuery: 'perfume bottle deodorant spray product photo',
        brands: ['AuraScents', 'Mystique', 'Breeze', 'FreshWave', 'Oudh Royale', 'Splash'],
        products: [
          { name: 'Eau de Parfum - Floral Bloom 50ml', brand: 'AuraScents', price: 1299, compareAt: 1799, desc: 'Notes of jasmine, rose and sandalwood', specs: { Volume: '50ml', Type: 'EDP', Notes: 'Floral' }, tags: ['perfume','eau de parfum','floral','jasmine'] },
          { name: 'Eau de Toilette - Ocean Fresh 100ml', brand: 'Mystique', price: 999, desc: 'Aquatic and citrus notes for daily wear', specs: { Volume: '100ml', Type: 'EDT', Notes: 'Aquatic' }, tags: ['perfume','edt','ocean','fresh'] },
          { name: 'Oudh Intense 30ml', brand: 'Oudh Royale', price: 2499, compareAt: 2999, desc: 'Rich oudh and amber luxury fragrance', specs: { Volume: '30ml', Type: 'EDP', Notes: 'Oudh' }, tags: ['perfume','oudh','luxury','amber'] },
          { name: 'Deodorant Spray - Cool Menthol 150ml', brand: 'Breeze', price: 179, desc: '24-hour odour protection with cooling effect', specs: { Volume: '150ml', Type: 'Deo', Hours: '24h' }, tags: ['deodorant','cool','menthol','deo'] },
          { name: 'Roll-On Deodorant - Invisible 50ml', brand: 'FreshWave', price: 149, compareAt: 199, desc: 'No white marks, gentle on skin', specs: { Volume: '50ml', Type: 'Roll-On' }, tags: ['deodorant','roll-on','invisible'] },
          { name: 'Body Mist - Vanilla Musk 120ml', brand: 'Splash', price: 299, desc: 'Light everyday fragrance for body', specs: { Volume: '120ml', Type: 'Body Mist' }, tags: ['body mist','vanilla','musk'] },
          { name: 'Cologne Sport 100ml', brand: 'Mystique', price: 799, compareAt: 999, desc: 'Fresh and energetic fragrance for active men', specs: { Volume: '100ml', Type: 'Cologne', Notes: 'Woody' }, tags: ['cologne','sport','men','woody'] },
          { name: 'Perfume Gift Set 3x30ml', brand: 'AuraScents', price: 1599, desc: 'Set of 3 mini perfumes for gifting', specs: { Count: '3', Volume: '30ml each' }, tags: ['perfume','gift set','mini'] },
          { name: 'Pocket Perfume 18ml', brand: 'FreshWave', price: 249, desc: 'Compact travel-size fragrance', specs: { Volume: '18ml', Type: 'Pocket' }, tags: ['perfume','pocket','travel','mini'] },
          { name: 'Deodorant Spray - Floral 150ml', brand: 'Breeze', price: 189, compareAt: 229, desc: 'Floral fragrance with 48-hour protection', specs: { Volume: '150ml', Type: 'Deo', Hours: '48h' }, tags: ['deodorant','floral','48 hours'] },
        ],
      },
      {
        name: "Men's Grooming", slug: 'mens-grooming', emoji: '🪒', imageQuery: 'beard trimmer razor grooming product men photo',
        brands: ['Forge', 'SharpPro', 'ManZone', 'BeardKing', 'GroomWell', 'CleanCut'],
        products: [
          { name: 'Pro Beard Trimmer Cordless', brand: 'Forge', price: 1299, compareAt: 1799, desc: '20 length settings, 90 min runtime, USB-C', specs: { Battery: '90 min', Settings: '20', Charging: 'USB-C' }, tags: ['trimmer','beard','cordless','grooming'] },
          { name: 'Safety Razor with 5 Blades', brand: 'CleanCut', price: 349, desc: 'Traditional double-edge safety razor', specs: { Type: 'Safety', Blades: '5 included' }, tags: ['razor','safety','shaving'] },
          { name: 'Beard Growth Oil 50ml', brand: 'BeardKing', price: 399, desc: 'Argan and jojoba oil for thicker beard', specs: { Volume: '50ml', Key: 'Argan Oil' }, tags: ['beard oil','growth','argan','grooming'] },
          { name: 'Shaving Foam 200ml', brand: 'ManZone', price: 179, compareAt: 229, desc: 'Rich lather for smooth glide shave', specs: { Volume: '200ml', Type: 'Foam' }, tags: ['shaving','foam','cream'] },
          { name: 'After Shave Lotion 100ml', brand: 'GroomWell', price: 249, desc: 'Soothing lotion with antiseptic properties', specs: { Volume: '100ml', Type: 'Lotion' }, tags: ['after shave','lotion','soothing'] },
          { name: 'Hair Styling Wax 100g', brand: 'SharpPro', price: 299, compareAt: 399, desc: 'Strong hold matte finish styling wax', specs: { Weight: '100g', Hold: 'Strong', Finish: 'Matte' }, tags: ['hair wax','styling','strong hold','matte'] },
          { name: 'Nose and Ear Trimmer', brand: 'Forge', price: 499, desc: 'Rotary blade for safe nose hair trimming', specs: { Type: 'Nose/Ear', Blade: 'Rotary' }, tags: ['trimmer','nose','ear','grooming'] },
          { name: 'Beard Wash 100ml', brand: 'BeardKing', price: 229, desc: 'Gentle cleanser for beard and face', specs: { Volume: '100ml', Type: 'Beard Wash' }, tags: ['beard wash','cleanser','grooming'] },
          { name: '4-in-1 Grooming Kit', brand: 'SharpPro', price: 1999, compareAt: 2499, desc: 'Trimmer, shaver, nose trimmer, detailer', specs: { Type: '4-in-1 Kit', Includes: '4 heads' }, tags: ['grooming kit','trimmer','shaver','4-in-1'] },
          { name: 'Beard Comb and Scissor Set', brand: 'ManZone', price: 149, desc: 'Wooden comb and stainless steel scissors', specs: { Type: 'Set', Material: 'Wood+Steel' }, tags: ['beard comb','scissors','grooming set'] },
        ],
      },
    ],
  },
  // ===== 2. ELECTRONICS =====
  {
    name: 'Electronics', slug: 'electronics', emoji: '📱',
    subcategories: [
      {
        name: 'Mobile Phones', slug: 'mobile-phones', emoji: '📱', imageQuery: 'smartphone product photo white background',
        brands: ['Atlas', 'Mira', 'Nimbus', 'Vertex', 'Aurora', 'ZenTech'],
        products: [
          { name: 'Atlas X Pro 5G Smartphone', brand: 'Atlas', price: 54999, compareAt: 59999, desc: '6.7" 120Hz AMOLED, triple 50MP, 5000mAh', specs: { Display: '6.7" AMOLED 120Hz', Chip: 'Atlas A2 Pro', RAM: '8GB', Storage: '128GB', Battery: '5000mAh' }, tags: ['smartphone','5g','flagship','camera'] },
          { name: 'Mira Lite 5G Budget Phone', brand: 'Mira', price: 19999, compareAt: 22999, desc: '6.5" 90Hz, 64MP, 5000mAh, 5G', specs: { Display: '6.5" 90Hz', Chip: 'Mira M3 5G', RAM: '6GB', Storage: '128GB', Battery: '5000mAh' }, tags: ['smartphone','5g','budget'] },
          { name: 'Nimbus Note 5G', brand: 'Nimbus', price: 32999, desc: '6.6" 120Hz, 108MP, 6000mAh', specs: { Display: '6.6" 120Hz', Chip: 'Nimbus N5', RAM: '8GB', Storage: '256GB', Battery: '6000mAh' }, tags: ['smartphone','5g','big battery'] },
          { name: 'Vertex Edge Pro', brand: 'Vertex', price: 89999, compareAt: 99999, desc: '6.8" LTPO, 200MP, Snapdragon 8 Gen 3', specs: { Display: '6.8" LTPO 144Hz', Chip: 'SD 8 Gen 3', RAM: '12GB', Storage: '512GB', Battery: '5500mAh' }, tags: ['smartphone','premium','flagship','200mp'] },
          { name: 'Aurora Mini', brand: 'Aurora', price: 24999, desc: 'Compact 5.5" phone with great battery', specs: { Display: '5.5" AMOLED', Chip: 'Aurora A1', RAM: '6GB', Storage: '128GB', Battery: '4500mAh' }, tags: ['smartphone','compact','mini'] },
          { name: 'Mira Lite 4G', brand: 'Mira', price: 11999, compareAt: 13999, desc: 'Affordable 4G phone with 50MP camera', specs: { Display: '6.5" HD+', Chip: 'Mira M2', RAM: '4GB', Storage: '64GB', Battery: '5000mAh' }, tags: ['smartphone','budget','4g'] },
          { name: 'ZenTech Fold Z', brand: 'ZenTech', price: 124999, compareAt: 139999, desc: 'Foldable AMOLED 7.6" inner display', specs: { Display: '7.6" Foldable', Chip: 'SD 8 Gen 3', RAM: '12GB', Storage: '256GB', Battery: '4400mAh' }, tags: ['smartphone','foldable','premium'] },
          { name: 'Atlas X Lite', brand: 'Atlas', price: 42999, desc: '6.5" 120Hz, 64MP, 5000mAh', specs: { Display: '6.5" 120Hz', Chip: 'Atlas A2', RAM: '6GB', Storage: '128GB', Battery: '5000mAh' }, tags: ['smartphone','mid-range'] },
          { name: 'Nimbus Flip', brand: 'Nimbus', price: 34999, compareAt: 39999, desc: 'Flip phone with cover display', specs: { Display: '6.7" Foldable', Chip: 'Nimbus N5', RAM: '8GB', Storage: '128GB', Battery: '4000mAh' }, tags: ['smartphone','flip','foldable'] },
          { name: 'Vertex Gaming Phone', brand: 'Vertex', price: 64999, desc: 'Gaming phone with shoulder triggers and RGB', specs: { Display: '6.8" 165Hz', Chip: 'SD 8 Gen 2', RAM: '16GB', Storage: '256GB', Battery: '6000mAh' }, tags: ['smartphone','gaming','rgb'] },
        ],
      },
      {
        name: 'Laptops & Tablets', slug: 'laptops-tablets', emoji: '💻', imageQuery: 'laptop tablet product photo white background',
        brands: ['Aurora', 'Vertex', 'Nimbus', 'Forge', 'ZenTech', 'Lumen'],
        products: [
          { name: 'Aurora Pro 14 Laptop', brand: 'Aurora', price: 74999, compareAt: 89999, desc: '14" OLED, M3 chip, 16GB, 512GB SSD', specs: { Display: '14" OLED', CPU: 'Aurora M3', RAM: '16GB', Storage: '512GB SSD' }, tags: ['laptop','ultrabook','oled','programming'] },
          { name: 'Vertex Strike 16 Gaming Laptop', brand: 'Vertex', price: 119999, compareAt: 134999, desc: 'RTX 4070, Ryzen 9, 16" 240Hz, 32GB', specs: { Display: '16" 240Hz', GPU: 'RTX 4070', CPU: 'Ryzen 9', RAM: '32GB DDR5', Storage: '1TB SSD' }, tags: ['laptop','gaming','rtx 4070'] },
          { name: 'Nimbus Air 13 Ultrabook', brand: 'Nimbus', price: 62999, compareAt: 69999, desc: '13" FHD, i5, 8GB, 256GB, 1.2kg', specs: { Display: '13" FHD', CPU: 'i5-1335U', RAM: '8GB', Storage: '256GB SSD', Weight: '1.2 kg' }, tags: ['laptop','ultrabook','portable','student'] },
          { name: 'Forge Workstation 15', brand: 'Forge', price: 94999, compareAt: 104999, desc: '15.6" 4K, i9, 32GB, 1TB, RTX 4060', specs: { Display: '15.6" 4K OLED', CPU: 'i9-13900H', RAM: '32GB', Storage: '1TB SSD', GPU: 'RTX 4060' }, tags: ['laptop','workstation','4k','creator'] },
          { name: 'ZenTech Tab 11', brand: 'ZenTech', price: 24999, desc: '11" 120Hz tablet with stylus support', specs: { Display: '11" 120Hz', RAM: '6GB', Storage: '128GB', Battery: '8000mAh' }, tags: ['tablet','11 inch','stylus'] },
          { name: 'Lumen Tab S 10.4', brand: 'Lumen', price: 17999, compareAt: 21999, desc: '10.4" tablet for media and browsing', specs: { Display: '10.4"', RAM: '4GB', Storage: '64GB', Battery: '7000mAh' }, tags: ['tablet','budget','media'] },
          { name: 'Aurora Air 15 Laptop', brand: 'Aurora', price: 54999, desc: '15.6" FHD, Ryzen 5, 8GB, 512GB', specs: { Display: '15.6" FHD', CPU: 'Ryzen 5', RAM: '8GB', Storage: '512GB SSD' }, tags: ['laptop','budget','daily use'] },
          { name: 'Vertex Book 2-in-1', brand: 'Vertex', price: 69999, compareAt: 79999, desc: '14" touchscreen convertible laptop', specs: { Display: '14" Touch', CPU: 'i7', RAM: '16GB', Storage: '512GB SSD' }, tags: ['laptop','2-in-1','convertible','touchscreen'] },
          { name: 'Nimbus Tab Pro 12.7', brand: 'Nimbus', price: 39999, desc: '12.7" premium tablet with keyboard', specs: { Display: '12.7"', RAM: '8GB', Storage: '256GB', Battery: '10000mAh' }, tags: ['tablet','premium','keyboard'] },
          { name: 'Forge Gaming Tab 10', brand: 'Forge', price: 29999, compareAt: 34999, desc: '10" gaming tablet with controller', specs: { Display: '10" 144Hz', RAM: '8GB', Storage: '128GB', Battery: '7000mAh' }, tags: ['tablet','gaming','controller'] },
        ],
      },
      {
        name: 'Headphones & Earbuds', slug: 'headphones-earbuds', emoji: '🎧', imageQuery: 'headphones earbuds product photo white background',
        brands: ['Lumen', 'Drift', 'Quartz', 'Aurora', 'Vertex', 'Nimbus'],
        products: [
          { name: 'Lumen Quiet ANC Headphones', brand: 'Lumen', price: 18999, compareAt: 24999, desc: 'Adaptive ANC, 40h battery, Hi-Res audio', specs: { Type: 'Over-ear', ANC: 'Yes', Battery: '40h', Connectivity: 'BT 5.3' }, tags: ['headphones','anc','wireless','travel'] },
          { name: 'Drift Buds Pro Earbuds', brand: 'Drift', price: 6999, compareAt: 8999, desc: 'True wireless, ANC, 30h with case', specs: { Type: 'TWS', ANC: 'Yes', Battery: '6h+24h', Water: 'IPX5' }, tags: ['earbuds','tws','anc','wireless'] },
          { name: 'Quartz Studio Monitor Headphones', brand: 'Quartz', price: 12999, compareAt: 15999, desc: 'Studio reference, wired, flat response', specs: { Type: 'Over-ear wired', Impedance: '38 ohm', Freq: '5Hz-40kHz' }, tags: ['headphones','studio','wired','reference'] },
          { name: 'Aurora Buds Lite', brand: 'Aurora', price: 2999, compareAt: 3999, desc: 'True wireless earbuds, 20h battery', specs: { Type: 'TWS', Battery: '5h+15h', Connectivity: 'BT 5.2' }, tags: ['earbuds','budget','tws'] },
          { name: 'Vertex Gaming Headset', brand: 'Vertex', price: 4999, desc: '7.1 surround, RGB, detachable mic', specs: { Type: 'Gaming', Surround: '7.1', Mic: 'Detachable' }, tags: ['headphones','gaming','7.1','rgb'] },
          { name: 'Nimbus Sport Neckband', brand: 'Nimbus', price: 1799, compareAt: 2299, desc: 'Bluetooth neckband, 25h battery, IPX4', specs: { Type: 'Neckband', Battery: '25h', Water: 'IPX4' }, tags: ['neckband','sport','bluetooth'] },
          { name: 'Lumen Kids Headphones', brand: 'Lumen', price: 1499, desc: 'Volume-limited safe headphones for kids', specs: { Type: 'Over-ear', Volume: '85dB limit' }, tags: ['headphones','kids','safe','volume limit'] },
          { name: 'Drift Air Pro Earbuds', brand: 'Drift', price: 9999, compareAt: 12999, desc: 'Premium earbuds with wireless charging', specs: { Type: 'TWS', ANC: 'Yes', Battery: '8h+32h', Charging: 'Wireless' }, tags: ['earbuds','premium','anc','wireless charging'] },
          { name: 'Quartz Open-Ear Headphones', brand: 'Quartz', price: 7999, desc: 'Bone conduction style for outdoor safety', specs: { Type: 'Open-ear', Battery: '8h', Water: 'IPX6' }, tags: ['headphones','open-ear','bone conduction','outdoor'] },
          { name: 'Aurora DJ Headphones', brand: 'Aurora', price: 8999, compareAt: 10999, desc: 'Rotating ear cups for DJ monitoring', specs: { Type: 'DJ', Driver: '50mm', Impedance: '32 ohm' }, tags: ['headphones','dj','monitoring'] },
        ],
      },
      {
        name: 'Smartwatches & Wearables', slug: 'smartwatches-wearables', emoji: '⌚', imageQuery: 'smartwatch fitness band wearable product photo',
        brands: ['Aurora', 'Drift', 'Atlas', 'ZenTech', 'Nimbus', 'Forge'],
        products: [
          { name: 'Aurora Watch Series 7', brand: 'Aurora', price: 24999, compareAt: 29999, desc: 'AMOLED, ECG, SpO2, GPS, 7-day battery', specs: { Display: '1.4" AMOLED', Sensors: 'ECG, SpO2, GPS', Battery: '7 days', Water: '5 ATM' }, tags: ['smartwatch','amoled','ecg','gps'] },
          { name: 'Drift Band Fit 3', brand: 'Drift', price: 3999, compareAt: 4999, desc: 'Fitness tracker, 14-day battery, HR+SpO2', specs: { Display: '1.1" AMOLED', Battery: '14 days', Sensors: 'HR, SpO2, Sleep' }, tags: ['fitness band','tracker','14 day battery'] },
          { name: 'Atlas Watch GT Pro', brand: 'Atlas', price: 18999, desc: 'Premium stainless steel smartwatch', specs: { Display: '1.43" AMOLED', Battery: '14 days', Water: '5 ATM', Build: 'Stainless Steel' }, tags: ['smartwatch','premium','steel','14 day'] },
          { name: 'ZenTech Kids Watch', brand: 'ZenTech', price: 5999, compareAt: 7999, desc: 'GPS tracking and calling for kids', specs: { Display: '1.4"', GPS: 'Yes', Calling: '4G VoLTE' }, tags: ['smartwatch','kids','gps tracking','calling'] },
          { name: 'Nimbus Fit Band 2', brand: 'Nimbus', price: 1999, desc: 'Basic fitness band with HR monitoring', specs: { Display: '0.96"', Battery: '10 days', Sensors: 'HR, Steps' }, tags: ['fitness band','budget','heart rate'] },
          { name: 'Forge Watch Sport', brand: 'Forge', price: 9999, compareAt: 11999, desc: 'Rugged sport smartwatch with 100+ modes', specs: { Display: '1.39"', Battery: '12 days', Modes: '100+', Water: '5 ATM' }, tags: ['smartwatch','sport','rugged','100 modes'] },
          { name: 'Aurora Watch Lite', brand: 'Aurora', price: 8999, desc: 'Budget AMOLED smartwatch', specs: { Display: '1.28" AMOLED', Battery: '7 days', Sensors: 'HR, SpO2' }, tags: ['smartwatch','budget','amoled'] },
          { name: 'Drift Ring S', brand: 'Drift', price: 14999, compareAt: 17999, desc: 'Smart ring for health tracking', specs: { Type: 'Ring', Battery: '7 days', Sensors: 'HR, Temp, Sleep' }, tags: ['smart ring','wearable','health tracking'] },
          { name: 'Atlas Watch SE', brand: 'Atlas', price: 12999, desc: 'Entry-level smartwatch with GPS', specs: { Display: '1.3"', Battery: '10 days', GPS: 'Yes' }, tags: ['smartwatch','entry level','gps'] },
          { name: 'Nimbus Watch Fashion', brand: 'Nimbus', price: 6999, compareAt: 8999, desc: 'Fashion-focused hybrid smartwatch', specs: { Display: 'Analog+OLED', Battery: '30 days' }, tags: ['smartwatch','fashion','hybrid','30 day'] },
        ],
      },
      {
        name: 'Televisions', slug: 'televisions', emoji: '📺', imageQuery: 'television tv product photo',
        brands: ['Vertex', 'Aurora', 'Nimbus', 'ZenTech', 'Lumen', 'Forge'],
        products: [
          { name: 'Vertex 55" 4K QLED TV', brand: 'Vertex', price: 44999, compareAt: 54999, desc: '55-inch QLED 4K with Dolby Vision', specs: { Size: '55"', Resolution: '4K', Panel: 'QLED', HDR: 'Dolby Vision' }, tags: ['tv','4k','qled','55 inch'] },
          { name: 'Aurora 43" Full HD LED TV', brand: 'Aurora', price: 24999, desc: '43-inch FHD smart TV with built-in apps', specs: { Size: '43"', Resolution: 'FHD', Panel: 'LED', Smart: 'Yes' }, tags: ['tv','fhd','43 inch','smart tv'] },
          { name: 'Nimbus 65" OLED 4K TV', brand: 'Nimbus', price: 89999, compareAt: 109999, desc: '65-inch OLED with self-lit pixels', specs: { Size: '65"', Resolution: '4K', Panel: 'OLED', HDR: 'Dolby Vision IQ' }, tags: ['tv','oled','4k','65 inch','premium'] },
          { name: 'ZenTech 32" HD Ready TV', brand: 'ZenTech', price: 14999, compareAt: 17999, desc: '32-inch budget TV for bedroom', specs: { Size: '32"', Resolution: 'HD Ready', Panel: 'LED' }, tags: ['tv','32 inch','budget','hd ready'] },
          { name: 'Lumen 50" 4K LED TV', brand: 'Lumen', price: 34999, desc: '50-inch 4K with HDR10', specs: { Size: '50"', Resolution: '4K', Panel: 'LED', HDR: 'HDR10' }, tags: ['tv','4k','50 inch'] },
          { name: 'Vertex 75" 4K Premium TV', brand: 'Vertex', price: 99999, compareAt: 119999, desc: '75-inch premium 4K with mini-LED', specs: { Size: '75"', Resolution: '4K', Panel: 'Mini-LED', HDR: 'Dolby Vision' }, tags: ['tv','75 inch','4k','mini led','premium'] },
          { name: 'Aurora 40" Smart TV', brand: 'Aurora', price: 19999, desc: '40-inch smart TV with voice remote', specs: { Size: '40"', Resolution: 'FHD', Smart: 'Yes', Remote: 'Voice' }, tags: ['tv','40 inch','smart tv','voice'] },
          { name: 'Nimbus 55" Frame TV', brand: 'Nimbus', price: 59999, desc: 'Art-mode TV that looks like a painting', specs: { Size: '55"', Resolution: '4K', Panel: 'QLED', Feature: 'Art Mode' }, tags: ['tv','frame tv','art mode','55 inch'] },
          { name: 'Forge 43" Gaming TV', brand: 'Forge', price: 29999, compareAt: 34999, desc: '43-inch 4K 120Hz gaming TV', specs: { Size: '43"', Resolution: '4K', Refresh: '120Hz', Gaming: 'VRR, ALLM' }, tags: ['tv','gaming','4k','120hz','43 inch'] },
          { name: 'ZenTech 24" LED TV', brand: 'ZenTech', price: 9999, desc: '24-inch compact TV for kitchen', specs: { Size: '24"', Resolution: 'HD Ready', Panel: 'LED' }, tags: ['tv','24 inch','compact','budget'] },
        ],
      },
      {
        name: 'Power Banks & Chargers', slug: 'power-banks-chargers', emoji: '🔋', imageQuery: 'power bank charger cable product photo',
        brands: ['AmpMax', 'ChargeUp', 'VoltPro', 'PowerHub', 'ZapGo', 'EnergyCell'],
        products: [
          { name: '20000mAh Fast Charge Power Bank', brand: 'AmpMax', price: 1999, compareAt: 2499, desc: '22.5W PD fast charging, dual USB', specs: { Capacity: '20000mAh', Output: '22.5W PD', Ports: '2 USB' }, tags: ['power bank','20000mah','fast charge'] },
          { name: '10000mAh Slim Power Bank', brand: 'ChargeUp', price: 999, desc: 'Ultra-slim 10000mAh with 18W charging', specs: { Capacity: '10000mAh', Output: '18W', Ports: '2 USB' }, tags: ['power bank','10000mah','slim'] },
          { name: '65W GaN Charger', brand: 'VoltPro', price: 1499, compareAt: 1999, desc: '3-port GaN charger for laptop + phone', specs: { Power: '65W', Type: 'GaN', Ports: '3' }, tags: ['charger','gan','65w','fast'] },
          { name: 'Wireless Charging Pad 15W', brand: 'PowerHub', price: 799, desc: 'Qi wireless charger for phones', specs: { Power: '15W', Type: 'Qi Wireless' }, tags: ['wireless charger','qi','15w'] },
          { name: 'USB-C to Lightning Cable 1m', brand: 'ZapGo', price: 349, compareAt: 499, desc: 'MFi certified fast charge cable', specs: { Length: '1m', Connectors: 'USB-C to Lightning', Cert: 'MFi' }, tags: ['cable','usb-c','lightning','mfi'] },
          { name: '30000mAh Heavy Duty Power Bank', brand: 'AmpMax', price: 2999, desc: 'High capacity for laptops and phones', specs: { Capacity: '30000mAh', Output: '30W PD', Ports: '3' }, tags: ['power bank','30000mah','heavy duty'] },
          { name: 'Car Charger Dual Port', brand: 'ChargeUp', price: 399, desc: '36W dual port car charger', specs: { Power: '36W', Ports: '2', Type: 'Car' }, tags: ['car charger','dual port','36w'] },
          { name: 'Magnetic Wireless Power Bank', brand: 'PowerHub', price: 1799, compareAt: 2299, desc: 'MagSafe compatible 5000mAh', specs: { Capacity: '5000mAh', Type: 'Magnetic Wireless' }, tags: ['power bank','magnetic','magsafe','wireless'] },
          { name: 'USB-C Cable 2m Braided', brand: 'ZapGo', price: 249, desc: 'Durable braided USB-C to USB-C cable', specs: { Length: '2m', Connectors: 'USB-C to USB-C', Material: 'Braided' }, tags: ['cable','usb-c','braided','2m'] },
          { name: '100W GaN Desktop Charger', brand: 'VoltPro', price: 2499, desc: '4-port desktop charger for all devices', specs: { Power: '100W', Type: 'GaN', Ports: '4' }, tags: ['charger','gan','100w','desktop'] },
        ],
      },
      {
        name: 'Speakers & Audio', slug: 'speakers-audio', emoji: '🔊', imageQuery: 'bluetooth speaker product photo white background',
        brands: ['BassWave', 'SoundMax', 'AudioPro', 'PartyBox', 'Nimbus', 'MiniBeat'],
        products: [
          { name: 'Portable Bluetooth Speaker 20W', brand: 'BassWave', price: 1499, compareAt: 1999, desc: 'IPX7 waterproof, 12h battery, deep bass', specs: { Power: '20W', Battery: '12h', Water: 'IPX7' }, tags: ['speaker','bluetooth','portable','waterproof'] },
          { name: 'Home Theatre Soundbar 2.1', brand: 'SoundMax', price: 8999, desc: '2.1 channel with wireless subwoofer', specs: { Channels: '2.1', Subwoofer: 'Wireless', Power: '120W' }, tags: ['soundbar','home theatre','2.1','subwoofer'] },
          { name: 'Party Speaker with RGB Lights', brand: 'PartyBox', price: 4999, compareAt: 6499, desc: '60W party speaker with karaoke mic', specs: { Power: '60W', Lights: 'RGB', Mic: 'Included' }, tags: ['speaker','party','rgb','karaoke'] },
          { name: 'Mini Wireless Speaker 5W', brand: 'MiniBeat', price: 599, desc: 'Compact speaker with big sound', specs: { Power: '5W', Battery: '8h' }, tags: ['speaker','mini','portable','budget'] },
          { name: 'Smart Speaker with Voice Assistant', brand: 'Nimbus', price: 2999, compareAt: 3999, desc: 'Voice-controlled smart speaker', specs: { Power: '12W', Voice: 'Yes', Smart: 'Yes' }, tags: ['speaker','smart','voice assistant'] },
          { name: 'Dolby Atmos Soundbar 5.1', brand: 'AudioPro', price: 19999, compareAt: 24999, desc: '5.1.2 Dolby Atmos with up-firing speakers', specs: { Channels: '5.1.2', Format: 'Dolby Atmos', Power: '300W' }, tags: ['soundbar','dolby atmos','5.1','premium'] },
          { name: 'Bookshelf Speakers Pair', brand: 'AudioPro', price: 7999, desc: 'Active bookshelf speakers for desk', specs: { Type: 'Active Pair', Power: '42W' }, tags: ['speakers','bookshelf','desk','active'] },
          { name: 'Outdoor Waterproof Speaker 15W', brand: 'BassWave', price: 1299, desc: 'Rugged speaker for outdoor adventures', specs: { Power: '15W', Battery: '15h', Water: 'IP67' }, tags: ['speaker','outdoor','waterproof','rugged'] },
          { name: 'Tower Speaker 80W', brand: 'SoundMax', price: 6999, compareAt: 8999, desc: 'Floor standing tower speaker', specs: { Type: 'Tower', Power: '80W' }, tags: ['speaker','tower','floor standing'] },
          { name: 'Portable Speaker with FM', brand: 'MiniBeat', price: 899, desc: 'Budget speaker with FM radio and SD card', specs: { Power: '10W', Features: 'FM, SD, USB' }, tags: ['speaker','budget','fm radio'] },
        ],
      },
    ],
  },
  // ===== 3. FASHION =====
  {
    name: 'Fashion', slug: 'fashion', emoji: '👕',
    subcategories: [
      {
        name: "Men's Clothing", slug: 'mens-clothing', emoji: '👔', imageQuery: 'mens t-shirt shirt clothing product photo',
        brands: ['UrbanWear', 'ClassicFit', 'StreetStyle', 'PrimeThreads', 'ComfortZone', 'BoldMove'],
        products: [
          { name: 'Cotton Crew Neck T-Shirt - Navy', brand: 'UrbanWear', price: 499, compareAt: 799, desc: '100% combed cotton regular fit tee', specs: { Material: '100% Cotton', Fit: 'Regular', Color: 'Navy' }, tags: ['t-shirt','cotton','navy','mens'] },
          { name: 'Formal Shirt - White Slim Fit', brand: 'ClassicFit', price: 899, compareAt: 1299, desc: 'Wrinkle-free slim fit formal shirt', specs: { Material: 'Poly-Cotton', Fit: 'Slim', Color: 'White' }, tags: ['shirt','formal','slim fit','white'] },
          { name: 'Slim Fit Jeans - Dark Blue', brand: 'StreetStyle', price: 1299, desc: 'Stretch denim slim fit jeans', specs: { Material: 'Stretch Denim', Fit: 'Slim', Color: 'Dark Blue' }, tags: ['jeans','slim fit','denim','blue'] },
          { name: 'Bomber Jacket - Black', brand: 'BoldMove', price: 1999, compareAt: 2999, desc: 'Lightweight bomber jacket with ribbed cuffs', specs: { Material: 'Polyester', Color: 'Black', Type: 'Bomber' }, tags: ['jacket','bomber','black'] },
          { name: 'Polo Shirt - Maroon', brand: 'PrimeThreads', price: 699, desc: 'Pique cotton polo with collar', specs: { Material: 'Pique Cotton', Color: 'Maroon', Type: 'Polo' }, tags: ['polo','cotton','maroon','mens'] },
          { name: 'Chino Pants - Khaki', brand: 'ClassicFit', price: 1099, compareAt: 1499, desc: 'Slim fit cotton chinos', specs: { Material: 'Cotton Twill', Fit: 'Slim', Color: 'Khaki' }, tags: ['chinos','pants','khaki','slim'] },
          { name: 'Hoodie - Grey Oversized', brand: 'StreetStyle', price: 1199, desc: 'Fleece-lined oversized hoodie', specs: { Material: 'Fleece', Color: 'Grey', Fit: 'Oversized' }, tags: ['hoodie','fleece','grey','oversized'] },
          { name: 'Cargo Shorts - Olive', brand: 'UrbanWear', price: 799, compareAt: 999, desc: '6-pocket cargo shorts for summer', specs: { Material: 'Cotton', Color: 'Olive', Type: 'Cargo' }, tags: ['shorts','cargo','olive','summer'] },
          { name: 'Linen Shirt - Sky Blue', brand: 'ComfortZone', price: 999, desc: 'Breathable linen casual shirt', specs: { Material: 'Linen', Color: 'Sky Blue', Fit: 'Regular' }, tags: ['shirt','linen','casual','sky blue'] },
          { name: 'Thermal Inner Vests Pack of 3', brand: 'ComfortZone', price: 599, desc: 'Thermal innerwear for winter', specs: { Material: 'Thermal Blend', Pack: '3', Type: 'Vest' }, tags: ['thermal','innerwear','pack of 3','winter'] },
        ],
      },
      {
        name: "Women's Clothing", slug: 'womens-clothing', emoji: '👗', imageQuery: 'womens dress top kurti clothing product photo',
        brands: ['Bloom', 'ElegantWear', 'FusionFit', 'GraceStyle', 'TrendBoutique', 'FloraFashion'],
        products: [
          { name: 'Floral Maxi Dress - Multicolor', brand: 'Bloom', price: 1299, compareAt: 1799, desc: 'Flowy floral maxi dress for summer', specs: { Material: 'Rayon', Color: 'Floral', Length: 'Maxi' }, tags: ['dress','maxi','floral','summer'] },
          { name: 'Cotton Kurti - Blue', brand: 'GraceStyle', price: 599, desc: 'Straight cut cotton kurti with dupatta', specs: { Material: 'Cotton', Color: 'Blue', Type: 'Kurti' }, tags: ['kurti','cotton','blue','ethnic'] },
          { name: 'Crop Top - Black', brand: 'TrendBoutique', price: 399, compareAt: 599, desc: 'Ribbed knit crop top', specs: { Material: 'Ribbed Knit', Color: 'Black', Type: 'Crop Top' }, tags: ['crop top','black','ribbed','womens'] },
          { name: 'Palazzo Set - Mustard', brand: 'FusionFit', price: 899, desc: 'Kurti and palazzo pant set', specs: { Material: 'Rayon', Color: 'Mustard', Type: 'Set' }, tags: ['palazzo','set','mustard','ethnic'] },
          { name: 'Denim Jacket - Light Blue', brand: 'ElegantWear', price: 1499, compareAt: 1999, desc: 'Classic denim jacket with button front', specs: { Material: 'Denim', Color: 'Light Blue', Type: 'Jacket' }, tags: ['jacket','denim','light blue','womens'] },
          { name: 'Wrap Dress - Wine', brand: 'Bloom', price: 1599, desc: 'Elegant wrap dress for evening wear', specs: { Material: 'Polyester', Color: 'Wine', Type: 'Wrap' }, tags: ['dress','wrap','wine','evening'] },
          { name: 'Leggings - Black', brand: 'FloraFashion', price: 299, compareAt: 399, desc: 'Full stretch cotton leggings', specs: { Material: 'Cotton Blend', Color: 'Black', Type: 'Leggings' }, tags: ['leggings','black','stretch','cotton'] },
          { name: 'Saree - Silk Red', brand: 'GraceStyle', price: 2499, compareAt: 3499, desc: 'Silk saree with blouse piece', specs: { Material: 'Silk', Color: 'Red', Type: 'Saree' }, tags: ['saree','silk','red','ethnic'] },
          { name: 'Off-Shoulder Top - White', brand: 'TrendBoutique', price: 699, desc: 'Stylish off-shoulder top', specs: { Material: 'Polyester', Color: 'White', Type: 'Off-Shoulder' }, tags: ['top','off-shoulder','white','womens'] },
          { name: 'Skirt - Pleated Black', brand: 'ElegantWear', price: 899, compareAt: 1199, desc: 'Pleated midi skirt', specs: { Material: 'Polyester', Color: 'Black', Type: 'Skirt' }, tags: ['skirt','pleated','black','midi'] },
        ],
      },
      {
        name: 'Footwear', slug: 'footwear', emoji: '👟', imageQuery: 'shoes sneakers sandals footwear product photo',
        brands: ['Drift', 'StrideRight', 'StepUp', 'TrekPro', 'UrbanStep', 'ComfiWalk'],
        products: [
          { name: 'Run Pro Running Shoes', brand: 'Drift', price: 2999, compareAt: 4999, desc: 'Carbon plate running shoes for racing', specs: { Drop: '8mm', Weight: '215g', Plate: 'Carbon' }, tags: ['shoes','running','carbon plate','sports'] },
          { name: 'Casual Sneakers - White', brand: 'UrbanStep', price: 1499, desc: 'Minimalist white sneakers for daily wear', specs: { Color: 'White', Type: 'Sneakers', Material: 'Canvas' }, tags: ['sneakers','white','casual','canvas'] },
          { name: 'Trek Hiking Boots', brand: 'TrekPro', price: 3499, compareAt: 4499, desc: 'Waterproof hiking boots with Vibram sole', specs: { Upper: 'Leather', Sole: 'Vibram', Water: 'Yes' }, tags: ['boots','hiking','waterproof','outdoor'] },
          { name: 'Leather Formal Shoes - Brown', brand: 'StrideRight', price: 2199, desc: 'Genuine leather oxford shoes', specs: { Material: 'Leather', Color: 'Brown', Type: 'Oxford' }, tags: ['formal','leather','brown','oxford'] },
          { name: 'Sliders - Blue', brand: 'ComfiWalk', price: 399, compareAt: 599, desc: 'Comfort sliders for daily use', specs: { Color: 'Blue', Type: 'Sliders' }, tags: ['sliders','blue','casual','comfort'] },
          { name: 'Football Studs', brand: 'StepUp', price: 1899, desc: 'Studded football boots for grass', specs: { Type: 'Football', Studs: 'Molded' }, tags: ['football','studs','sports'] },
          { name: 'Sandals - Brown Leather', brand: 'StrideRight', price: 1299, desc: 'Leather sandals with buckle', specs: { Material: 'Leather', Color: 'Brown', Type: 'Sandals' }, tags: ['sandals','leather','brown'] },
          { name: 'Training Shoes - Black', brand: 'Drift', price: 2499, compareAt: 3299, desc: 'Cross-training shoes for gym', specs: { Color: 'Black', Type: 'Training' }, tags: ['shoes','training','gym','black'] },
          { name: 'Canvas Shoes - Navy', brand: 'UrbanStep', price: 899, desc: 'Lightweight canvas shoes', specs: { Color: 'Navy', Material: 'Canvas', Type: 'Casual' }, tags: ['shoes','canvas','navy','casual'] },
          { name: 'Winter Boots - Black', brand: 'TrekPro', price: 2999, compareAt: 3799, desc: 'Insulated winter boots with grip sole', specs: { Color: 'Black', Type: 'Winter', Insulation: 'Yes' }, tags: ['boots','winter','insulated','black'] },
        ],
      },
      {
        name: 'Bags & Wallets', slug: 'bags-wallets', emoji: '🎒', imageQuery: 'backpack bag wallet product photo',
        brands: ['Mira', 'Halcyon', 'CarryPro', 'UrbanPack', 'LeatherCraft', 'NomadBag'],
        products: [
          { name: 'Commuter Backpack 25L', brand: 'Mira', price: 6999, compareAt: 8999, desc: 'Weatherproof commuter with 16" laptop sleeve', specs: { Capacity: '25L', Laptop: '16"', Material: 'Weatherproof' }, tags: ['backpack','commuter','waterproof','laptop'] },
          { name: 'Leather Tote Bag', brand: 'Halcyon', price: 14999, compareAt: 18999, desc: 'Full-grain leather tote with brass hardware', specs: { Material: 'Leather', Laptop: '14"', Hardware: 'Brass' }, tags: ['bag','tote','leather','premium'] },
          { name: 'Sling Bag - Black', brand: 'CarryPro', price: 899, desc: 'Compact crossbody sling bag', specs: { Color: 'Black', Type: 'Sling' }, tags: ['sling bag','black','crossbody'] },
          { name: 'Laptop Bag 15.6"', brand: 'UrbanPack', price: 1299, compareAt: 1799, desc: 'Padded laptop bag with shoulder strap', specs: { Laptop: '15.6"', Type: 'Laptop Bag' }, tags: ['laptop bag','15.6 inch','padded'] },
          { name: 'Leather Wallet - Brown', brand: 'LeatherCraft', price: 599, desc: 'Genuine leather bifold wallet', specs: { Material: 'Leather', Color: 'Brown', Type: 'Bifold' }, tags: ['wallet','leather','brown','bifold'] },
          { name: 'Duffel Bag 40L', brand: 'NomadBag', price: 1599, desc: 'Weekend duffel with shoe compartment', specs: { Capacity: '40L', Type: 'Duffel' }, tags: ['duffel','travel','40l','weekend'] },
          { name: 'Women Handbag - Tan', brand: 'Halcyon', price: 1999, compareAt: 2799, desc: 'Stylish handbag with adjustable strap', specs: { Color: 'Tan', Type: 'Handbag' }, tags: ['handbag','tan','womens'] },
          { name: 'School Bag 30L', brand: 'UrbanPack', price: 999, desc: 'School backpack with multiple pockets', specs: { Capacity: '30L', Type: 'School' }, tags: ['backpack','school','30l','kids'] },
          { name: 'Card Holder - Minimal', brand: 'LeatherCraft', price: 349, compareAt: 499, desc: 'Slim leather card holder', specs: { Material: 'Leather', Type: 'Card Holder' }, tags: ['card holder','leather','slim'] },
          { name: 'Travel Backpack 45L', brand: 'NomadBag', price: 2999, desc: 'Carry-on travel backpack with rain cover', specs: { Capacity: '45L', Type: 'Travel', RainCover: 'Yes' }, tags: ['backpack','travel','45l','carry-on'] },
        ],
      },
      {
        name: 'Sunglasses', slug: 'sunglasses', emoji: '🕶️', imageQuery: 'sunglasses product photo white background',
        brands: ['SunGuard', 'RayStyle', 'PolarView', 'UrbanShades', 'VogueEyes', 'ClassicLook'],
        products: [
          { name: 'Polarized Aviator Sunglasses', brand: 'SunGuard', price: 999, compareAt: 1499, desc: 'UV400 polarized aviator with metal frame', specs: { Type: 'Aviator', Lens: 'Polarized', UV: 'UV400' }, tags: ['sunglasses','aviator','polarized','uv400'] },
          { name: 'Wayfarer Sunglasses - Black', brand: 'RayStyle', price: 799, desc: 'Classic wayfarer with acetate frame', specs: { Type: 'Wayfarer', Color: 'Black', Material: 'Acetate' }, tags: ['sunglasses','wayfarer','black'] },
          { name: 'Cat-Eye Sunglasses - Tortoise', brand: 'VogueEyes', price: 899, compareAt: 1299, desc: 'Retro cat-eye frames for women', specs: { Type: 'Cat-Eye', Color: 'Tortoise' }, tags: ['sunglasses','cat-eye','tortoise','womens'] },
          { name: 'Sports Sunglasses - Wrap', brand: 'PolarView', price: 1299, desc: 'Wrap-around sports sunglasses with strap', specs: { Type: 'Sports', Lens: 'Polarized' }, tags: ['sunglasses','sports','wrap','polarized'] },
          { name: 'Round Frame Sunglasses', brand: 'UrbanShades', price: 699, compareAt: 999, desc: 'Vintage round frame metal sunglasses', specs: { Type: 'Round', Material: 'Metal' }, tags: ['sunglasses','round','vintage'] },
          { name: 'Rectangle Sunglasses - Blue', brand: 'RayStyle', price: 599, desc: 'Blue tint rectangle sunglasses', specs: { Type: 'Rectangle', Lens: 'Blue Tint' }, tags: ['sunglasses','rectangle','blue'] },
          { name: 'Mirror Lens Sunglasses', brand: 'SunGuard', price: 1099, compareAt: 1499, desc: 'Mirror-coated lens for glare reduction', specs: { Type: 'Aviator', Lens: 'Mirror' }, tags: ['sunglasses','mirror','glare'] },
          { name: 'Rimless Sunglasses', brand: 'VogueEyes', price: 1199, desc: 'Minimalist rimless sunglasses', specs: { Type: 'Rimless', Lens: 'Gradient' }, tags: ['sunglasses','rimless','gradient'] },
          { name: 'Kids Sunglasses Pack of 2', brand: 'ClassicLook', price: 399, desc: 'UV protection sunglasses for children', specs: { Type: 'Kids', Pack: '2', UV: 'UV400' }, tags: ['sunglasses','kids','pack of 2'] },
          { name: 'Oversized Sunglasses - Brown', brand: 'UrbanShades', price: 849, compareAt: 1099, desc: 'Fashion oversized sunglasses', specs: { Type: 'Oversized', Color: 'Brown' }, tags: ['sunglasses','oversized','brown','fashion'] },
        ],
      },
    ],
  },
  // ===== 4. HOME & LIVING =====
  {
    name: 'Home & Living', slug: 'home-living', emoji: '🛋️',
    subcategories: [
      {
        name: 'Furniture', slug: 'furniture', emoji: '🪑', imageQuery: 'furniture chair table sofa product photo',
        brands: ['Forge', 'Halcyon', 'WoodCraft', 'HomeMaker', 'ComfortLiving', 'UrbanDecor'],
        products: [
          { name: 'Ergonomic Office Chair', brand: 'Forge', price: 15999, compareAt: 21999, desc: 'Mesh back, lumbar support, 4D armrests', specs: { Material: 'Mesh', Lumbar: 'Adjustable', Capacity: '150kg' }, tags: ['chair','office','ergonomic','mesh'] },
          { name: '3-Seater Fabric Sofa', brand: 'Halcyon', price: 38999, compareAt: 49999, desc: 'Premium fabric 3-seater with wood frame', specs: { Dimensions: '210x90x85cm', Material: 'Fabric', Frame: 'Wood' }, tags: ['sofa','3-seater','fabric','living room'] },
          { name: 'Standing Desk Pro', brand: 'Atlas', price: 27999, compareAt: 32999, desc: 'Electric sit-stand desk with bamboo top', specs: { 'Height Range': '68-118cm', Top: 'Bamboo', Motor: 'Dual' }, tags: ['desk','standing','electric','bamboo'] },
          { name: 'Queen Size Bed Frame', brand: 'WoodCraft', price: 24999, desc: 'Solid wood queen bed with storage', specs: { Size: 'Queen', Material: 'Solid Wood', Storage: 'Yes' }, tags: ['bed','queen','wood','storage'] },
          { name: 'Dining Table Set 6-Seater', brand: 'HomeMaker', price: 34999, compareAt: 44999, desc: '6-seater dining table with chairs', specs: { Seats: '6', Material: 'Wood' }, tags: ['dining table','6-seater','wood'] },
          { name: 'Bookshelf 5-Tier', brand: 'UrbanDecor', price: 7999, desc: 'Open bookshelf with 5 shelves', specs: { Tiers: '5', Material: 'Engineered Wood' }, tags: ['bookshelf','5-tier','storage'] },
          { name: 'Recliner Chair - Brown', brand: 'ComfortLiving', price: 18999, compareAt: 23999, desc: 'Push-back recliner with padded seat', specs: { Color: 'Brown', Type: 'Recliner', Material: 'PU Leather' }, tags: ['recliner','chair','brown','living room'] },
          { name: 'Coffee Table - Round', brand: 'UrbanDecor', price: 6999, desc: 'Round coffee table with marble top', specs: { Shape: 'Round', Top: 'Marble' }, tags: ['coffee table','round','marble'] },
          { name: 'Wardrobe 3-Door', brand: 'WoodCraft', price: 29999, compareAt: 36999, desc: '3-door wardrobe with mirror', specs: { Doors: '3', Mirror: 'Yes', Material: 'Wood' }, tags: ['wardrobe','3-door','mirror','storage'] },
          { name: 'Folding Study Table', brand: 'HomeMaker', price: 4999, desc: 'Wall-mounted foldable study table', specs: { Type: 'Folding', Material: 'Engineered Wood' }, tags: ['table','study','folding','space saving'] },
        ],
      },
      {
        name: 'Kitchen & Dining', slug: 'kitchen-dining', emoji: '🍳', imageQuery: 'kitchen cookware dining product photo',
        brands: ['Vertex', 'Nimbus', 'ChefPro', 'KitchenKing', 'CookWell', 'HomeChef'],
        products: [
          { name: 'Air Fryer 6L Digital', brand: 'Nimbus', price: 8999, compareAt: 11999, desc: '6L air fryer with 8 presets, 1700W', specs: { Capacity: '6L', Power: '1700W', Presets: '8' }, tags: ['air fryer','kitchen','healthy','digital'] },
          { name: 'Espresso Machine 15-bar', brand: 'Vertex', price: 21999, compareAt: 26999, desc: 'Café-grade espresso with PID and milk frother', specs: { Pressure: '15 bar', Temp: 'PID', Tank: '2L' }, tags: ['espresso','coffee','kitchen','premium'] },
          { name: 'Non-Stick Cookware Set 8pc', brand: 'ChefPro', price: 3999, compareAt: 5999, desc: '8-piece non-stick cookware set', specs: { Pieces: '8', Material: 'Non-stick' }, tags: ['cookware','non-stick','set','kitchen'] },
          { name: 'Mixer Grinder 750W 3 Jars', brand: 'KitchenKing', price: 2999, desc: '750W mixer with 3 stainless steel jars', specs: { Power: '750W', Jars: '3', Speed: '3 speed' }, tags: ['mixer grinder','750w','kitchen'] },
          { name: 'Dinner Set 16 Pieces', brand: 'HomeChef', price: 1999, compareAt: 2999, desc: 'Bone china 16-piece dinner set', specs: { Pieces: '16', Material: 'Bone China' }, tags: ['dinner set','16 piece','bone china','dining'] },
          { name: 'Induction Cooktop 2000W', brand: 'CookWell', price: 2499, desc: '2000W induction cooktop with preset menu', specs: { Power: '2000W', Presets: '7' }, tags: ['induction','cooktop','2000w','kitchen'] },
          { name: 'Stainless Steel Knife Set 5pc', brand: 'ChefPro', price: 2999, compareAt: 3999, desc: '5-piece German steel knife set', specs: { Pieces: '5', Steel: 'German X50CrMoV15' }, tags: ['knife set','stainless steel','5 piece','kitchen'] },
          { name: 'Electric Kettle 1.8L', brand: 'Nimbus', price: 999, desc: '1.8L electric kettle with auto shut-off', specs: { Capacity: '1.8L', Power: '1500W' }, tags: ['kettle','electric','1.8l','kitchen'] },
          { name: 'Pressure Cooker 5L', brand: 'CookWell', price: 1499, compareAt: 1999, desc: '5L aluminum pressure cooker', specs: { Capacity: '5L', Material: 'Aluminum' }, tags: ['pressure cooker','5l','aluminum','kitchen'] },
          { name: 'Glass Storage Containers Set', brand: 'HomeChef', price: 1299, desc: '10-piece glass containers with lids', specs: { Pieces: '10', Material: 'Glass', Lids: 'BPA-free' }, tags: ['storage','glass','containers','set'] },
        ],
      },
      {
        name: 'Home Decor', slug: 'home-decor', emoji: '🪔', imageQuery: 'home decor lamp vase product photo',
        brands: ['Halcyon', 'Quartz', 'DecorLane', 'ArtNest', 'HomeGlow', 'CraftWorks'],
        products: [
          { name: 'Aroma Diffuser 300ml', brand: 'Halcyon', price: 2499, compareAt: 3499, desc: 'Ultrasonic diffuser with 7-colour LED', specs: { Capacity: '300ml', Runtime: '10h', Light: '7-colour' }, tags: ['diffuser','aroma','decor','led'] },
          { name: 'Table Lamp - Ceramic Matte', brand: 'Quartz', price: 4499, compareAt: 5999, desc: 'Matte ceramic lamp with warm LED', specs: { Material: 'Ceramic', Light: 'Warm 2700K', Height: '38cm' }, tags: ['lamp','ceramic','table','decor'] },
          { name: 'Wall Clock - Wooden 12"', brand: 'DecorLane', price: 1299, desc: 'Rustic wooden wall clock', specs: { Size: '12"', Material: 'Wood' }, tags: ['wall clock','wooden','12 inch','decor'] },
          { name: 'Artificial Plant - Faux Fiddle', brand: 'ArtNest', price: 1999, compareAt: 2799, desc: '4ft artificial fiddle leaf plant', specs: { Height: '4ft', Type: 'Artificial' }, tags: ['plant','artificial','decor','faux'] },
          { name: 'Photo Frame Set of 3', brand: 'CraftWorks', price: 699, desc: 'Set of 3 wooden photo frames', specs: { Count: '3', Material: 'Wood' }, tags: ['photo frame','set of 3','wood','decor'] },
          { name: 'Scented Candles Set of 3', brand: 'HomeGlow', price: 599, compareAt: 899, desc: '3 scented soy candles, 40h each', specs: { Count: '3', Burn: '40h each', Wax: 'Soy' }, tags: ['candles','scented','soy','set of 3'] },
          { name: 'Throw Blanket - Knit Grey', brand: 'Halcyon', price: 999, desc: 'Soft knit throw blanket for sofa', specs: { Color: 'Grey', Material: 'Acrylic', Size: '130x170cm' }, tags: ['blanket','throw','grey','decor'] },
          { name: 'Wall Art - Canvas Print', brand: 'ArtNest', price: 1799, compareAt: 2499, desc: 'Framed canvas wall art 24x36"', specs: { Size: '24x36"', Material: 'Canvas' }, tags: ['wall art','canvas','framed','decor'] },
          { name: 'Floor Vase - Tall Black', brand: 'DecorLane', price: 1499, desc: 'Tall ceramic floor vase', specs: { Height: '60cm', Color: 'Black', Material: 'Ceramic' }, tags: ['vase','floor','black','decor'] },
          { name: 'LED String Lights 10m', brand: 'HomeGlow', price: 399, desc: 'Warm LED string lights for decor', specs: { Length: '10m', LEDs: '100', Color: 'Warm White' }, tags: ['string lights','led','10m','decor'] },
        ],
      },
      {
        name: 'Bedding', slug: 'bedding', emoji: '🛏️', imageQuery: 'bedding bedsheet pillow product photo',
        brands: ['SleepWell', 'CozyHome', 'CottonDreams', 'SoftTouch', 'DreamBed', 'RestWell'],
        products: [
          { name: 'Cotton Bedsheet Double - Grey', brand: 'CottonDreams', price: 699, compareAt: 999, desc: '180 TC cotton double bedsheet with 2 pillow covers', specs: { Size: 'Double', Material: 'Cotton', TC: '180', Includes: '2 covers' }, tags: ['bedsheet','cotton','double','grey'] },
          { name: 'Memory Foam Pillow', brand: 'SleepWell', price: 599, desc: 'Orthopedic memory foam pillow', specs: { Material: 'Memory Foam', Type: 'Orthopedic' }, tags: ['pillow','memory foam','orthopedic'] },
          { name: 'Quilt King Size - White', brand: 'CozyHome', price: 1999, compareAt: 2799, desc: 'Lightweight quilt for king bed', specs: { Size: 'King', Color: 'White', Material: 'Microfiber' }, tags: ['quilt','king','white','bedding'] },
          { name: 'Bedsheet Queen - Floral', brand: 'DreamBed', price: 599, desc: 'Floral print queen bedsheet', specs: { Size: 'Queen', Pattern: 'Floral' }, tags: ['bedsheet','queen','floral'] },
          { name: 'Mattress Protector Queen', brand: 'SoftTouch', price: 799, compareAt: 1099, desc: 'Waterproof mattress protector', specs: { Size: 'Queen', Water: 'Yes' }, tags: ['mattress protector','waterproof','queen'] },
          { name: 'Bolster Pillow - Blue', brand: 'RestWell', price: 349, desc: 'Soft bolster pillow', specs: { Color: 'Blue', Type: 'Bolster' }, tags: ['pillow','bolster','blue'] },
          { name: 'Fitted Sheet Double - White', brand: 'CottonDreams', price: 449, desc: 'Elastic fitted sheet for double bed', specs: { Size: 'Double', Type: 'Fitted', Color: 'White' }, tags: ['fitted sheet','double','white'] },
          { name: 'Duvet Cover Set King', brand: 'CozyHome', price: 1599, compareAt: 2199, desc: 'King duvet cover with 2 shams', specs: { Size: 'King', Includes: 'Cover + 2 shams' }, tags: ['duvet cover','king','set'] },
          { name: 'Cooling Gel Pillow', brand: 'SleepWell', price: 899, desc: 'Cooling gel pillow for hot sleepers', specs: { Material: 'Cooling Gel', Type: 'Pillow' }, tags: ['pillow','cooling gel','hot sleeper'] },
          { name: 'Blanket Double - Fleece', brand: 'SoftTouch', price: 799, desc: 'Soft fleece blanket for double bed', specs: { Size: 'Double', Material: 'Fleece' }, tags: ['blanket','fleece','double'] },
        ],
      },
      {
        name: 'Lighting', slug: 'lighting', emoji: '💡', imageQuery: 'light bulb lamp lighting product photo',
        brands: ['Lumen', 'BrightHome', 'EcoLight', 'SmartGlow', 'LuminaLight', 'PowerBeam'],
        products: [
          { name: 'Smart LED Bulb 9W RGB', brand: 'SmartGlow', price: 399, compareAt: 599, desc: 'WiFi smart bulb with 16M colors', specs: { Power: '9W', Type: 'Smart RGB', Connectivity: 'WiFi' }, tags: ['bulb','smart','rgb','wifi'] },
          { name: 'LED Ceiling Light 24W', brand: 'Lumen', price: 699, desc: 'Round LED panel light for ceiling', specs: { Power: '24W', Shape: 'Round', Color: 'Cool White' }, tags: ['light','led','ceiling','panel'] },
          { name: 'LED Strip Lights 5m RGB', brand: 'BrightHome', price: 599, compareAt: 899, desc: '5m RGB LED strip with remote', specs: { Length: '5m', Color: 'RGB', Control: 'Remote' }, tags: ['led strip','rgb','5m','remote'] },
          { name: 'Desk Lamp LED with USB', brand: 'EcoLight', price: 799, desc: 'LED desk lamp with USB charging port', specs: { Power: '5W', USB: 'Yes', Modes: '3' }, tags: ['desk lamp','led','usb','study'] },
          { name: 'Flood Light 50W LED', brand: 'PowerBeam', price: 899, compareAt: 1299, desc: 'Outdoor waterproof flood light', specs: { Power: '50W', Water: 'IP66', Type: 'Flood' }, tags: ['flood light','outdoor','50w','waterproof'] },
          { name: 'Tube Light 20W 4ft', brand: 'LuminaLight', price: 349, desc: 'LED tube light for home', specs: { Power: '20W', Length: '4ft', Color: 'Cool White' }, tags: ['tube light','led','4ft','home'] },
          { name: 'Wall Sconce Light', brand: 'EcoLight', price: 999, desc: 'Decorative wall sconce with LED', specs: { Type: 'Wall Sconce', Material: 'Metal+Glass' }, tags: ['sconce','wall light','decorative'] },
          { name: 'Emergency Light Rechargeable', brand: 'BrightHome', price: 599, compareAt: 799, desc: 'Rechargeable emergency light 6h backup', specs: { Battery: '6h backup', LEDs: '60' }, tags: ['emergency light','rechargeable','backup'] },
          { name: 'Pendant Light - Minimalist', brand: 'SmartGlow', price: 1499, desc: 'Modern minimalist pendant light', specs: { Type: 'Pendant', Material: 'Metal' }, tags: ['pendant light','minimalist','modern','decor'] },
          { name: 'Motion Sensor Night Light', brand: 'Lumen', price: 299, desc: 'Auto on/off motion sensor night light', specs: { Sensor: 'PIR', Battery: 'Rechargeable' }, tags: ['night light','motion sensor','auto','rechargeable'] },
        ],
      },
    ],
  },
  // ===== 5. GROCERIES & FOOD =====
  {
    name: 'Groceries & Food', slug: 'groceries-food', emoji: '🛒',
    subcategories: [
      {
        name: 'Staples', slug: 'staples', emoji: '🍚', imageQuery: 'rice atta grains grocery product photo',
        brands: ['FarmFresh', 'GoldGrain', 'PureHarvest', 'NatureBest', 'DailyNeeds', 'OrganicValley'],
        products: [
          { name: 'Basmati Rice 5kg Premium', brand: 'GoldGrain', price: 599, compareAt: 749, desc: 'Aged long grain basmati rice', specs: { Weight: '5kg', Type: 'Basmati', Grain: 'Long' }, tags: ['rice','basmati','5kg','staple'] },
          { name: 'Whole Wheat Atta 10kg', brand: 'FarmFresh', price: 449, desc: 'Stone-ground whole wheat flour', specs: { Weight: '10kg', Type: 'Atta' }, tags: ['atta','wheat','10kg','flour'] },
          { name: 'Toor Dal 1kg', brand: 'PureHarvest', price: 149, compareAt: 179, desc: 'Premium quality toor dal', specs: { Weight: '1kg', Type: 'Toor Dal' }, tags: ['dal','toor','1kg','pulse'] },
          { name: 'Sugar 1kg', brand: 'DailyNeeds', price: 49, desc: 'Refined white sugar', specs: { Weight: '1kg', Type: 'Sugar' }, tags: ['sugar','1kg','staple'] },
          { name: 'Sunflower Cooking Oil 1L', brand: 'NatureBest', price: 139, compareAt: 169, desc: 'Refined sunflower oil', specs: { Volume: '1L', Type: 'Sunflower Oil' }, tags: ['oil','sunflower','1l','cooking'] },
          { name: 'Sona Masoori Rice 5kg', brand: 'GoldGrain', price: 399, desc: 'Everyday medium grain rice', specs: { Weight: '5kg', Type: 'Sona Masoori' }, tags: ['rice','sona masoori','5kg'] },
          { name: 'Moong Dal 1kg', brand: 'PureHarvest', price: 129, desc: 'Yellow moong dal', specs: { Weight: '1kg', Type: 'Moong Dal' }, tags: ['dal','moong','1kg','pulse'] },
          { name: 'Mustard Oil 1L', brand: 'NatureBest', price: 159, compareAt: 189, desc: 'Cold-pressed mustard oil', specs: { Volume: '1L', Type: 'Mustard Oil' }, tags: ['oil','mustard','1l','cooking'] },
          { name: 'Besan 1kg', brand: 'FarmFresh', price: 89, desc: 'Gram flour for cooking', specs: { Weight: '1kg', Type: 'Besan' }, tags: ['besan','gram flour','1kg'] },
          { name: 'Iodized Salt 1kg', brand: 'DailyNeeds', price: 25, desc: 'Iodized table salt', specs: { Weight: '1kg', Type: 'Salt' }, tags: ['salt','1kg','iodized'] },
        ],
      },
      {
        name: 'Snacks', slug: 'snacks', emoji: '🍪', imageQuery: 'snacks chips biscuits product photo',
        brands: ['CrunchTime', 'TastyBites', 'SnackWell', 'ChipMate', 'CookieKing', 'MunchOn'],
        products: [
          { name: 'Potato Chips 52g - Salted', brand: 'CrunchTime', price: 20, desc: 'Crispy salted potato chips', specs: { Weight: '52g', Flavor: 'Salted' }, tags: ['chips','potato','salted','snack'] },
          { name: 'Chocolate Biscuits 200g', brand: 'CookieKing', price: 45, compareAt: 60, desc: 'Chocolate cream sandwich biscuits', specs: { Weight: '200g', Flavor: 'Chocolate' }, tags: ['biscuits','chocolate','200g'] },
          { name: 'Mixed Nuts 200g', brand: 'SnackWell', price: 199, compareAt: 249, desc: 'Almonds, cashews, raisins mix', specs: { Weight: '200g', Type: 'Mixed Nuts' }, tags: ['nuts','mixed','200g','healthy'] },
          { name: 'Masala Peanuts 150g', brand: 'MunchOn', price: 35, desc: 'Spicy roasted peanuts', specs: { Weight: '150g', Flavor: 'Masala' }, tags: ['peanuts','masala','150g','spicy'] },
          { name: 'Cream Wafers 150g', brand: 'CookieKing', price: 40, desc: 'Vanilla cream wafers', specs: { Weight: '150g', Flavor: 'Vanilla' }, tags: ['wafers','vanilla','150g'] },
          { name: 'Nachos 150g - Cheese', brand: 'ChipMate', price: 55, compareAt: 75, desc: 'Cheese-flavored nacho chips', specs: { Weight: '150g', Flavor: 'Cheese' }, tags: ['nachos','cheese','150g'] },
          { name: 'Banana Chips 200g', brand: 'CrunchTime', price: 49, desc: 'Crunchy banana chips', specs: { Weight: '200g', Type: 'Banana Chips' }, tags: ['chips','banana','200g'] },
          { name: 'Popcorn 100g - Caramel', brand: 'MunchOn', price: 69, desc: 'Caramel popcorn', specs: { Weight: '100g', Flavor: 'Caramel' }, tags: ['popcorn','caramel','100g'] },
          { name: 'Khakra 200g', brand: 'TastyBites', price: 59, compareAt: 79, desc: 'Thin crispy wheat khakra', specs: { Weight: '200g', Type: 'Khakra' }, tags: ['khakra','wheat','200g'] },
          { name: 'Energy Bar 40g - Berry', brand: 'SnackWell', price: 39, desc: 'Berry energy bar with oats', specs: { Weight: '40g', Flavor: 'Berry', Type: 'Energy Bar' }, tags: ['energy bar','berry','oats','healthy'] },
        ],
      },
      {
        name: 'Beverages', slug: 'beverages', emoji: '🥤', imageQuery: 'tea coffee juice beverage bottle product photo',
        brands: ['FreshSip', 'BrewMaster', 'TeaGarden', 'CoolDrink', 'NatureBrew', 'EnergyBoost'],
        products: [
          { name: 'Premium Tea 250g', brand: 'TeaGarden', price: 149, compareAt: 199, desc: 'CTC premium tea leaves', specs: { Weight: '250g', Type: 'Tea' }, tags: ['tea','250g','beverage'] },
          { name: 'Instant Coffee 100g', brand: 'BrewMaster', price: 249, desc: 'Freeze-dried instant coffee', specs: { Weight: '100g', Type: 'Coffee' }, tags: ['coffee','instant','100g'] },
          { name: 'Green Tea Bags 25ct', brand: 'NatureBrew', price: 129, compareAt: 179, desc: '25 green tea bags', specs: { Count: '25 bags', Type: 'Green Tea' }, tags: ['green tea','bags','25','healthy'] },
          { name: 'Orange Juice 1L', brand: 'FreshSip', price: 99, desc: '100% orange juice', specs: { Volume: '1L', Flavor: 'Orange' }, tags: ['juice','orange','1l'] },
          { name: 'Energy Drink 250ml', brand: 'EnergyBoost', price: 69, compareAt: 99, desc: 'Energy drink with taurine', specs: { Volume: '250ml', Type: 'Energy Drink' }, tags: ['energy drink','250ml'] },
          { name: 'Cola 750ml', brand: 'CoolDrink', price: 39, desc: 'Chilled cola soft drink', specs: { Volume: '750ml', Flavor: 'Cola' }, tags: ['cola','750ml','soft drink'] },
          { name: 'Lemon Iced Tea 500ml', brand: 'FreshSip', price: 49, desc: 'Lemon flavored iced tea', specs: { Volume: '500ml', Flavor: 'Lemon' }, tags: ['iced tea','lemon','500ml'] },
          { name: 'Ground Coffee 250g', brand: 'BrewMaster', price: 399, compareAt: 499, desc: 'Arabica ground coffee', specs: { Weight: '250g', Type: 'Ground Coffee', Bean: 'Arabica' }, tags: ['coffee','ground','arabica','250g'] },
          { name: 'Masala Chai Mix 200g', brand: 'TeaGarden', price: 99, desc: 'Instant masala chai premix', specs: { Weight: '200g', Type: 'Chai Mix' }, tags: ['chai','masala','200g','instant'] },
          { name: 'Packaged Water 1L', brand: 'CoolDrink', price: 20, desc: 'Mineral water 1L bottle', specs: { Volume: '1L', Type: 'Water' }, tags: ['water','1l','mineral'] },
        ],
      },
      {
        name: 'Dairy & Eggs', slug: 'dairy-eggs', emoji: '🥛', imageQuery: 'milk dairy eggs product photo',
        brands: ['DairyFresh', 'FarmPure', 'MooMilk', 'EggFarm', 'DailyDairy', 'FreshFarm'],
        products: [
          { name: 'Full Cream Milk 1L', brand: 'DairyFresh', price: 64, desc: 'Fresh full cream milk', specs: { Volume: '1L', Fat: '6%' }, tags: ['milk','1l','full cream','dairy'] },
          { name: 'Toned Milk 500ml', brand: 'FarmPure', price: 27, desc: 'Toned milk pouch', specs: { Volume: '500ml', Fat: '3%' }, tags: ['milk','500ml','toned'] },
          { name: 'Brown Eggs 6ct', brand: 'EggFarm', price: 60, compareAt: 72, desc: 'Farm fresh brown eggs', specs: { Count: '6', Type: 'Brown' }, tags: ['eggs','6','brown','farm'] },
          { name: 'Paneer 200g', brand: 'DailyDairy', price: 89, desc: 'Fresh cottage cheese', specs: { Weight: '200g', Type: 'Paneer' }, tags: ['paneer','200g','cheese'] },
          { name: 'Greek Yogurt 150g', brand: 'MooMilk', price: 49, desc: 'Thick greek yogurt', specs: { Weight: '150g', Type: 'Yogurt' }, tags: ['yogurt','greek','150g'] },
          { name: 'Butter 100g', brand: 'DairyFresh', price: 52, desc: 'Salted butter', specs: { Weight: '100g', Type: 'Butter' }, tags: ['butter','100g','salted'] },
          { name: 'Cheese Slices 200g', brand: 'DailyDairy', price: 129, compareAt: 159, desc: '10 cheese slices', specs: { Weight: '200g', Slices: '10' }, tags: ['cheese','slices','200g'] },
          { name: 'White Eggs 12ct', brand: 'EggFarm', price: 84, desc: 'Farm fresh white eggs dozen', specs: { Count: '12', Type: 'White' }, tags: ['eggs','12','white','dozen'] },
          { name: 'Curd 400g', brand: 'FarmPure', price: 35, desc: 'Fresh curd tub', specs: { Weight: '400g', Type: 'Curd' }, tags: ['curd','400g','dairy'] },
          { name: 'Cream Cheese 200g', brand: 'MooMilk', price: 149, desc: 'Spreadable cream cheese', specs: { Weight: '200g', Type: 'Cream Cheese' }, tags: ['cream cheese','200g','spread'] },
        ],
      },
    ],
  },
  // ===== 6. HEALTH & WELLNESS =====
  {
    name: 'Health & Wellness', slug: 'health-wellness', emoji: '💊',
    subcategories: [
      {
        name: 'Vitamins & Supplements', slug: 'vitamins-supplements', emoji: '💊', imageQuery: 'vitamins supplements bottle product photo',
        brands: ['NutriLife', 'HealthFirst', 'BioPlus', 'VitaBoost', 'PureNutrition', 'GreenLeaf'],
        products: [
          { name: 'Multivitamin Tablets 60ct', brand: 'NutriLife', price: 399, compareAt: 599, desc: 'Daily multivitamin with minerals', specs: { Count: '60', Type: 'Multivitamin' }, tags: ['vitamins','multivitamin','60','supplement'] },
          { name: 'Vitamin C 1000mg 30ct', brand: 'VitaBoost', price: 249, desc: 'Immune support vitamin C tablets', specs: { Count: '30', Dose: '1000mg' }, tags: ['vitamin c','1000mg','30','immune'] },
          { name: 'Omega-3 Fish Oil 60ct', brand: 'BioPlus', price: 499, compareAt: 699, desc: 'EPA DHA omega-3 softgels', specs: { Count: '60', Type: 'Omega-3' }, tags: ['omega-3','fish oil','60','epa'] },
          { name: 'Vitamin D3 60K IU 4ct', brand: 'HealthFirst', price: 129, desc: 'Weekly vitamin D3 sachets', specs: { Count: '4', Dose: '60K IU' }, tags: ['vitamin d3','60k','4','weekly'] },
          { name: 'Whey Protein 1kg', brand: 'PureNutrition', price: 1499, compareAt: 1999, desc: 'Whey protein powder chocolate', specs: { Weight: '1kg', Flavor: 'Chocolate', Protein: '24g/serving' }, tags: ['protein','whey','1kg','chocolate'] },
          { name: 'Biotin Tablets 30ct', brand: 'GreenLeaf', price: 199, desc: 'For hair, skin and nails', specs: { Count: '30', Dose: '10mg' }, tags: ['biotin','hair','30','beauty'] },
          { name: 'Calcium + D3 60ct', brand: 'NutriLife', price: 349, compareAt: 449, desc: 'Bone health supplement', specs: { Count: '60', Type: 'Calcium' }, tags: ['calcium','d3','60','bone health'] },
          { name: 'Zinc Tablets 30ct', brand: 'VitaBoost', price: 179, desc: 'Immune support zinc', specs: { Count: '30', Dose: '50mg' }, tags: ['zinc','30','immune'] },
          { name: 'Iron + Folic Acid 30ct', brand: 'HealthFirst', price: 149, desc: 'For anemia prevention', specs: { Count: '30', Type: 'Iron' }, tags: ['iron','folic acid','30','anemia'] },
          { name: 'Probiotics 30ct', brand: 'BioPlus', price: 399, compareAt: 499, desc: 'Gut health probiotic', specs: { Count: '30', Type: 'Probiotic' }, tags: ['probiotics','30','gut health'] },
        ],
      },
      {
        name: 'Personal Care Devices', slug: 'personal-care-devices', emoji: '🦷', imageQuery: 'electric toothbrush massager device product photo',
        brands: ['DentaCare', 'HealthTech', 'BodyRelief', 'PulsePro', 'MediHome', 'WellDevice'],
        products: [
          { name: 'Electric Toothbrush Sonic', brand: 'DentaCare', price: 1299, compareAt: 1799, desc: 'Sonic electric toothbrush with 5 modes', specs: { Type: 'Sonic', Modes: '5', Battery: '30 days' }, tags: ['toothbrush','electric','sonic','dental'] },
          { name: 'Blood Pressure Monitor', brand: 'HealthTech', price: 1999, desc: 'Digital BP monitor with arm cuff', specs: { Type: 'Digital', Cuff: 'Arm', Display: 'LCD' }, tags: ['bp monitor','health','digital'] },
          { name: 'Pulse Oximeter Fingertip', brand: 'PulsePro', price: 999, compareAt: 1499, desc: 'SpO2 and pulse rate monitor', specs: { Type: 'Fingertip', Display: 'OLED' }, tags: ['pulse oximeter','spo2','fingertip'] },
          { name: 'Digital Thermometer', brand: 'MediHome', price: 149, desc: 'Quick read digital thermometer', specs: { Type: 'Digital', Speed: '10s' }, tags: ['thermometer','digital','fever'] },
          { name: 'Massage Gun Deep Tissue', brand: 'BodyRelief', price: 3499, compareAt: 4999, desc: 'Percussion massager with 6 heads', specs: { Heads: '6', Speed: '5 levels', Battery: '4h' }, tags: ['massage gun','percussion','recovery'] },
          { name: 'Infrared Forehead Thermometer', brand: 'HealthTech', price: 1299, desc: 'No-touch infrared thermometer', specs: { Type: 'Infrared', Method: 'No-touch' }, tags: ['thermometer','infrared','no touch'] },
          { name: 'Nebulizer Machine', brand: 'MediHome', price: 1499, compareAt: 1999, desc: 'Compressor nebulizer for respiratory', specs: { Type: 'Compressor', Speed: 'Fast' }, tags: ['nebulizer','respiratory','health'] },
          { name: 'Glucose Monitor Kit', brand: 'PulsePro', price: 899, desc: 'Blood glucose monitoring kit', specs: { Type: 'Glucose', Includes: '10 strips' }, tags: ['glucose','diabetes','monitor'] },
          { name: 'TENS Massager Unit', brand: 'BodyRelief', price: 2199, desc: 'Pain relief TENS unit', specs: { Type: 'TENS', Modes: '8', Pads: '4' }, tags: ['tens','massager','pain relief'] },
          { name: 'Water Flosser', brand: 'DentaCare', price: 1799, compareAt: 2299, desc: 'Cordless water flosser', specs: { Type: 'Water Flosser', Tank: '200ml' }, tags: ['flosser','water','dental','cordless'] },
        ],
      },
      {
        name: 'Ayurveda & Herbal', slug: 'ayurveda-herbal', emoji: '🌿', imageQuery: 'ayurveda herbal medicine product photo',
        brands: ['AyurLife', 'HerbPure', 'NatureCure', 'VedicHerbs', 'GreenLeaf', 'TraditionalCare'],
        products: [
          { name: 'Ashwagandha Capsules 60ct', brand: 'AyurLife', price: 349, compareAt: 449, desc: 'Stress relief and energy', specs: { Count: '60', Dose: '500mg' }, tags: ['ashwagandha','ayurveda','stress','60'] },
          { name: 'Triphala Powder 200g', brand: 'HerbPure', price: 199, desc: 'Digestive health powder', specs: { Weight: '200g', Type: 'Powder' }, tags: ['triphala','digestive','200g','ayurveda'] },
          { name: 'Turmeric Curcumin 60ct', brand: 'NatureCure', price: 299, compareAt: 399, desc: 'Anti-inflammatory turmeric extract', specs: { Count: '60', Dose: '500mg' }, tags: ['turmeric','curcumin','60','anti-inflammatory'] },
          { name: 'Chyawanprash 1kg', brand: 'VedicHerbs', price: 399, desc: 'Immunity booster herbal jam', specs: { Weight: '1kg', Type: 'Chyawanprash' }, tags: ['chyawanprash','immunity','1kg','herbal'] },
          { name: 'Neem Tablets 60ct', brand: 'GreenLeaf', price: 179, desc: 'Skin and blood purifier', specs: { Count: '60', Dose: '500mg' }, tags: ['neem','skin','60','purifier'] },
          { name: 'Brahmi Capsules 60ct', brand: 'AyurLife', price: 279, compareAt: 349, desc: 'Memory and focus support', specs: { Count: '60', Dose: '500mg' }, tags: ['brahmi','memory','60','focus'] },
          { name: 'Amla Juice 1L', brand: 'HerbPure', price: 249, desc: 'Indian gooseberry juice', specs: { Volume: '1L', Type: 'Amla Juice' }, tags: ['amla','juice','1l','vitamin c'] },
          { name: 'Shilajit Resin 20g', brand: 'VedicHerbs', price: 599, compareAt: 799, desc: 'Pure himalayan shilajit', specs: { Weight: '20g', Type: 'Resin' }, tags: ['shilajit','resin','20g','energy'] },
          { name: 'Ginger Honey 250g', brand: 'NatureCure', price: 199, desc: 'Ginger infused honey', specs: { Weight: '250g', Type: 'Honey' }, tags: ['ginger','honey','250g','cough'] },
          { name: 'Joint Care Oil 100ml', brand: 'TraditionalCare', price: 179, desc: 'Ayurvedic joint pain oil', specs: { Volume: '100ml', Type: 'Oil' }, tags: ['joint care','oil','100ml','pain relief'] },
        ],
      },
    ],
  },
  // ===== 7. SPORTS & FITNESS =====
  {
    name: 'Sports & Fitness', slug: 'sports-fitness', emoji: '🏃',
    subcategories: [
      {
        name: 'Gym Equipment', slug: 'gym-equipment', emoji: '🏋️', imageQuery: 'gym equipment dumbbell fitness product photo',
        brands: ['Forge', 'PowerLift', 'GymPro', 'FitGear', 'MaxStrength', 'IronCore'],
        products: [
          { name: 'Adjustable Dumbbell Set 24kg', brand: 'Forge', price: 19999, compareAt: 25999, desc: 'Quick-select adjustable dumbbells', specs: { 'Weight': '2.5-24kg per hand', Type: 'Adjustable' }, tags: ['dumbbell','adjustable','24kg','home gym'] },
          { name: 'Yoga Mat Pro 6mm', brand: 'Drift', price: 2999, compareAt: 3999, desc: 'Natural rubber yoga mat', specs: { Thickness: '6mm', Material: 'Rubber+PU' }, tags: ['yoga mat','6mm','natural rubber','grip'] },
          { name: 'Resistance Bands Set of 5', brand: 'FitGear', price: 599, desc: '5 levels resistance bands', specs: { Count: '5', Levels: '5-50lbs' }, tags: ['resistance bands','set of 5','fitness'] },
          { name: 'Pull-Up Bar Doorway', brand: 'PowerLift', price: 1499, compareAt: 1999, desc: 'No-drill doorway pull-up bar', specs: { Type: 'Doorway', Max: '120kg' }, tags: ['pull up bar','doorway','home gym'] },
          { name: 'Kettlebell 16kg', brand: 'IronCore', price: 1799, desc: 'Cast iron kettlebell', specs: { Weight: '16kg', Material: 'Cast Iron' }, tags: ['kettlebell','16kg','cast iron'] },
          { name: 'Push-Up Stands Pair', brand: 'GymPro', price: 399, desc: 'Ergonomic push-up stands', specs: { Type: 'Pair', Material: 'Steel+Foam' }, tags: ['push up','stands','pair'] },
          { name: 'Exercise Bike Stationary', brand: 'Forge', price: 14999, compareAt: 18999, desc: 'Magnetic resistance exercise bike', specs: { Type: 'Stationary', Resistance: 'Magnetic', Flywheel: '8kg' }, tags: ['exercise bike','stationary','magnetic','cardio'] },
          { name: 'Treadmill Foldable 2HP', brand: 'PowerLift', price: 29999, desc: 'Foldable motorized treadmill', specs: { Motor: '2HP', Speed: '14km/h', Type: 'Foldable' }, tags: ['treadmill','foldable','2hp','cardio'] },
          { name: 'Weight Bench Adjustable', brand: 'IronCore', price: 7999, compareAt: 9999, desc: 'Multi-position adjustable bench', specs: { Positions: '7', Max: '200kg' }, tags: ['bench','adjustable','weight bench'] },
          { name: 'Jump Rope Pro', brand: 'FitGear', price: 249, desc: 'Speed jump rope with bearings', specs: { Type: 'Speed', Material: 'PVC+Steel' }, tags: ['jump rope','speed','cardio'] },
        ],
      },
      {
        name: 'Yoga & Meditation', slug: 'yoga-meditation', emoji: '🧘', imageQuery: 'yoga mat meditation cushion product photo',
        brands: ['ZenYoga', 'MindfulMat', 'CalmSpace', 'LotusPosition', 'PeaceFlow', 'YogaLife'],
        products: [
          { name: 'Yoga Mat 6mm - Purple', brand: 'ZenYoga', price: 899, compareAt: 1299, desc: 'TPE yoga mat with carry strap', specs: { Thickness: '6mm', Material: 'TPE', Color: 'Purple' }, tags: ['yoga mat','6mm','tpe','purple'] },
          { name: 'Meditation Cushion Zafu', brand: 'CalmSpace', price: 699, desc: 'Buckwheat filled meditation cushion', specs: { Type: 'Zafu', Fill: 'Buckwheat' }, tags: ['meditation','cushion','zafu'] },
          { name: 'Yoga Block Cork', brand: 'MindfulMat', price: 399, desc: 'Natural cork yoga block', specs: { Material: 'Cork', Type: 'Block' }, tags: ['yoga block','cork','natural'] },
          { name: 'Yoga Strap 8ft', brand: 'PeaceFlow', price: 249, desc: 'Cotton yoga strap with buckle', specs: { Length: '8ft', Material: 'Cotton' }, tags: ['yoga strap','8ft','cotton'] },
          { name: 'Yoga Bolster - Rectangular', brand: 'LotusPosition', price: 999, compareAt: 1299, desc: 'Supportive yoga bolster', specs: { Shape: 'Rectangular', Material: 'Organic Cotton' }, tags: ['yoga bolster','rectangular','support'] },
          { name: 'Eye Pillow - Lavender', brand: 'CalmSpace', price: 199, desc: 'Lavender scented eye pillow', specs: { Type: 'Eye Pillow', Fill: 'Lavender+Flaxseed' }, tags: ['eye pillow','lavender','relaxation'] },
          { name: 'Yoga Mat Towel 183x65cm', brand: 'ZenYoga', price: 499, desc: 'Sweat-absorbing yoga towel', specs: { Size: '183x65cm', Material: 'Microfiber' }, tags: ['yoga towel','microfiber','sweat'] },
          { name: 'Incense Holder Set', brand: 'PeaceFlow', price: 299, desc: 'Brass incense holder with sticks', specs: { Type: 'Holder', Material: 'Brass', Includes: '20 sticks' }, tags: ['incense','holder','brass','meditation'] },
          { name: 'Yoga Socks - Grip', brand: 'YogaLife', price: 249, compareAt: 349, desc: 'Non-slip grip yoga socks', specs: { Type: 'Socks', Grip: 'Yes' }, tags: ['yoga socks','grip','non-slip'] },
          { name: 'Singing Bowl 4 inch', brand: 'LotusPosition', price: 799, desc: 'Tibetan singing bowl with mallet', specs: { Size: '4 inch', Type: 'Singing Bowl' }, tags: ['singing bowl','tibetan','meditation'] },
        ],
      },
      {
        name: 'Cycling', slug: 'cycling', emoji: '🚲', imageQuery: 'bicycle cycling helmet product photo',
        brands: ['RidePro', 'CycleMax', 'TrekBike', 'UrbanCycle', 'SpeedRider', 'MountainTrail'],
        products: [
          { name: 'Mountain Bike 26" 21-Speed', brand: 'MountainTrail', price: 12999, compareAt: 16999, desc: '26" MTB with disc brakes and 21 gears', specs: { Wheel: '26"', Gears: '21', Brakes: 'Disc' }, tags: ['bike','mountain','26 inch','21 speed'] },
          { name: 'Hybrid Bike 27.5"', brand: 'UrbanCycle', price: 14999, desc: 'City hybrid bike for commute', specs: { Wheel: '27.5"', Gears: '18', Type: 'Hybrid' }, tags: ['bike','hybrid','27.5','commute'] },
          { name: 'Cycling Helmet Adult', brand: 'RidePro', price: 999, compareAt: 1499, desc: 'Adjustable cycling helmet with vents', specs: { Type: 'Helmet', Size: 'Adjustable', Vents: '20' }, tags: ['helmet','cycling','safety'] },
          { name: 'Bicycle Pump Floor', brand: 'CycleMax', price: 799, desc: 'Floor pump with pressure gauge', specs: { Type: 'Floor Pump', Gauge: 'Yes' }, tags: ['pump','floor','gauge','bicycle'] },
          { name: 'Bike Lights Set Front+Rear', brand: 'SpeedRider', price: 599, compareAt: 899, desc: 'LED bike light set with USB recharge', specs: { Type: 'Light Set', Battery: 'USB Rechargeable' }, tags: ['bike lights','led','usb','safety'] },
          { name: 'Cycling Gloves Full Finger', brand: 'RidePro', price: 399, desc: 'Gel padded cycling gloves', specs: { Type: 'Gloves', Padding: 'Gel', Fingers: 'Full' }, tags: ['gloves','cycling','gel padded'] },
          { name: 'Bike Phone Mount Holder', brand: 'UrbanCycle', price: 249, desc: 'Handlebar phone mount for navigation', specs: { Type: 'Phone Mount', Fit: 'Universal' }, tags: ['phone mount','bike','handlebar'] },
          { name: 'Cycling Bottle 750ml', brand: 'SpeedRider', price: 199, desc: 'BPA-free cycling water bottle', specs: { Volume: '750ml', Material: 'BPA-free' }, tags: ['bottle','cycling','750ml'] },
          { name: 'Bike Lock Cable 4ft', brand: 'CycleMax', price: 349, compareAt: 499, desc: 'Combination cable bike lock', specs: { Type: 'Cable Lock', Length: '4ft', Lock: 'Combination' }, tags: ['lock','cable','4ft','combination'] },
          { name: 'Folding Bike 20"', brand: 'UrbanCycle', price: 17999, compareAt: 21999, desc: 'Compact folding bike for commute', specs: { Wheel: '20"', Type: 'Folding', Gears: '7' }, tags: ['bike','folding','20 inch','commute'] },
        ],
      },
    ],
  },
  // ===== 8. BOOKS & STATIONERY =====
  {
    name: 'Books & Stationery', slug: 'books-stationery', emoji: '📚',
    subcategories: [
      {
        name: 'Fiction Books', slug: 'fiction-books', emoji: '📖', imageQuery: 'fiction novel book product photo',
        brands: ['PageTurner', 'LiteraryPress', 'BestSeller', 'NovelHouse', 'WordCraft', 'StoryWeave'],
        products: [
          { name: 'The Midnight Library - Novel', brand: 'PageTurner', price: 299, compareAt: 399, desc: 'Bestselling fiction by Matt Haig', specs: { Pages: '304', Language: 'English', Type: 'Paperback' }, tags: ['book','fiction','novel','bestseller'] },
          { name: 'Atomic Habits', brand: 'BestSeller', price: 399, desc: 'Self-improvement by James Clear', specs: { Pages: '320', Language: 'English', Type: 'Paperback' }, tags: ['book','self-help','non-fiction'] },
          { name: 'Mystery of the Silent Manor', brand: 'NovelHouse', price: 249, compareAt: 349, desc: 'Gripping mystery thriller', specs: { Pages: '280', Genre: 'Mystery', Type: 'Paperback' }, tags: ['book','mystery','thriller'] },
          { name: 'Love in the Time of Rain', brand: 'StoryWeave', price: 199, desc: 'Romantic fiction novel', specs: { Pages: '240', Genre: 'Romance', Type: 'Paperback' }, tags: ['book','romance','novel'] },
          { name: 'The Last Horizon - Sci-Fi', brand: 'WordCraft', price: 349, compareAt: 449, desc: 'Science fiction adventure', specs: { Pages: '360', Genre: 'Sci-Fi', Type: 'Paperback' }, tags: ['book','sci-fi','adventure'] },
          { name: 'Whispers in the Dark', brand: 'NovelHouse', price: 229, desc: 'Horror fiction collection', specs: { Pages: '200', Genre: 'Horror', Type: 'Paperback' }, tags: ['book','horror','stories'] },
          { name: 'The Rich Heritage - Historical', brand: 'LiteraryPress', price: 379, compareAt: 499, desc: 'Historical fiction saga', specs: { Pages: '420', Genre: 'Historical', Type: 'Paperback' }, tags: ['book','historical','fiction'] },
          { name: 'Code Red - Tech Thriller', brand: 'PageTurner', price: 299, desc: 'Cyber thriller novel', specs: { Pages: '310', Genre: 'Thriller', Type: 'Paperback' }, tags: ['book','thriller','cyber'] },
          { name: 'The Garden of Dreams', brand: 'StoryWeave', price: 189, compareAt: 249, desc: 'Feel-good fiction', specs: { Pages: '180', Genre: 'Fiction', Type: 'Paperback' }, tags: ['book','fiction','feel-good'] },
          { name: 'Shadows of the Past', brand: 'WordCraft', price: 259, desc: 'Drama fiction novel', specs: { Pages: '260', Genre: 'Drama', Type: 'Paperback' }, tags: ['book','drama','fiction'] },
        ],
      },
      {
        name: 'Notebooks & Diaries', slug: 'notebooks-diaries', emoji: '📓', imageQuery: 'notebook diary journal product photo',
        brands: ['WriteWell', 'PaperCraft', 'NoteMate', 'InkFlow', 'DailyJournal', 'PremiumPad'],
        products: [
          { name: 'A5 Ruled Notebook 200 Pages', brand: 'WriteWell', price: 99, compareAt: 149, desc: 'Spiral bound ruled notebook', specs: { Size: 'A5', Pages: '200', Type: 'Ruled' }, tags: ['notebook','a5','200 pages','ruled'] },
          { name: 'Leather Journal A5', brand: 'PremiumPad', price: 499, compareAt: 699, desc: 'Premium leather bound journal', specs: { Size: 'A5', Material: 'Leather', Pages: '160' }, tags: ['journal','leather','a5','premium'] },
          { name: '2026 Daily Planner', brand: 'DailyJournal', price: 299, desc: 'Daily planner with goals tracking', specs: { Year: '2026', Type: 'Planner' }, tags: ['planner','2026','daily'] },
          { name: 'Grid Notebook A4', brand: 'PaperCraft', price: 149, compareAt: 199, desc: 'Graph paper notebook for math', specs: { Size: 'A4', Pages: '160', Type: 'Grid' }, tags: ['notebook','a4','grid','graph'] },
          { name: 'Pocket Diary 2026', brand: 'NoteMate', price: 79, desc: 'Mini pocket diary', specs: { Size: 'Pocket', Year: '2026' }, tags: ['diary','pocket','2026'] },
          { name: 'Dot Grid Notebook A5', brand: 'InkFlow', price: 199, compareAt: 279, desc: 'Dotted pages for bullet journal', specs: { Size: 'A5', Pages: '180', Type: 'Dot Grid' }, tags: ['notebook','dot grid','bullet journal'] },
          { name: 'Hardcover Notebook A5 240p', brand: 'WriteWell', price: 179, desc: 'Hardcover ruled notebook', specs: { Size: 'A5', Pages: '240', Type: 'Hardcover' }, tags: ['notebook','hardcover','240','a5'] },
          { name: 'Sketch Book A4 100p', brand: 'PaperCraft', price: 159, compareAt: 219, desc: 'Blank pages sketch book', specs: { Size: 'A4', Pages: '100', Type: 'Blank' }, tags: ['sketch book','a4','100','blank'] },
          { name: 'Executive Diary 2026', brand: 'PremiumPad', price: 399, desc: 'Executive leather diary', specs: { Year: '2026', Material: 'Leather', Type: 'Executive' }, tags: ['diary','executive','leather','2026'] },
          { name: 'Set of 3 Pocket Notebooks', brand: 'NoteMate', price: 149, desc: '3 mini pocket notebooks', specs: { Count: '3', Size: 'Pocket' }, tags: ['notebook','pocket','set of 3'] },
        ],
      },
      {
        name: 'Pens & Office Supplies', slug: 'pens-office-supplies', emoji: '🖊️', imageQuery: 'pens office supplies product photo',
        brands: ['InkPro', 'WriteSmooth', 'OfficeMate', 'PenCraft', 'StationeryHub', 'ProWrite'],
        products: [
          { name: 'Gel Pens Set of 10', brand: 'InkPro', price: 99, compareAt: 149, desc: '10-color gel pen set', specs: { Count: '10', Type: 'Gel' }, tags: ['pens','gel','set of 10','colors'] },
          { name: 'Fountain Pen - Premium', brand: 'PenCraft', price: 499, compareAt: 799, desc: 'Metal body fountain pen with converter', specs: { Type: 'Fountain', Material: 'Metal' }, tags: ['pen','fountain','premium','metal'] },
          { name: 'Ball Pens Pack of 5', brand: 'WriteSmooth', price: 49, desc: 'Blue ballpoint pens', specs: { Count: '5', Color: 'Blue', Type: 'Ball' }, tags: ['pens','ballpoint','blue','5'] },
          { name: 'Stapler with 1000 Staples', brand: 'OfficeMate', price: 149, compareAt: 199, desc: 'Standard stapler with staples', specs: { Type: 'Stapler', Capacity: '20 sheets' }, tags: ['stapler','office','1000 staples'] },
          { name: 'Desk Organizer Set', brand: 'StationeryHub', price: 299, desc: '5-compartment desk organizer', specs: { Compartments: '5', Material: 'Plastic' }, tags: ['organizer','desk','office'] },
          { name: 'Highlighters Set of 6', brand: 'InkPro', price: 79, compareAt: 109, desc: '6 fluorescent highlighters', specs: { Count: '6', Type: 'Highlighter' }, tags: ['highlighters','6','fluorescent'] },
          { name: 'Correction Tape', brand: 'ProWrite', price: 39, desc: 'Instant correction tape', specs: { Type: 'Correction Tape', Length: '5m' }, tags: ['correction','tape','office'] },
          { name: 'Sticky Notes Pack of 12', brand: 'OfficeMate', price: 99, desc: '12-pad sticky notes assorted colors', specs: { Count: '12 pads', Type: 'Sticky Notes' }, tags: ['sticky notes','12','assorted'] },
          { name: 'Mechanical Pencil Set', brand: 'PenCraft', price: 129, compareAt: 179, desc: '3 mechanical pencils with lead', specs: { Count: '3', Type: 'Mechanical' }, tags: ['pencil','mechanical','set','lead'] },
          { name: ' scissors Steel 8 inch', brand: 'StationeryHub', price: 89, desc: 'Stainless steel scissors', specs: { Size: '8 inch', Material: 'Stainless Steel' }, tags: ['scissors','steel','8 inch','office'] },
        ],
      },
    ],
  },
  // ===== 9. TOYS, KIDS & BABY =====
  {
    name: 'Toys, Kids & Baby', slug: 'toys-kids-baby', emoji: '🧸',
    subcategories: [
      {
        name: 'Toys & Games', slug: 'toys-games', emoji: '🧸', imageQuery: 'toys games kids product photo',
        brands: ['PlayJoy', 'ToyLand', 'FunKids', 'GameWorld', 'CreativePlay', 'KidZone'],
        products: [
          { name: 'Building Blocks 200pc', brand: 'PlayJoy', price: 599, compareAt: 899, desc: '200-piece colorful building blocks', specs: { Pieces: '200', Age: '3+', Material: 'Plastic' }, tags: ['blocks','building','200','kids'] },
          { name: 'Remote Control Car', brand: 'ToyLand', price: 1299, compareAt: 1799, desc: '1:16 scale RC car with 2.4GHz remote', specs: { Scale: '1:16', Remote: '2.4GHz', Speed: '15km/h' }, tags: ['rc car','remote control','toy'] },
          { name: 'Board Game - Strategy', brand: 'GameWorld', price: 499, desc: 'Family strategy board game', specs: { Players: '2-6', Age: '8+', Time: '45 min' }, tags: ['board game','strategy','family'] },
          { name: 'Teddy Bear 2ft', brand: 'FunKids', price: 799, compareAt: 1099, desc: 'Soft plush teddy bear 2 feet', specs: { Size: '2ft', Material: 'Plush' }, tags: ['teddy bear','plush','2ft','soft'] },
          { name: 'Doll House Playset', brand: 'CreativePlay', price: 2499, compareAt: 3299, desc: '3-story doll house with furniture', specs: { Stories: '3', Includes: 'Furniture' }, tags: ['doll house','playset','3 story'] },
          { name: 'Educational Puzzle 100pc', brand: 'PlayJoy', price: 199, desc: '100-piece world map puzzle', specs: { Pieces: '100', Theme: 'World Map', Age: '6+' }, tags: ['puzzle','100','educational','map'] },
          { name: 'Drone for Kids', brand: 'ToyLand', price: 1999, compareAt: 2799, desc: 'Mini drone with camera', specs: { Camera: 'Yes', Flight: '8 min', Age: '12+' }, tags: ['drone','kids','camera','mini'] },
          { name: 'Action Figure Set', brand: 'KidZone', price: 349, desc: '6-piece action figure set', specs: { Count: '6', Material: 'Plastic' }, tags: ['action figures','6','set'] },
          { name: 'Toy Train Set', brand: 'FunKids', price: 1799, compareAt: 2299, desc: 'Battery operated train set with tracks', specs: { Includes: 'Tracks+Train', Power: 'Battery' }, tags: ['train set','toy','tracks'] },
          { name: 'Card Game - Family Fun', brand: 'GameWorld', price: 149, desc: 'Quick card game for family', specs: { Players: '2-8', Age: '6+', Time: '15 min' }, tags: ['card game','family','fun'] },
        ],
      },
      {
        name: 'Baby Care', slug: 'baby-care', emoji: '🍼', imageQuery: 'baby care diaper product photo',
        brands: ['BabySoft', 'MomCare', 'TinyLove', 'SafeBaby', 'GentleCare', 'NewLife'],
        products: [
          { name: 'Baby Diapers Medium 72ct', brand: 'BabySoft', price: 799, compareAt: 999, desc: 'Medium size 72 diapers', specs: { Size: 'M', Count: '72' }, tags: ['diapers','medium','72','baby'] },
          { name: 'Baby Wipes 72ct', brand: 'GentleCare', price: 99, desc: 'Aloe vera baby wipes', specs: { Count: '72', Type: 'Wipes' }, tags: ['wipes','72','baby','aloe'] },
          { name: 'Baby Lotion 200ml', brand: 'MomCare', price: 149, compareAt: 199, desc: 'Gentle moisturizing baby lotion', specs: { Volume: '200ml', Type: 'Lotion' }, tags: ['baby lotion','200ml','gentle'] },
          { name: 'Baby Shampoo 200ml', brand: 'SafeBaby', price: 129, desc: 'Tear-free baby shampoo', specs: { Volume: '200ml', Type: 'Shampoo' }, tags: ['baby shampoo','200ml','tear-free'] },
          { name: 'Feeding Bottle 250ml', brand: 'TinyLove', price: 199, compareAt: 299, desc: 'BPA-free feeding bottle', specs: { Volume: '250ml', Material: 'BPA-free' }, tags: ['bottle','feeding','250ml','bpa-free'] },
          { name: 'Baby Powder 400g', brand: 'GentleCare', price: 139, desc: 'Soothing baby powder', specs: { Weight: '400g', Type: 'Powder' }, tags: ['baby powder','400g'] },
          { name: 'Diaper Bag Multi-pocket', brand: 'NewLife', price: 999, compareAt: 1499, desc: 'Spacious diaper bag with changing pad', specs: { Pockets: '6', Includes: 'Changing pad' }, tags: ['diaper bag','multi-pocket','baby'] },
          { name: 'Baby Mosquito Net', brand: 'SafeBaby', price: 299, desc: 'Pop-up baby mosquito net', specs: { Type: 'Net', PopUp: 'Yes' }, tags: ['mosquito net','baby','pop-up'] },
          { name: 'Pacifier Set of 2', brand: 'TinyLove', price: 99, desc: 'Silicone pacifiers BPA-free', specs: { Count: '2', Material: 'Silicone' }, tags: ['pacifier','2','silicone','baby'] },
          { name: 'Baby Rash Cream 50g', brand: 'MomCare', price: 119, compareAt: 159, desc: 'Diaper rash cream', specs: { Weight: '50g', Type: 'Cream' }, tags: ['rash cream','50g','baby'] },
        ],
      },
      {
        name: "Kids' Clothing", slug: 'kids-clothing', emoji: '👶', imageQuery: 'kids clothing product photo',
        brands: ['LittleStar', 'KidsFashion', 'PlayTime', 'TinyTots', 'JuniorStyle', 'HappyKids'],
        products: [
          { name: 'Kids T-Shirt 3-4 Years - Red', brand: 'LittleStar', price: 249, compareAt: 349, desc: 'Cotton kids t-shirt', specs: { Age: '3-4 Years', Material: 'Cotton', Color: 'Red' }, tags: ['t-shirt','kids','3-4 years','red'] },
          { name: 'Girls Frock 5-6 Years - Pink', brand: 'KidsFashion', price: 499, compareAt: 699, desc: 'Cotton party frock', specs: { Age: '5-6 Years', Color: 'Pink', Type: 'Frock' }, tags: ['frock','girls','5-6 years','pink'] },
          { name: 'Kids Shorts 4-5 Years - Blue', brand: 'PlayTime', price: 199, desc: 'Cotton shorts for kids', specs: { Age: '4-5 Years', Color: 'Blue' }, tags: ['shorts','kids','4-5 years','blue'] },
          { name: 'Boys Shirt 6-7 Years - White', brand: 'TinyTots', price: 349, compareAt: 449, desc: 'Formal shirt for boys', specs: { Age: '6-7 Years', Color: 'White' }, tags: ['shirt','boys','6-7 years','white'] },
          { name: 'Kids Jeans 5-6 Years - Dark', brand: 'JuniorStyle', price: 399, desc: 'Stretch jeans for kids', specs: { Age: '5-6 Years', Color: 'Dark Blue' }, tags: ['jeans','kids','5-6 years'] },
          { name: 'Kids Winter Jacket 4-5 Years', brand: 'HappyKids', price: 699, compareAt: 999, desc: 'Padded winter jacket', specs: { Age: '4-5 Years', Type: 'Jacket' }, tags: ['jacket','kids','winter','4-5 years'] },
          { name: 'Girls Leggings 3-4 Years', brand: 'KidsFashion', price: 179, desc: 'Cotton leggings for girls', specs: { Age: '3-4 Years', Type: 'Leggings' }, tags: ['leggings','girls','3-4 years'] },
          { name: 'Kids Pajama Set 5-6 Years', brand: 'LittleStar', price: 299, compareAt: 399, desc: 'Cotton pajama set', specs: { Age: '5-6 Years', Type: 'Pajama Set' }, tags: ['pajama','kids','5-6 years','sleepwear'] },
          { name: 'Kids Hoodie 6-7 Years - Grey', brand: 'JuniorStyle', price: 499, desc: 'Fleece hoodie for kids', specs: { Age: '6-7 Years', Color: 'Grey' }, tags: ['hoodie','kids','6-7 years','grey'] },
          { name: 'Baby Romper 0-6 Months', brand: 'TinyTots', price: 249, compareAt: 349, desc: 'Onesie romper for baby', specs: { Age: '0-6 Months', Type: 'Romper' }, tags: ['romper','baby','0-6 months','onesie'] },
        ],
      },
    ],
  },
  // ===== 10. HOUSEHOLD & CLEANING =====
  {
    name: 'Household & Cleaning', slug: 'household-cleaning', emoji: '🧹',
    subcategories: [
      {
        name: 'Cleaning Supplies', slug: 'cleaning-supplies', emoji: '🧽', imageQuery: 'cleaning supplies spray mop product photo',
        brands: ['CleanHome', 'ShineBright', 'FreshClean', 'SparklePro', 'HomeCare', 'CleanForce'],
        products: [
          { name: 'Floor Cleaner 1L - Citrus', brand: 'CleanHome', price: 99, compareAt: 149, desc: 'Disinfectant floor cleaner', specs: { Volume: '1L', Scent: 'Citrus' }, tags: ['floor cleaner','1l','citrus','disinfectant'] },
          { name: 'Glass Cleaner 500ml', brand: 'ShineBright', price: 79, desc: 'Streak-free glass cleaner', specs: { Volume: '500ml', Type: 'Glass' }, tags: ['glass cleaner','500ml'] },
          { name: 'Toilet Cleaner 500ml', brand: 'FreshClean', price: 69, compareAt: 89, desc: 'Strong toilet bowl cleaner', specs: { Volume: '500ml', Type: 'Toilet' }, tags: ['toilet cleaner','500ml'] },
          { name: 'Dishwash Liquid 750ml', brand: 'CleanHome', price: 89, desc: 'Lemon dishwash liquid', specs: { Volume: '750ml', Scent: 'Lemon' }, tags: ['dishwash','750ml','lemon'] },
          { name: 'Spin Mop with Bucket', brand: 'SparklePro', price: 999, compareAt: 1499, desc: '360 spin mop with bucket', specs: { Type: 'Spin Mop', Includes: 'Bucket+2 pads' }, tags: ['mop','spin','bucket','cleaning'] },
          { name: 'Microfiber Cloth Set of 5', brand: 'HomeCare', price: 149, desc: '5 microfiber cleaning cloths', specs: { Count: '5', Material: 'Microfiber' }, tags: ['microfiber','cloth','5','cleaning'] },
          { name: 'Broom and Dustpan Set', brand: 'CleanForce', price: 199, compareAt: 299, desc: 'Floor broom with dustpan', specs: { Type: 'Broom+Dustpan' }, tags: ['broom','dustpan','cleaning set'] },
          { name: 'Bathroom Cleaner 500ml', brand: 'ShineBright', price: 79, desc: 'Removes hard water stains', specs: { Volume: '500ml', Type: 'Bathroom' }, tags: ['bathroom cleaner','500ml','stains'] },
          { name: 'Air Freshener 220ml - Lavender', brand: 'FreshClean', price: 99, compareAt: 129, desc: 'Lavender air freshener spray', specs: { Volume: '220ml', Scent: 'Lavender' }, tags: ['air freshener','lavender','220ml'] },
          { name: 'Trash Bags 30ct Large', brand: 'HomeCare', price: 99, desc: '30 large garbage bags', specs: { Count: '30', Size: 'Large' }, tags: ['trash bags','30','large','garbage'] },
        ],
      },
      {
        name: 'Cookware', slug: 'cookware', emoji: '🍲', imageQuery: 'cookware pot pan product photo',
        brands: ['ChefKing', 'CookMaster', 'RoyalCook', 'HomeChef', 'KitchenPro', 'PerfectPan'],
        products: [
          { name: 'Non-Stick Frying Pan 24cm', brand: 'ChefKing', price: 599, compareAt: 899, desc: 'Non-stick frying pan with glass lid', specs: { Size: '24cm', Material: 'Non-stick', Lid: 'Glass' }, tags: ['pan','frying','24cm','non-stick'] },
          { name: 'Pressure Cooker 3L Aluminum', brand: 'CookMaster', price: 999, desc: '3-liter aluminum pressure cooker', specs: { Capacity: '3L', Material: 'Aluminum' }, tags: ['pressure cooker','3l','aluminum'] },
          { name: 'Stainless Steel Kadai 26cm', brand: 'RoyalCook', price: 699, compareAt: 999, desc: 'Heavy bottom stainless steel kadai', specs: { Size: '26cm', Material: 'Stainless Steel' }, tags: ['kadai','26cm','stainless steel'] },
          { name: 'Cast Iron Dosa Tawa 30cm', brand: 'HomeChef', price: 899, desc: 'Pre-seasoned cast iron tawa', specs: { Size: '30cm', Material: 'Cast Iron' }, tags: ['tawa','cast iron','30cm','dosa'] },
          { name: 'Stock Pot 5L', brand: 'KitchenPro', price: 799, compareAt: 1099, desc: '5-liter stock pot with lid', specs: { Capacity: '5L', Material: 'Stainless Steel' }, tags: ['pot','stock','5l','stainless steel'] },
          { name: 'Milk Boiler 2L', brand: 'PerfectPan', price: 549, desc: '2-liter milk boiling pot', specs: { Capacity: '2L', Type: 'Milk Boiler' }, tags: ['milk boiler','2l','pot'] },
          { name: 'Idli Cooker 4-Plate', brand: 'HomeChef', price: 699, compareAt: 899, desc: '4-plate idli steamer', specs: { Plates: '4', Type: 'Idli' }, tags: ['idli','cooker','4 plate'] },
          { name: 'Wok 30cm Non-Stick', brand: 'ChefKing', price: 749, desc: 'Deep wok for stir frying', specs: { Size: '30cm', Type: 'Wok' }, tags: ['wok','30cm','non-stick','stir fry'] },
          { name: 'Copper Water Bottle 1L', brand: 'RoyalCook', price: 399, compareAt: 599, desc: 'Pure copper water bottle', specs: { Volume: '1L', Material: 'Copper' }, tags: ['bottle','copper','1l','water'] },
          { name: 'Steamer Basket 20cm', brand: 'KitchenPro', price: 299, desc: 'Stainless steel steamer basket', specs: { Size: '20cm', Material: 'Stainless Steel' }, tags: ['steamer','basket','20cm'] },
        ],
      },
      {
        name: 'Storage Containers', slug: 'storage-containers', emoji: '📦', imageQuery: 'storage containers jars product photo',
        brands: ['StoreWell', 'FreshKeep', 'OrganizeIt', 'SealFresh', 'ClearBox', 'StorePro'],
        products: [
          { name: 'Glass Jars Set of 6', brand: 'StoreWell', price: 499, compareAt: 699, desc: '6 glass storage jars with lids', specs: { Count: '6', Material: 'Glass' }, tags: ['jars','glass','6','storage'] },
          { name: 'Plastic Containers Set of 5', brand: 'FreshKeep', price: 299, desc: '5 airtight plastic containers', specs: { Count: '5', Material: 'BPA-free Plastic' }, tags: ['containers','plastic','5','airtight'] },
          { name: 'Spice Jars Set of 12', brand: 'OrganizeIt', price: 599, compareAt: 799, desc: '12 spice jars with labels', specs: { Count: '12', Includes: 'Labels+Rack' }, tags: ['spice jars','12','labels','rack'] },
          { name: 'Rice Dispenser 5kg', brand: 'SealFresh', price: 799, desc: '5kg rice storage dispenser', specs: { Capacity: '5kg', Type: 'Dispenser' }, tags: ['dispenser','rice','5kg'] },
          { name: 'Lunch Box 3 Compartment', brand: 'ClearBox', price: 249, compareAt: 349, desc: 'Leakproof 3-compartment lunch box', specs: { Compartments: '3', Leakproof: 'Yes' }, tags: ['lunch box','3 compartment','leakproof'] },
          { name: 'Food Clips Set of 10', brand: 'StorePro', price: 99, desc: '10 sealing clips for packets', specs: { Count: '10', Type: 'Clips' }, tags: ['clips','10','sealing','food'] },
          { name: 'Under Bed Storage Box', brand: 'OrganizeIt', price: 499, compareAt: 699, desc: 'Large under bed storage container', specs: { Type: 'Under Bed', Material: 'Plastic' }, tags: ['storage','under bed','box'] },
          { name: 'Water Bottle 1L Set of 2', brand: 'SealFresh', price: 199, desc: '2 BPA-free water bottles', specs: { Count: '2', Volume: '1L each' }, tags: ['bottle','water','1l','set of 2'] },
          { name: 'Dry Fruit Jar 500ml', brand: 'StoreWell', price: 149, desc: 'Airtight jar for dry fruits', specs: { Volume: '500ml', Type: 'Jar' }, tags: ['jar','dry fruit','500ml','airtight'] },
          { name: 'Stackable Bins Set of 3', brand: 'ClearBox', price: 399, compareAt: 549, desc: '3 stackable storage bins', specs: { Count: '3', Type: 'Stackable' }, tags: ['bins','stackable','3','storage'] },
        ],
      },
    ],
  },
  // ===== 11. AUTOMOTIVE =====
  {
    name: 'Automotive', slug: 'automotive', emoji: '🚗',
    subcategories: [
      {
        name: 'Car Care', slug: 'car-care', emoji: '🚙', imageQuery: 'car care polish wax product photo',
        brands: ['AutoShine', 'CarPro', 'DriveCare', 'MotorMax', 'AutoCare', 'ShineRide'],
        products: [
          { name: 'Car Wash Shampoo 1L', brand: 'AutoShine', price: 249, compareAt: 349, desc: 'pH-neutral car wash shampoo', specs: { Volume: '1L', Type: 'Shampoo' }, tags: ['car wash','shampoo','1l','cleaning'] },
          { name: 'Car Polish and Wax 250ml', brand: 'CarPro', price: 399, desc: '2-in-1 polish and wax', specs: { Volume: '250ml', Type: 'Polish+Wax' }, tags: ['polish','wax','250ml','car care'] },
          { name: 'Microfiber Wash Mitt', brand: 'AutoCare', price: 149, desc: 'Microfiber car wash mitt', specs: { Type: 'Mitt', Material: 'Microfiber' }, tags: ['wash mitt','microfiber','car care'] },
          { name: 'Tire Shine Gel 500ml', brand: 'ShineRide', price: 299, compareAt: 399, desc: 'Long-lasting tire shine gel', specs: { Volume: '500ml', Type: 'Tire Gel' }, tags: ['tire shine','gel','500ml'] },
          { name: 'Car Vacuum Cleaner 12V', brand: 'DriveCare', price: 999, compareAt: 1499, desc: 'Portable car vacuum with attachments', specs: { Power: '12V', Type: 'Vacuum' }, tags: ['vacuum','car','12v','portable'] },
          { name: 'Dashboard Polish 200ml', brand: 'AutoShine', price: 179, desc: 'Dashboard cleaner and polish', specs: { Volume: '200ml', Type: 'Dashboard Polish' }, tags: ['dashboard','polish','200ml'] },
          { name: 'Glass Cleaner 500ml Car', brand: 'CarPro', price: 149, compareAt: 199, desc: 'Automotive glass cleaner', specs: { Volume: '500ml', Type: 'Glass Cleaner' }, tags: ['glass cleaner','car','500ml'] },
          { name: 'Car Cover Waterproof', brand: 'MotorMax', price: 799, compareAt: 1199, desc: 'Waterproof car cover sedan', specs: { Type: 'Cover', Size: 'Sedan', Water: 'Yes' }, tags: ['car cover','waterproof','sedan'] },
          { name: 'Air Freshener Car Vent', brand: 'ShineRide', price: 99, desc: 'Vent clip air freshener', specs: { Type: 'Vent Clip', Scent: 'Ocean' }, tags: ['air freshener','car','vent','clip'] },
          { name: 'Car Cleaning Brush Set', brand: 'AutoCare', price: 199, desc: '5-piece car cleaning brush set', specs: { Count: '5', Type: 'Brush Set' }, tags: ['brush','cleaning','5','car care'] },
        ],
      },
      {
        name: 'Car Electronics', slug: 'car-electronics', emoji: '📲', imageQuery: 'car electronics dashcam charger product photo',
        brands: ['DriveTech', 'AutoConnect', 'CarAudio', 'SmartDrive', 'RoadPro', 'PowerDrive'],
        products: [
          { name: 'Dash Cam Full HD', brand: 'DriveTech', price: 2999, compareAt: 3999, desc: '1080p dash cam with night vision', specs: { Resolution: '1080p', Night: 'Yes', Screen: '3 inch' }, tags: ['dash cam','1080p','night vision','car'] },
          { name: 'Bluetooth Car FM Transmitter', brand: 'AutoConnect', price: 599, desc: 'FM transmitter with USB charging', specs: { Type: 'FM Transmitter', USB: 'Yes' }, tags: ['fm transmitter','bluetooth','car','usb'] },
          { name: 'Car Phone Mount Magnetic', brand: 'SmartDrive', price: 249, compareAt: 349, desc: 'Magnetic dashboard phone mount', specs: { Type: 'Magnetic', Mount: 'Dashboard' }, tags: ['phone mount','magnetic','car','dashboard'] },
          { name: 'Car Charger Dual USB 36W', brand: 'PowerDrive', price: 299, desc: 'Fast charge dual USB car charger', specs: { Power: '36W', Ports: '2' }, tags: ['car charger','usb','36w','dual'] },
          { name: 'Reverse Parking Camera', brand: 'RoadPro', price: 1499, compareAt: 1999, desc: 'Waterproof rear view camera', specs: { Type: 'Reverse Camera', Water: 'IP67' }, tags: ['parking camera','reverse','waterproof'] },
          { name: 'Car Stereo Bluetooth', brand: 'CarAudio', price: 2499, desc: 'Bluetooth car stereo with USB', specs: { Type: 'Stereo', Bluetooth: 'Yes', USB: 'Yes' }, tags: ['car stereo','bluetooth','music'] },
          { name: 'OBD2 Scanner Tool', brand: 'DriveTech', price: 1999, compareAt: 2799, desc: 'Car diagnostic code reader', specs: { Type: 'OBD2 Scanner', Display: 'LCD' }, tags: ['obd2','scanner','diagnostic','car'] },
          { name: 'Car LED Headlight Bulbs', brand: 'PowerDrive', price: 899, desc: 'LED headlight conversion bulbs H4', specs: { Type: 'LED', Model: 'H4', Lumens: '12000' }, tags: ['headlight','led','h4','car'] },
          { name: 'Car Voltage Meter USB', brand: 'AutoConnect', price: 199, desc: 'Voltage display USB charger', specs: { Type: 'Voltage+USB', Display: 'Yes' }, tags: ['voltage meter','usb','car','display'] },
          { name: 'Wireless CarPlay Adapter', brand: 'SmartDrive', price: 4999, compareAt: 6999, desc: 'Convert wired CarPlay to wireless', specs: { Type: 'CarPlay Adapter', Wireless: 'Yes' }, tags: ['carplay','wireless','adapter','car'] },
        ],
      },
    ],
  },
  // ===== 12. PET SUPPLIES =====
  {
    name: 'Pet Supplies', slug: 'pet-supplies', emoji: '🐾',
    subcategories: [
      {
        name: 'Pet Food', slug: 'pet-food', emoji: '🦴', imageQuery: 'pet food dog cat product photo',
        brands: ['PetNutri', 'HappyPaw', 'Whiskers', 'BarkBite', 'MeowMeal', 'FurFriend'],
        products: [
          { name: 'Dry Dog Food 3kg - Chicken', brand: 'PetNutri', price: 999, compareAt: 1299, desc: 'Adult dog food chicken flavor', specs: { Weight: '3kg', Flavor: 'Chicken', Pet: 'Dog' }, tags: ['dog food','3kg','chicken','pet'] },
          { name: 'Cat Food 1kg - Ocean Fish', brand: 'Whiskers', price: 449, desc: 'Adult cat food ocean fish', specs: { Weight: '1kg', Flavor: 'Fish', Pet: 'Cat' }, tags: ['cat food','1kg','fish','pet'] },
          { name: 'Puppy Food 2kg', brand: 'BarkBite', price: 599, compareAt: 799, desc: 'Puppy growth formula', specs: { Weight: '2kg', Pet: 'Puppy' }, tags: ['puppy food','2kg','pet'] },
          { name: 'Kitten Food 1kg', brand: 'MeowMeal', price: 399, desc: 'Kitten growth formula', specs: { Weight: '1kg', Pet: 'Kitten' }, tags: ['kitten food','1kg','pet'] },
          { name: 'Dog Treats 500g', brand: 'HappyPaw', price: 249, desc: 'Training treats for dogs', specs: { Weight: '500g', Type: 'Treats' }, tags: ['dog treats','500g','training'] },
          { name: 'Cat Treats 100g', brand: 'Whiskers', price: 99, compareAt: 149, desc: 'Crunchy cat treats', specs: { Weight: '100g', Type: 'Treats' }, tags: ['cat treats','100g'] },
          { name: 'Wet Dog Food 400g', brand: 'FurFriend', price: 79, desc: 'Canned wet dog food', specs: { Weight: '400g', Type: 'Wet' }, tags: ['dog food','wet','400g','canned'] },
          { name: 'Senior Dog Food 3kg', brand: 'PetNutri', price: 1099, compareAt: 1399, desc: 'Senior dog joint care formula', specs: { Weight: '3kg', Pet: 'Senior Dog' }, tags: ['dog food','senior','3kg','joint care'] },
          { name: 'Bird Food 1kg', brand: 'HappyPaw', price: 149, desc: 'Mixed seed bird food', specs: { Weight: '1kg', Pet: 'Bird' }, tags: ['bird food','1kg','seeds'] },
          { name: 'Fish Food 200g', brand: 'MeowMeal', price: 99, desc: 'Aquarium fish food flakes', specs: { Weight: '200g', Pet: 'Fish' }, tags: ['fish food','200g','flakes','aquarium'] },
        ],
      },
      {
        name: 'Pet Accessories', slug: 'pet-accessories', emoji: '🦮', imageQuery: 'pet accessories collar leash toy product photo',
        brands: ['PetGear', 'WalkWell', 'PawStyle', 'ComfortPet', 'PlayPaw', 'SafePet'],
        products: [
          { name: 'Dog Leash 5ft Adjustable', brand: 'WalkWell', price: 299, compareAt: 449, desc: 'Nylon dog leash with padded handle', specs: { Length: '5ft', Material: 'Nylon' }, tags: ['leash','dog','5ft','nylon'] },
          { name: 'Dog Collar with Bell', brand: 'PawStyle', price: 199, desc: 'Adjustable collar with ID tag', specs: { Type: 'Collar', Adjustable: 'Yes' }, tags: ['collar','dog','bell','id tag'] },
          { name: 'Pet Bed Medium', brand: 'ComfortPet', price: 999, compareAt: 1499, desc: 'Soft cushioned pet bed', specs: { Size: 'Medium', Material: 'Plush' }, tags: ['pet bed','medium','cushion','plush'] },
          { name: 'Dog Chew Toy', brand: 'PlayPaw', price: 149, desc: 'Durable rubber chew toy', specs: { Type: 'Toy', Material: 'Rubber' }, tags: ['toy','chew','dog','rubber'] },
          { name: 'Cat Scratching Post', brand: 'PawStyle', price: 799, compareAt: 1099, desc: 'Sisal cat scratching post 60cm', specs: { Height: '60cm', Material: 'Sisal' }, tags: ['scratching post','cat','60cm','sisal'] },
          { name: 'Pet Carrier Bag', brand: 'SafePet', price: 1299, desc: 'Ventilated pet carrier for travel', specs: { Type: 'Carrier', Ventilated: 'Yes' }, tags: ['carrier','pet','travel','ventilated'] },
          { name: 'Dog Bowl Stainless Steel', brand: 'PetGear', price: 199, desc: 'Non-slip stainless steel bowl', specs: { Type: 'Bowl', Material: 'Stainless Steel' }, tags: ['bowl','dog','stainless steel'] },
          { name: 'Cat Litter Tray', brand: 'ComfortPet', price: 499, compareAt: 699, desc: 'Large cat litter tray', specs: { Type: 'Litter Tray', Size: 'Large' }, tags: ['litter tray','cat','large'] },
          { name: 'Pet Grooming Brush', brand: 'WalkWell', price: 179, desc: 'Self-cleaning slicker brush', specs: { Type: 'Brush', Self: 'Cleaning' }, tags: ['brush','grooming','pet','self-cleaning'] },
          { name: 'Dog Raincoat', brand: 'SafePet', price: 399, compareAt: 549, desc: 'Waterproof dog raincoat', specs: { Type: 'Raincoat', Water: 'Yes' }, tags: ['raincoat','dog','waterproof'] },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Main seeding function
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Expanding catalog...')
  let totalProducts = 0
  let totalCategories = 0
  let totalSubcategories = 0

  for (const catDef of CATALOG) {
    // Create or find top-level category
    let category = await db.category.findUnique({ where: { slug: catDef.slug } })
    if (!category) {
      // Use image from subcategory-images.json if available, otherwise emoji
      const catImage = (imageMap as any)[catDef.slug]
      category = await db.category.create({
        data: { name: catDef.name, slug: catDef.slug, imageUrl: catImage || catDef.emoji, description: `${catDef.name} category` },
      })
      totalCategories++
    }
    const categoryId = category.id

    // Create brands for this category (deduplicated)
    const allBrands = new Set<string>()
    for (const sub of catDef.subcategories) {
      for (const p of sub.products) allBrands.add(p.brand)
    }
    const brandMap = new Map<string, string>()
    for (const brandName of allBrands) {
      const slug = slugify(brandName)
      let brand = await db.brand.findUnique({ where: { slug } })
      if (!brand) {
        brand = await db.brand.create({ data: { name: brandName, slug } })
      }
      brandMap.set(brandName, brand.id)
    }

    // Create subcategories and products
    for (const subDef of catDef.subcategories) {
      let subcategory = await db.category.findUnique({ where: { slug: subDef.slug } })
      if (!subcategory) {
        const subImage = (imageMap as any)[subDef.slug]
        subcategory = await db.category.create({
          data: { name: subDef.name, slug: subDef.slug, parentId: categoryId, description: subDef.name, imageUrl: subImage || subDef.emoji },
        })
        totalSubcategories++
      }
      const subId = subcategory.id

      // Check how many products already exist in this subcategory
      const existingCount = await db.product.count({ where: { categoryId: subId } })
      const needed = Math.max(0, 10 - existingCount)
      if (needed === 0) {
        totalProducts += existingCount
        continue
      }

      // Create products
      for (let i = 0; i < Math.min(needed, subDef.products.length); i++) {
        const p = subDef.products[i]
        const brandId = brandMap.get(p.brand)!
        const subImage = (imageMap as any)[subDef.slug]
        const productData = makeProduct(
          p.name,
          p.brand,
          p.price,
          p.compareAt,
          p.desc,
          p.desc + '. Premium quality product with manufacturer warranty. Shop with confidence on Buywise.',
          p.tags,
          p.specs,
          subDef.emoji,
          subImage,
          i,
        )
        await db.product.create({
          data: {
            slug: slugify(p.name) + '-' + Math.random().toString(36).slice(2, 6),
            brandId,
            categoryId: subId,
            ...productData,
          },
        })
        totalProducts++
      }
      console.log(`  ✅ ${catDef.name} → ${subDef.name}: ${Math.min(needed, subDef.products.length)} products added`)
    }
  }

  const finalTotal = await db.product.count()
  const finalCats = await db.category.count()
  const finalBrands = await db.brand.count()
  console.log(`\n✅ Catalog expanded!`)
  console.log(`   Categories: ${finalCats}`)
  console.log(`   Brands: ${finalBrands}`)
  console.log(`   Products: ${finalTotal}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
