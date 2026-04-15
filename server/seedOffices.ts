import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { Office } from "./src/models/Office.js";

const data = JSON.parse(
  readFileSync(new URL("./tamilnadu_offices_60.json", import.meta.url), "utf-8")
);

const originalOffices = [
  { name: "Chennai e-Sevai Center", address: "Teynampet, Chennai", latitude: 13.0418, longitude: 80.2472 },
  { name: "Anna Nagar Taluk Office", address: "Anna Nagar, Chennai", latitude: 13.0867, longitude: 80.2101 },
  { name: "Velachery e-District Office", address: "Velachery, Chennai", latitude: 12.9807, longitude: 80.2209 },
  { name: "Guindy Citizen Service Center", address: "Guindy, Chennai", latitude: 13.0067, longitude: 80.2206 },
  { name: "Tambaram Taluk Office", address: "Tambaram, Chennai", latitude: 12.9249, longitude: 80.1275 },
].map((o) => ({
  ...o,
  workingHours: "Mon-Sat 10:00 AM - 5:30 PM",
  servicesOffered: ["Certificates", "Scheme Assistance", "Application Tracking"],
}));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("Connected to MongoDB");

  const deleted = await Office.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing offices`);

  const newDocs = data.map((o: any) => ({
    name:            o.name,
    address:         o.address,
    latitude:        o.latitude,
    longitude:       o.longitude,
    workingHours:    o.working_hours,
    servicesOffered: o.services_offered,
  }));

  const allDocs = [...originalOffices, ...newDocs];
  const inserted = await Office.insertMany(allDocs, { ordered: false });
  console.log(`✅ Inserted ${inserted.length} offices (5 original + ${inserted.length - 5} new)`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
