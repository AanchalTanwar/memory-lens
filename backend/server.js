// ============================================================
// Memory Lens – Backend (server.js)
// Run: node server.js  →  http://localhost:3000
// ============================================================

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── 1. Face Recognition ──────────────────────────────────────
// In a real app this would call a face-recognition ML model.
// For the hackathon we return realistic mock data.
app.get("/recognize-face", (req, res) => {
  // Simulated database of recognised people
  const people = [
    { name: "Riya",   relation: "Daughter", lastSeen: "Today, 2:15 PM",  emoji: "👩" },
    { name: "Arjun",  relation: "Son",      lastSeen: "Yesterday, 6:00 PM", emoji: "👦" },
    { name: "Meena",  relation: "Wife",     lastSeen: "Today, 8:00 AM",  emoji: "👩‍🦳" },
    { name: "Dr. Sharma", relation: "Doctor", lastSeen: "Monday, 10:00 AM", emoji: "👨‍⚕️" },
  ];

  // Pick a random person to simulate recognition
  const person = people[Math.floor(Math.random() * people.length)];
  res.json({ success: true, person });
});

// ── 2. Daily Summary / Timeline ──────────────────────────────
app.get("/get-summary", (req, res) => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  res.json({
    success: true,
    date: today,
    location: "Home – Sector 15, Noida",
    events: [
      { time: "7:30 AM", icon: "🌅", description: "Woke up & had morning tea" },
      { time: "8:15 AM", icon: "💊", description: "Took morning medicines" },
      { time: "9:00 AM", icon: "🍳", description: "Had breakfast – poha & juice" },
      { time: "11:00 AM", icon: "🚶", description: "Morning walk in the garden" },
      { time: "2:15 PM", icon: "👩", description: "Met Riya – she brought sweets" },
      { time: "4:00 PM", icon: "📺", description: "Watched afternoon news" },
      { time: "6:30 PM", icon: "🍵", description: "Evening tea with Meena" },
    ],
  });
});

// ── 3. Emergency Alert ───────────────────────────────────────
app.post("/emergency", (req, res) => {
  const { location } = req.body;
  console.log("🚨 EMERGENCY triggered from:", location || "unknown location");

  // In production: call Twilio SMS API, push notification, etc.
  res.json({
    success: true,
    message: "Emergency alert sent to family members",
    notified: ["Riya – +91 98765 XXXXX", "Arjun – +91 87654 XXXXX"],
    timestamp: new Date().toLocaleTimeString(),
  });
});

// ── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "Memory Lens API is running 🧠" }));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n✅  Memory Lens backend running at http://localhost:${PORT}`);
  console.log("   Endpoints:");
  console.log("   GET  /recognize-face");
  console.log("   GET  /get-summary");
  console.log("   POST /emergency\n");
});
