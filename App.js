// ============================================================
// App.js  –  Root of the React Native app
// Sets up navigation between all 4 screens
// ============================================================

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen     from "./screens/HomeScreen";
import CameraScreen   from "./screens/CameraScreen";
import TimelineScreen from "./screens/TimelineScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      {/* Hide the default navigation header; each screen has its own */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home"     component={HomeScreen}     />
        <Stack.Screen name="Camera"   component={CameraScreen}   />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
      </Stack.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
