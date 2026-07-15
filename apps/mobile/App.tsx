import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, StyleSheet, Text, View, ActivityIndicator, Button } from "react-native";
import type { Workout } from "@exercise-tracker/shared-types";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import ProfileScreen from "./screens/ProfileScreen";

// iOS Simulator can reach your Mac's localhost directly.
// A physical device on the same Wi-Fi needs your Mac's LAN IP instead,
// e.g. "http://192.168.1.23:3001" (find it via `ipconfig getifaddr en0`).
const API_URL = "http://localhost:3001";

function WorkoutsScreen({ userId }: { userId: string }) {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/workouts?userId=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(setWorkouts)
      .catch((err) => setError(err.message));
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workouts</Text>

      {error && <Text style={styles.error}>Couldn't reach API: {error}</Text>}

      {!error && workouts === null && <ActivityIndicator />}

      {workouts !== null && (
        <FlatList
          style={styles.list}
          data={workouts}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text>No workouts yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowDate}>{item.date}</Text>
              <Text style={styles.rowSets}>{item.sets.length} set(s)</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

type Tab = "profile" | "workouts";

function AuthedApp({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("profile");
  return (
    <View style={styles.flex}>
      {tab === "profile" ? <ProfileScreen /> : <WorkoutsScreen userId={userId} />}
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
      {session ? <AuthedApp userId={session.user.id} /> : <LoginScreen />}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
  error: {
    color: "#b00020",
    marginBottom: 12,
  },
  list: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowDate: {
    fontWeight: "500",
  },
  rowSets: {
    color: "#666",
  },
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
