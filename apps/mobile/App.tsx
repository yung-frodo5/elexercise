import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Header } from "./components/nav/Header";
import { Footer, type Tab } from "./components/nav/Footer";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ExerciseDashboardScreen from "./screens/ExerciseDashboardScreen";

// React Native has no CSS-style cascade, so there's no single place to set
// "all text uses this color" the way apps/web sets it once on <body>.
// Overriding defaultProps here is the standard workaround -- every <Text>/
// <TextInput> picks it up without touching every screen's StyleSheet, while
// individual style overrides (e.g. toggleLabelActive) still win as usual.
// Font itself is back to the OS default (theme.typography.fontFamily.native
// is undefined) after trying a couple of custom faces and reverting both,
// per design feedback -- only color is overridden here now.
type StyledComponent = { defaultProps?: { style?: unknown } };
const defaultTextStyle = { color: theme.colors.textPrimary };
(Text as unknown as StyledComponent).defaultProps = {
  ...(Text as unknown as StyledComponent).defaultProps,
  style: defaultTextStyle,
};
(TextInput as unknown as StyledComponent).defaultProps = {
  ...(TextInput as unknown as StyledComponent).defaultProps,
  style: defaultTextStyle,
};

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
