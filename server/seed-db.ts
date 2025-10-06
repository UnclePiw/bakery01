import { db } from "./db";
import * as schema from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  const branches = [
    { id: "3510", name: "ชายหาดกมลา 1", location: null },
    { id: "18469", name: "ราไวย์บีช", location: null },
    { id: "18504", name: "ตลาดนัดสามกอง", location: null },
    { id: "8732", name: "ราชพฤกษ์ (บางพลับ)", location: null },
    { id: "15757", name: "The Bliss South Beach Patong", location: null },
    { id: "9146", name: "หมู่บ้านพนาสนธิ์", location: null },
    { id: "9922", name: "ศรีสุดา", location: null },
    { id: "14555", name: "KARON AVENUE", location: null },
    { id: "9641", name: "หมู่บ้านฉลองสุข", location: null },
    { id: "13391", name: "ถนนเสน่หานุสรณ์", location: null },
  ];

  console.log("📍 Seeding branches...");
  for (const branch of branches) {
    await db.insert(schema.branches).values(branch).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${branches.length} branches`);

  const products = [
    { name: "ครัวซองต์", imageUrl: null, shelfLifeHours: 8 },
    { name: "เดนิช", imageUrl: null, shelfLifeHours: 12 },
    { name: "บัตเตอร์เค้ก", imageUrl: null, shelfLifeHours: 24 },
    { name: "โดนัท", imageUrl: null, shelfLifeHours: 16 },
    { name: "คุกกี้เนย", imageUrl: null, shelfLifeHours: 72 },
    { name: "มัฟฟิน", imageUrl: null, shelfLifeHours: 12 },
    { name: "เค้กไข่ไต้หวัน", imageUrl: null, shelfLifeHours: 10 },
    { name: "ขนมปังปอนด์", imageUrl: null, shelfLifeHours: 48 },
  ];

  console.log("🍞 Seeding bakery products...");
  for (const product of products) {
    await db.insert(schema.bakeryProducts).values(product).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${products.length} bakery products`);

  const ingredients = [
    { name: "แป้งขนมปัง", unit: "กก.", imageUrl: null },
    { name: "นมสด", unit: "ลิตร", imageUrl: null },
    { name: "เนยสด", unit: "กก.", imageUrl: null },
    { name: "ไข่ไก่", unit: "ฟอง", imageUrl: null },
    { name: "น้ำตาล", unit: "กก.", imageUrl: null },
    { name: "เกลือ", unit: "กรัม", imageUrl: null },
  ];

  console.log("🥚 Seeding ingredients...");
  for (const ingredient of ingredients) {
    await db.insert(schema.ingredients).values(ingredient).onConflictDoNothing();
  }
  console.log(`✅ Seeded ${ingredients.length} ingredients`);

  console.log("✨ Database seeding complete!");
}

seedDatabase()
  .then(() => {
    console.log("🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
