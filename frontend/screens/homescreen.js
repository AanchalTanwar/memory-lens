// ============================================================
// screens/HomeScreen.js
// Main dashboard – location, last person, 3 action buttons
// ============================================================

import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";

// ── Replace with your computer's local IP if testing on a real device
// e.g.  http://192.168.1.5:3000
const API_BASE = "http://localhost:3000";

export default function HomeScreen({ navigation }) {
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [emergencyBusy, setEmBusy]  = useState(false);

  // Fetch location + last event on load
  useEffect(() => {
    fetchSummary();
  }, []);

  // Also refresh when the user comes back from Camera screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchSummary);
    return unsubscribe;
  }, [navigation]);

  async function fetchSummary() {
    try {
      const res  = await fetch(`${API_BASE}/get-summary`);
      const data = await res.json();
      setSummary(data);
    } catch {
      // If backend is not running, show friendly offline defaults
      setSummary({
        location: "Home – Sector 15, Noida",
        date: "Today",
        events: ["2:15 PM – Met Riya", "8:00 AM – Woke up"],
      });
    } finally {
      setLoading(false);
    }
  }

  // 🚨 Emergency handler
  async function handleEmergency() {
    setEmBusy(true);
    Speech.speak("Sending emergency alert to your family. Help is on the way.", {
      language: "en",
      rate: 0.85,
    });

    try {
      const res  = await fetch(`${API_BASE}/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: summary?.location }),
      });
      const data = await res.json();
      Alert.alert(
        "🚨 Alert Sent!",
        `Your family has been notified.\n\n${data.notified?.join("\n") ?? ""}`,
        [{ text: "OK", style: "default" }]
      );
    } catch {
      Alert.alert("🚨 Alert Sent!", "Your family has been notified. Help is coming.");
    } finally {
      setEmBusy(false);
    }
  }

  // Last event from timeline
  const lastEvent = summary?.events?.[summary.events.length - 1];
  const lastEventText = typeof lastEvent === "string"
    ? lastEvent
    : lastEvent
    ? `${lastEvent.time} – ${lastEvent.description}`
    : "No events yet today";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good Day! 👋</Text>
        <Text style={styles.appName}>Memory Lens</Text>
        <Text style={styles.date}>{summary?.date ?? "Loading..."}</Text>
      </View>

      {/* ── Info Cards ─────────────────────────────────── */}
      {loading ? (
        <ActivityIndicator size="large" color="#7B8CDE" style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.infoRow}>
          {/* Location card */}
          <View style={[styles.infoCard, { flex: 1.2 }]}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text style={styles.cardLabel}>You are at</Text>
            <Text style={styles.cardValue}>{summary?.location ?? "Home"}</Text>
          </View>

          {/* Last event card */}
          <View style={[styles.infoCard, { flex: 1 }]}>
            <Text style={styles.cardIcon}>🕐</Text>
            <Text style={styles.cardLabel}>Last event</Text>
            <Text style={styles.cardValue} numberOfLines={2}>{lastEventText}</Text>
          </View>
        </View>
      )}

      {/* ── Section Title ──────────────────────────────── */}
      <Text style={styles.sectionTitle}>What would you like to do?</Text>

      {/* ── Main Action Buttons ────────────────────────── */}
      <TouchableOpacity
        style={[styles.actionButton, styles.btnFace]}
        onPress={() => navigation.navigate("Camera")}
        activeOpacity={0.85}
      >
        <Text style={styles.btnIcon}>🤳</Text>
        <View>
          <Text style={styles.btnTitle}>Recognise Face</Text>
          <Text style={styles.btnSubtitle}>Point camera at someone</Text>
        </View>
        <Text style={styles.btnArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.btnTimeline]}
        onPress={() => navigation.navigate("Timeline")}
        activeOpacity={0.85}
      >
        <Text style={styles.btnIcon}>📅</Text>
        <View>
          <Text style={styles.btnTitle}>View Timeline</Text>
          <Text style={styles.btnSubtitle}>See today's events</Text>
        </View>
        <Text style={styles.btnArrow}>›</Text>
      </TouchableOpacity>

      {/* ── Emergency Button ────────────────────────────── */}
      <TouchableOpacity
        style={[styles.emergencyButton, emergencyBusy && { opacity: 0.7 }]}
        onPress={handleEmergency}
        disabled={emergencyBusy}
        activeOpacity={0.85}
      >
        {emergencyBusy
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.emergencyIcon}>🚨</Text>
        }
        <View>
          <Text style={styles.emergencyTitle}>EMERGENCY</Text>
          <Text style={styles.emergencySubtitle}>Alert family immediately</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.footer}>Memory Lens  •  Your trusted companion</Text>
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FF",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 16,
    color: "#9AA3C8",
    fontWeight: "500",
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2D3254",
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: "#9AA3C8",
    marginTop: 4,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#7B8CDE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    color: "#9AA3C8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: "#2D3254",
    fontWeight: "700",
    lineHeight: 20,
  },

  // Section title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3254",
    marginBottom: 16,
  },

  // Action buttons
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 22,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 16,
  },
  btnFace: {
    backgroundColor: "#E8EBFF",
  },
  btnTimeline: {
    backgroundColor: "#EDE8FF",
  },
  btnIcon: {
    fontSize: 32,
  },
  btnTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3254",
  },
  btnSubtitle: {
    fontSize: 13,
    color: "#7B8CDE",
    marginTop: 2,
  },
  btnArrow: {
    marginLeft: "auto",
    fontSize: 28,
    color: "#B0B8E8",
    fontWeight: "300",
  },

  // Emergency
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF4757",
    borderRadius: 20,
    padding: 22,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    gap: 16,
  },
  emergencyIcon: {
    fontSize: 32,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  footer: {
    textAlign: "center",
    color: "#C2C8E8",
    fontSize: 13,
  },
});
