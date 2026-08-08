/**
 * patch-all-images.js
 *
 * Queries the actual slugs from DB and patches images on ALL 30 products
 * using a category-based image mapping that doesn't rely on exact slugs.
 *
 * Run with: node patch-all-images.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const Schema = new mongoose.Schema({}, { strict: false });

// ── Category-based image pools ───────────────────────────────────────
const IMAGE_POOLS = {
  "Sneakers": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1588099956-23e35bea87f7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1556906781-9a412961a28b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1613987549117-e25cffe2ba44?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1551107696-a4b0c1a47745?auto=format&fit=crop&w=600&q=80",
  ],
  "Formal Shoes": [
    "https://images.unsplash.com/photo-1582588477-d9a6c68d3f07?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1573100925118-870b8efc799d?auto=format&fit=crop&w=600&q=80",
  ],
  "Heels & Sandals": [
    "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1584735175-a10e46f08f1b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80",
  ],
  "Boots": [
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1582588477-d9a6c68d3f07?auto=format&fit=crop&w=600&q=80",
  ],
  "Loafers": [
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1573100925118-870b8efc799d?auto=format&fit=crop&w=600&q=80",
  ],
  "Slides & Slippers": [
    "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80",
  ],
  "Flats": [
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
  ],
  "Sport & Athletic": [
    "https://images.unsplash.com/photo-1551107696-a4b0c1a47745?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80",
  ],
  "Casual Shoes": [
    "https://images.unsplash.com/photo-1573100925118-870b8efc799d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=600&q=80",
  ],
  "Traditional & Cultural": [
    "https://images.unsplash.com/photo-1573100925118-870b8efc799d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
  ],
  "Kids' Shoes": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80",
  ],
  "Accessories": [
    "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=600&q=80",
  ],
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80",
];

function getImagesForProduct(product, index) {
  const pool = IMAGE_POOLS[product.category] || FALLBACK_IMAGES;
  // Pick 2 images cycling through the pool using index for variety
  const i1 = index % pool.length;
  const i2 = (index + 1) % pool.length;
  return [
    { url: pool[i1], publicId: `seed/${product.slug || "product"}-1` },
    { url: pool[i2], publicId: `seed/${product.slug || "product"}-2` },
  ];
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const SellerProfile = mongoose.models.SellerProfile || mongoose.model("SellerProfile", new mongoose.Schema({}, { strict: false }));
  const SellerProduct  = mongoose.models.SellerProduct  || mongoose.model("SellerProduct",  Schema);

  const profile = await SellerProfile.findOne({ slug: "jayempire-store" }).lean();
  if (!profile) {
    console.error("❌ Could not find 'jayempire-store' seller profile.");
    process.exit(1);
  }
  console.log(`🏪 Patching images for: "${profile.businessName}" (ID: ${profile._id})\n`);

  // Fetch ALL products for this seller
  const products = await SellerProduct.find({ sellerId: profile._id }).lean();
  console.log(`📦 Found ${products.length} products in this store.\n`);

  let updated = 0;
  let alreadyHasImages = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Skip if already has real images (don't overwrite existing ones)
    if (product.images && product.images.length > 0 && product.images[0]?.url) {
      console.log(`  ✅ Already has image: ${product.name}`);
      alreadyHasImages++;
      continue;
    }

    const images = getImagesForProduct(product, i);
    await SellerProduct.updateOne(
      { _id: product._id },
      { $set: { images } }
    );
    console.log(`  🖼️  Added images (${product.category}): ${product.name}`);
    updated++;
  }

  console.log(`\n🎉 Done!`);
  console.log(`   🖼️  Newly imaged: ${updated}`);
  console.log(`   ✅ Already had images: ${alreadyHasImages}`);
  console.log(`   📦 Total products: ${products.length}`);
  console.log(`\n🔗 Visit: https://pax26.com/store/jayempire-store`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("💥 Error:", err.message);
  process.exit(1);
});
