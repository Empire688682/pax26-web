/**
 * fix-seed-products.js
 *
 * Finds the "jayempire-store" seller profile and re-seeds all 30 products
 * into the correct seller profile. Also removes any wrongly-placed products
 * from the incorrect profile.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const SellerProductSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "SellerProfile", required: true },
    name: { type: String, required: true },
    slug: String,
    price: { type: Number, required: true },
    comparePrice: Number,
    description: String,
    category: String,
    tags: [String],
    stock: { type: Number, default: 50 },
    isAvailable: { type: Boolean, default: true },
    deliveryFee: Number,
    deliveryTimeFrame: String,
    locationNotes: String,
    isPhysical: { type: Boolean, default: true },
    images: [],
    variants: [],
    sku: String,
  },
  { timestamps: true }
);

const SellerProfileSchema = new mongoose.Schema({}, { strict: false });

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const PRODUCTS = [
  {
    name: "Classic White Sneakers",
    price: 28000, comparePrice: 35000,
    description: "Clean, minimalist white sneakers — perfect for everyday wear. Lightweight sole with padded insole for all-day comfort.",
    category: "Sneakers", tags: ["sneakers", "white", "casual", "unisex"],
    deliveryFee: 2000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"}] }]
  },
  {
    name: "Black Oxford Shoes",
    price: 42000, comparePrice: 50000,
    description: "Formal black Oxford shoes crafted from premium faux leather. Cap-toe design with a sleek rubber sole — ideal for office and events.",
    category: "Formal Shoes", tags: ["oxford", "black", "formal", "leather"],
    deliveryFee: 2000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] }]
  },
  {
    name: "Nike Air Force 1 (Grade A)",
    price: 38000, comparePrice: 45000,
    description: "High-quality Grade A Nike Air Force 1 replicas. Thick rubber sole, Air unit cushioning, and durable canvas upper. Unisex sizing.",
    category: "Sneakers", tags: ["nike", "air force", "sneakers", "white"],
    deliveryFee: 2000, deliveryTimeFrame: "1-2 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"}] }]
  },
  {
    name: "Women's Block Heel Sandal",
    price: 22000,
    description: "Elegant block heel sandals with adjustable ankle strap. Padded footbed for comfort. Available in black, nude, and red.",
    category: "Heels & Sandals", tags: ["heels", "sandals", "women", "block heel"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"Nude"},{value:"Red"}] }
    ]
  },
  {
    name: "Men's Suede Loafers",
    price: 35000,
    description: "Premium suede loafers with a moccasin stitch detail. Slip-on design, rubber sole with anti-slip grip. Brown and navy options.",
    category: "Loafers", tags: ["loafers", "suede", "slip-on", "men", "casual"],
    deliveryFee: 2000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Brown"},{value:"Navy"}] }
    ]
  },
  {
    name: "High-Top Canvas Sneakers",
    price: 18500,
    description: "Retro high-top canvas sneakers with vulcanised rubber sole. Lace-up design with padded ankle collar. Great for casual street style.",
    category: "Sneakers", tags: ["canvas", "high-top", "casual", "unisex"],
    deliveryFee: 1500, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"}] },
      { label: "Color", options: [{value:"Black"},{value:"White"},{value:"Red"},{value:"Navy"}] }
    ]
  },
  {
    name: "Adidas Superstar (Grade A)",
    price: 36000, comparePrice: 43000,
    description: "Iconic shell-toe Adidas Superstar in Grade A quality. Leather-look upper with signature 3-stripe branding. Unisex.",
    category: "Sneakers", tags: ["adidas", "superstar", "shell toe", "classic"],
    deliveryFee: 2000, deliveryTimeFrame: "1-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"}] }]
  },
  {
    name: "Women's Pointed Toe Pumps",
    price: 27000,
    description: "Classic pointed-toe pumps with a 9cm stiletto heel. Patent leather finish, cushioned insole. Perfect for formal events.",
    category: "Heels & Sandals", tags: ["pumps", "heels", "women", "formal"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"Nude"},{value:"White"}] }
    ]
  },
  {
    name: "Leather Chelsea Boots",
    price: 52000, comparePrice: 63000,
    description: "Genuine-look leather Chelsea boots with elastic side panels for easy on/off. Stacked heel and almond toe. Unisex styling.",
    category: "Boots", tags: ["boots", "chelsea", "leather", "ankle"],
    deliveryFee: 2500, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Black"},{value:"Tan"}] }
    ]
  },
  {
    name: "Men's Sport Running Shoes",
    price: 32000,
    description: "Breathable mesh running shoes with EVA foam midsole and anti-slip rubber outsole. Reflective detail for night safety.",
    category: "Sport & Athletic", tags: ["running", "sport", "athletic", "gym"],
    deliveryFee: 2000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Black/White"},{value:"Blue/White"},{value:"Grey/Red"}] }
    ]
  },
  {
    name: "Platform Chunky Sandals",
    price: 24500,
    description: "Trendy chunky-platform sandals with thick 5cm sole. Adjustable buckle straps, non-slip bottom.",
    category: "Heels & Sandals", tags: ["platform", "chunky", "sandals", "trendy", "women"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"White"},{value:"Brown"}] }
    ]
  },
  {
    name: "Jordan 1 Retro High (Grade A)",
    price: 55000, comparePrice: 70000,
    description: "Premium Grade A Jordan 1 Retro High. Full leather upper, air sole unit, and stitched Nike Swoosh.",
    category: "Sneakers", tags: ["jordan", "jordan 1", "retro", "basketball", "high-top"],
    deliveryFee: 2500, deliveryTimeFrame: "1-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Colorway", options: [{value:"Black Toe"},{value:"Bred"},{value:"Royal Blue"},{value:"Chicago"}] }
    ]
  },
  {
    name: "Women's Ankle Strap Wedges",
    price: 23000,
    description: "Elegant espadrille wedge sandals with braided jute-effect sole and secure ankle strap.",
    category: "Heels & Sandals", tags: ["wedges", "espadrille", "ankle strap", "women"],
    deliveryFee: 1500, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Beige"},{value:"Black"},{value:"Tan"}] }
    ]
  },
  {
    name: "Men's Lace-Up Brogues",
    price: 39000,
    description: "Classic leather brogue shoes with decorative perforations and wingtip detailing. Smart casual to formal.",
    category: "Formal Shoes", tags: ["brogues", "wingtip", "formal", "men", "leather"],
    deliveryFee: 2000, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Brown"},{value:"Black"},{value:"Tan"}] }
    ]
  },
  {
    name: "Unisex Slides / Slippers",
    price: 9500,
    description: "Comfortable EVA foam slides with wide adjustable strap. Ultra-lightweight, waterproof, non-slip sole.",
    category: "Slides & Slippers", tags: ["slides", "slippers", "unisex", "beach", "pool"],
    deliveryFee: 1000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36-37"},{value:"38-39"},{value:"40-41"},{value:"42-43"},{value:"44-45"}] },
      { label: "Color", options: [{value:"Black"},{value:"White"},{value:"Grey"},{value:"Red"}] }
    ]
  },
  {
    name: "Women's Ballet Flats",
    price: 16500,
    description: "Soft, flexible ballet flats with elastic trim and cushioned footbed. Foldable sole makes them easy to pack.",
    category: "Flats", tags: ["flats", "ballet", "women", "casual", "comfortable"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"Nude"},{value:"Red"},{value:"White"}] }
    ]
  },
  {
    name: "Puma RS-X (Grade A)",
    price: 34000, comparePrice: 42000,
    description: "Puma RS-X chunky retro sneakers in Grade A quality. Thick multi-layered sole, mesh/synthetic upper.",
    category: "Sneakers", tags: ["puma", "rs-x", "chunky", "retro", "sneakers"],
    deliveryFee: 2000, deliveryTimeFrame: "1-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"}] }]
  },
  {
    name: "Men's Casual Derby Shoes",
    price: 31000,
    description: "Versatile Derby shoes in smooth matte finish. Open lacing system, padded collar, lightweight rubber sole.",
    category: "Formal Shoes", tags: ["derby", "casual", "men", "lace-up"],
    deliveryFee: 2000, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Black"},{value:"Dark Brown"},{value:"Tan"}] }
    ]
  },
  {
    name: "Women's Knee-High Boots",
    price: 48000, comparePrice: 58000,
    description: "Sleek knee-high boots with inside zip closure and 5cm block heel. Faux suede upper, non-slip outsole.",
    category: "Boots", tags: ["boots", "knee-high", "suede", "women", "block heel"],
    deliveryFee: 2500, deliveryTimeFrame: "3-5 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"Brown"},{value:"Camel"}] }
    ]
  },
  {
    name: "Men's Flip Flops (Premium)",
    price: 7500,
    description: "Durable rubber flip flops with contoured footbed and arch support. Anti-slip sole.",
    category: "Slides & Slippers", tags: ["flip flops", "thongs", "beach", "casual"],
    deliveryFee: 1000, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Black"},{value:"Brown"},{value:"Navy"}] }
    ]
  },
  {
    name: "New Balance 574 (Grade A)",
    price: 37500, comparePrice: 46000,
    description: "Grade A New Balance 574 in classic suede/mesh combo. ENCAP midsole cushioning with a durable rubber outsole.",
    category: "Sneakers", tags: ["new balance", "nb574", "retro", "heritage", "unisex"],
    deliveryFee: 2000, deliveryTimeFrame: "1-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"}] }]
  },
  {
    name: "Women's Mule Heels",
    price: 21500,
    description: "Chic backless mule heels with open toe and low 6cm heel. Slip-on style, cushioned insole.",
    category: "Heels & Sandals", tags: ["mules", "backless", "heels", "women", "open toe"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Black"},{value:"White"},{value:"Nude"},{value:"Gold"}] }
    ]
  },
  {
    name: "Timberland 6-Inch Boot (Grade A)",
    price: 62000, comparePrice: 78000,
    description: "Premium Grade A Timberland 6-inch premium waterproof boot. Nubuck leather upper, seam-sealed construction, lug sole.",
    category: "Boots", tags: ["timberland", "boot", "waterproof", "work boot", "outdoor"],
    deliveryFee: 2500, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"39"},{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"},{value:"46"}] },
      { label: "Color", options: [{value:"Wheat"},{value:"Black"}] }
    ]
  },
  {
    name: "Men's Kaftan Slippers (Nigerian Style)",
    price: 12000,
    description: "Handcrafted Nigerian-style leather kaftan slippers with intricate embroidery. Perfect for traditional events.",
    category: "Traditional & Cultural", tags: ["kaftan", "slipper", "traditional", "nigerian", "eid", "leather"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"White"},{value:"Brown"},{value:"Gold"}] }
    ]
  },
  {
    name: "Women's Transparent Heels",
    price: 26000,
    description: "Trendy perspex transparent stiletto heels with clear acrylic upper. Ankle strap with gold-tone buckle.",
    category: "Heels & Sandals", tags: ["transparent", "perspex", "clear heels", "stiletto", "party"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] }]
  },
  {
    name: "Men's Boat Shoes",
    price: 29500,
    description: "Classic leather boat shoes with hand-sewn moccasin construction and 360° lacing. Rubber non-marking sole.",
    category: "Casual Shoes", tags: ["boat shoes", "deck shoes", "moccasin", "casual", "summer"],
    deliveryFee: 2000, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Tan"},{value:"Navy"},{value:"Brown"}] }
    ]
  },
  {
    name: "Women's Espadrille Flatforms",
    price: 19500,
    description: "Casual espadrille flatform shoes with canvas upper and thick jute-rope sole. Lace-up wrap-around ankle ribbon closure.",
    category: "Casual Shoes", tags: ["espadrille", "flatform", "canvas", "summer", "women"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"36"},{value:"37"},{value:"38"},{value:"39"},{value:"40"},{value:"41"}] },
      { label: "Color", options: [{value:"Natural/White"},{value:"Black"},{value:"Navy"}] }
    ]
  },
  {
    name: "Kids' School Shoes (Unisex)",
    price: 13500,
    description: "Durable unisex school shoes with adjustable velcro strap. Anti-scuff toe cap, flexible rubber sole.",
    category: "Kids' Shoes", tags: ["kids", "school shoes", "children", "velcro", "black"],
    deliveryFee: 1500, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    variants: [{ label: "Size (UK)", options: [{value:"UK 1"},{value:"UK 2"},{value:"UK 3"},{value:"UK 4"},{value:"UK 5"}] }]
  },
  {
    name: "Men's Monk Strap Shoes",
    price: 43500,
    description: "Single-buckle monk strap shoes in polished leather. Almond toe, leather sole with rubber heel tap.",
    category: "Formal Shoes", tags: ["monk strap", "buckle", "formal", "men", "leather"],
    deliveryFee: 2000, deliveryTimeFrame: "2-4 days", locationNotes: "Nationwide delivery",
    variants: [
      { label: "Size", options: [{value:"40"},{value:"41"},{value:"42"},{value:"43"},{value:"44"},{value:"45"}] },
      { label: "Color", options: [{value:"Black"},{value:"Dark Brown"},{value:"Cognac"}] }
    ]
  },
  {
    name: "Unisex Patterned Socks (Pack of 3)",
    price: 4500,
    description: "Set of 3 pairs of fun patterned cotton-blend socks. Reinforced heel and toe, elastic band top.",
    category: "Accessories", tags: ["socks", "accessories", "unisex", "pack", "patterned"],
    deliveryFee: 800, deliveryTimeFrame: "2-3 days", locationNotes: "Nationwide delivery",
    stock: 200,
    variants: [{ label: "Size", options: [{value:"36-39"},{value:"40-44"}] }]
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const SellerProfile = mongoose.models.SellerProfile || mongoose.model("SellerProfile", SellerProfileSchema);
  const SellerProduct = mongoose.models.SellerProduct || mongoose.model("SellerProduct", SellerProductSchema);

  // ── Step 1: List ALL seller profiles so user can see which is correct ──
  const allProfiles = await SellerProfile.find({}).lean();
  console.log(`📋 Found ${allProfiles.length} seller profile(s):\n`);
  allProfiles.forEach((p, i) => {
    console.log(`  [${i}] ID: ${p._id} | businessName: ${p.businessName} | slug: ${p.slug}`);
  });

  // ── Step 2: Find by slug "jayempire-store" ──────────────────────────
  const correctProfile = allProfiles.find(p => p.slug === "jayempire-store");
  if (!correctProfile) {
    console.error("\n❌ Could not find a seller profile with slug 'jayempire-store'.");
    console.error("   Please check the slugs listed above and run:");
    console.error("   node fix-seed-products.js <slug>");
    process.exit(1);
  }

  console.log(`\n✅ Target profile: "${correctProfile.businessName}" (slug: ${correctProfile.slug}, ID: ${correctProfile._id})\n`);

  // ── Step 3: Delete wrongly-seeded products from other profiles ──────
  const wrongProfileIds = allProfiles
    .filter(p => p._id.toString() !== correctProfile._id.toString())
    .map(p => p._id);

  if (wrongProfileIds.length > 0) {
    const seedSlugs = PRODUCTS.map(p => slugify(p.name));
    const deleted = await SellerProduct.deleteMany({
      sellerId: { $in: wrongProfileIds },
      slug: { $in: seedSlugs },
    });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} wrongly-placed product(s) from other profiles.\n`);
    }
  }

  // ── Step 4: Seed into correct profile ──────────────────────────────
  let created = 0;
  let skipped = 0;

  for (const productData of PRODUCTS) {
    const slug = slugify(productData.name);
    const exists = await SellerProduct.findOne({ sellerId: correctProfile._id, slug });

    if (exists) {
      console.log(`  ⏭️  Skipped (already exists): ${productData.name}`);
      skipped++;
      continue;
    }

    await SellerProduct.create({
      sellerId: correctProfile._id,
      slug,
      stock: productData.stock ?? 50,
      isAvailable: true,
      isPhysical: true,
      images: [],
      ...productData,
    });

    console.log(`  ✅ Created: ${productData.name} — ₦${productData.price.toLocaleString()}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created} | Skipped (already existed): ${skipped} | Total: ${PRODUCTS.length}`);
  console.log(`\n🔗 Visit your storefront: https://pax26.com/store/jayempire-store`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});
