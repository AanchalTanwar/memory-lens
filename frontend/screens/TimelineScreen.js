// ============================================================
// screens/TimelineScreen.js
// Scrollable daily timeline with event cards
// ============================================================

import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";

const API_BASE = "http://localhost:3000";

// Gradient-like pastel backgrounds cycled across cards
const CARD_COLORS = [
  "#E8F4FD", // light blue
  "#EDE8FF", // soft purple
  "#E8FFEF", // mint green
  "#FFF3E8", // peach
  "#FFE8F0", // pink
  "#E8FAFF", // sky
  "#F0FFE8", // light lime
];

export default function TimelineScreen({ navigation }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res  = await fetch(`${API_BASE}/get-summary`);
      const json = await res.json();
      setData(json);
    } catch {
      // Offline fallback
      setData({
        date: "Today",
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadData();
  }

  // Normalise events – API may return strings or objects
  function normaliseEvent(ev, idx) {
    if (typeof ev === "string") {
      const [time, ...rest] = ev.split("–");
      return { time: time?.trim(), description: rest.join("–").trim(), icon: "📌" };
    }
    return ev;
  }

  return (
    <View style={styles.container}>

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Today's Timeline</Text>
          <Text style={styles.headerSub}>{data?.date ?? "..."}</Text>
        </View>
        <Text style={styles.calIcon}>📅</Text>
      </View>

      {/* ── Location Banner ────────────────────────────── */}
      {data?.location && (
        <View style={styles.locationBanner}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{data.location}</Text>
        </View>
      )}

      {/* ── Events List ────────────────────────────────── */}
      {loading ? (
        <ActivityIndicator
          size="large" color="#7B8CDE"
          style={{ marginTop: 60 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7B8CDE" />
          }
        >
          {data?.events?.map((ev, idx) => {
            const event = normaliseEvent(ev, idx);
            const bgColor = CARD_COLORS[idx % CARD_COLORS.length];

            return (
              <View key={idx} style={styles.row}>
                {/* Timeline line + dot */}
                <View style={styles.timelineTrack}>
                  <View style={styles.dot} />
                  {idx < data.events.length - 1 && <View style={styles.line} />}
                </View>

                {/* Event card */}
                <View style={[styles.card, { backgroundColor: bgColor }]}>
                  <Text style={styles.cardEmoji}>{event.icon ?? "📌"}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTime}>{event.time}</Text>
                    <Text style={styles.cardDesc}>{event.description}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* End of day marker */}
          <View style={styles.endRow}>
            <View style={styles.timelineTrack}>
              <View style={[styles.dot, styles.dotEnd]} />
            </View>
            <Text style={styles.endLabel}>End of today's log</Text>
          </View>

          <Text style={styles.pullHint}>↑ Pull to refresh</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FF",
  },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20,
    backgroundColor: "#F4F6FF",
    gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center",
    shadowColor: "#7B8CDE", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  backBtnText: { fontSize: 22, color: "#2D3254", fontWeight: "700", lineHeight: 26 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#2D3254" },
  headerSub:   { fontSize: 13, color: "#9AA3C8", marginTop: 2 },
  calIcon:     { fontSize: 28 },

  // Location banner
  locationBanner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", marginHorizontal: 24, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24,
    shadowColor: "#7B8CDE", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    gap: 8,
  },
  locationIcon: { fontSize: 18 },
  locationText: { fontSize: 14, color: "#2D3254", fontWeight: "600", flex: 1 },

  // List
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },

  // Each row = track + card
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 16,
  },

  // Vertical timeline track (dot + line)
  timelineTrack: {
    width: 20, alignItems: "center",
    paddingTop: 18,
  },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#7B8CDE",
    zIndex: 1,
  },
  dotEnd: { backgroundColor: "#C2C8E8" },
  line: {
    width: 2, flex: 1, minHeight: 24,
    backgroundColor: "#D8DCFF",
    marginTop: 2,
  },

  // Event card
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#7B8CDE",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    gap: 12,
  },
  cardEmoji: { fontSize: 26 },
  cardTime: {
    fontSize: 12, fontWeight: "700", color: "#7B8CDE",
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
  },
  cardDesc: { fontSize: 15, fontWeight: "600", color: "#2D3254", lineHeight: 22 },

  // End marker
  endRow: {
    flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4,
  },
  endLabel: { fontSize: 13, color: "#C2C8E8", fontStyle: "italic" },

  pullHint: {
    textAlign: "center", color: "#D8DCFF",
    fontSize: 12, marginTop: 20,
  },
});
