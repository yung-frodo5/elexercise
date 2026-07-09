import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import type { Workout } from "@exercise-tracker/shared-types";

// iOS Simulator can reach your Mac's localhost directly.
// A physical device on the same Wi-Fi needs your Mac's LAN IP instead,
// e.g. "http://192.168.1.23:3001" (find it via `ipconfig getifaddr en0`).
const API_URL = "http://localhost:3001";

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/workouts?userId=demo-user`)
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(setWorkouts)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Exercise Tracker</Text>

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
});
