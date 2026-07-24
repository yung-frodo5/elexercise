import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator, Button } from "react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

type Tab = "profile" | "workouts";

function AuthedApp({ accessToken }: { accessToken: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  return (
    <View style={styles.flex}>
      {tab === "profile" ? <ProfileScreen /> : <WorkoutsScreen accessToken={accessToken} />}
      <View style={styles.tabBar}>
        <Button title="Profile" onPress={() => setTab("profile")} />
        <Button title="Workouts" onPress={() => setTab("workouts")} />
      </View>
    </View>
  );
}

function Root() {
  const { session, loading } = useAuth();

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
      {session ? <AuthedApp accessToken={session.access_token} /> : <LoginScreen />}
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
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
});
