// ============================================================
// screens/CameraScreen.js
// Simulated face recognition + TTS result card
// ============================================================

import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated, Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";

const API_BASE = "http://localhost:3000";
const { width } = Dimensions.get("window");

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning]   = useState(false);
  const [person, setPerson]       = useState(null);   // result from API
  const [error, setError]         = useState(null);

  // Animations
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing scan ring animation
  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [scanning]);

  // Slide-up animation when result arrives
  function showCard() {
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }

  function hideCard() {
    cardAnim.setValue(0);
    setPerson(null);
  }

  // ── Simulate pressing "Scan" ─────────────────────────────
  async function handleScan() {
    if (scanning) return;
    hideCard();
    setError(null);
    setScanning(true);

    // Small delay to mimic camera processing
    await new Promise((r) => setTimeout(r, 2200));

    try {
      const res  = await fetch(`${API_BASE}/recognize-face`);
      const data = await res.json();
      setPerson(data.person);
      setScanning(false);
      showCard();

      // Speak the result aloud (important for accessibility)
      Speech.speak(
        `This is ${data.person.name}, your ${data.person.relation}. Last seen ${data.person.lastSeen}.`,
        { language: "en", rate: 0.8, pitch: 1.0 }
      );
    } catch {
      setScanning(false);
      setError("Could not connect to server.\nShowing demo result.");

      // Demo fallback
      const demo = { name: "Riya", relation: "Daughter", lastSeen: "Today, 2:15 PM", emoji: "👩" };
      setPerson(demo);
      showCard();
      Speech.speak(`This is ${demo.name}, your ${demo.relation}.`, { rate: 0.8 });
    }
  }

  // ── Camera permission not granted yet ───────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7B8CDE" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>Camera access is needed to recognise faces.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Result card translate Y
  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>

      {/* ── Camera viewfinder ─────────────────────────── */}
      <CameraView style={StyleSheet.absoluteFill} facing="front" />

      {/* Dark overlay at top for readability */}
      <View style={styles.topOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Face Recognition</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Scan Frame / Target ───────────────────────── */}
      <View style={styles.scanArea}>
        <Animated.View
          style={[styles.scanRing, { transform: [{ scale: pulseAnim }] }]}
        />
        <View style={styles.scanBox}>
          {scanning && (
            <Text style={styles.scanningLabel}>Scanning…</Text>
          )}
        </View>
      </View>

      {/* ── Bottom Panel ──────────────────────────────── */}
      <View style={styles.bottomPanel}>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Result card (slides up) */}
        {person && (
          <Animated.View
            style={[styles.resultCard, { transform: [{ translateY: cardTranslateY }] }]}
          >
            <Text style={styles.resultEmoji}>{person.emoji ?? "🧑"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultLabel}>RECOGNISED</Text>
              <Text style={styles.resultName}>{person.name}</Text>
              <Text style={styles.resultRelation}>Your {person.relation}</Text>
              <Text style={styles.resultLastSeen}>Last seen: {person.lastSeen}</Text>
            </View>
            <TouchableOpacity onPress={hideCard} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Scan button */}
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanButtonBusy]}
          onPress={handleScan}
          disabled={scanning}
          activeOpacity={0.85}
        >
          {scanning
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.scanButtonText}>🔍  Scan Face</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  centered: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#F4F6FF", padding: 30,
  },
  permText: {
    fontSize: 17, color: "#2D3254", textAlign: "center", marginBottom: 20,
  },
  permBtn: {
    backgroundColor: "#7B8CDE", paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  permBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Top overlay
  topOverlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backBtn: { width: 60 },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  screenTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  // Scan area
  scanArea: {
    flex: 1, justifyContent: "center", alignItems: "center",
  },
  scanRing: {
    position: "absolute",
    width: 230, height: 230, borderRadius: 115,
    borderWidth: 3, borderColor: "rgba(123,140,222,0.7)",
  },
  scanBox: {
    width: 210, height: 210, borderRadius: 105,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "flex-end", alignItems: "center", paddingBottom: 16,
  },
  scanningLabel: {
    color: "#fff", fontSize: 16, fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 20, overflow: "hidden",
  },

  // Bottom panel
  bottomPanel: {
    backgroundColor: "#F4F6FF",
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: 24, paddingBottom: 40,
  },
  errorText: {
    color: "#FF6B6B", textAlign: "center",
    fontSize: 13, marginBottom: 12, lineHeight: 20,
  },

  // Result card
  resultCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20, padding: 20, marginBottom: 18,
    shadowColor: "#7B8CDE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 8,
    gap: 14,
  },
  resultEmoji: { fontSize: 48 },
  resultLabel: {
    fontSize: 10, fontWeight: "700", color: "#7B8CDE",
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2,
  },
  resultName: { fontSize: 26, fontWeight: "800", color: "#2D3254" },
  resultRelation: { fontSize: 15, color: "#7B8CDE", fontWeight: "600", marginTop: 2 },
  resultLastSeen: { fontSize: 12, color: "#B0B8E8", marginTop: 4 },
  closeBtn: {
    padding: 6, borderRadius: 20,
    backgroundColor: "#F0F2FF",
  },
  closeBtnText: { color: "#9AA3C8", fontSize: 14, fontWeight: "700" },

  // Scan button
  scanButton: {
    backgroundColor: "#7B8CDE",
    borderRadius: 18, paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#7B8CDE",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  scanButtonBusy: { backgroundColor: "#B0B8E8" },
  scanButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
