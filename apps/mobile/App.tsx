import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/nav/Header";
import { Footer, type Tab } from "./components/nav/Footer";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ExerciseDashboardScreen from "./screens/ExerciseDashboardScreen";

// Header/footer are always present, even signed out — Home (the landing
// screen) needs no auth, while Dashboard/Profile fall back to LoginScreen
// in place of their content until a session exists.
function Root() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("home");

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar style="auto" />
      <Header onPressProfile={() => setTab("profile")} />
      <View style={styles.flex}>
        {tab === "home" ? (
          <LandingScreen />
        ) : tab === "dashboard" ? (
          session ? (
            <ExerciseDashboardScreen accessToken={session.access_token} />
          ) : (
            <LoginScreen message="Exercise dashboard is only available when logged in" />
          )
        ) : session ? (
          <ProfileScreen />
        ) : (
          <LoginScreen />
        )}
      </View>
      <Footer tab={tab} onSelect={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
});
