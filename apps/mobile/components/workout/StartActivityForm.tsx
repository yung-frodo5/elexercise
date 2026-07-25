import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

const ACTIVITY_PRESETS = ["Run", "Bike", "Row", "Strength", "Walk"];

export function StartActivityForm({
  onStart,
  busy,
}: {
  onStart: (activityType: string) => void;
  busy: boolean;
}) {
  const [other, setOther] = useState("");

  return (
    <View style={styles.presetRow}>
      {ACTIVITY_PRESETS.map((preset) => (
        <View key={preset} style={styles.presetButton}>
          <Button title={preset} onPress={() => onStart(preset)} disabled={busy} color={theme.colors.primaryGreen} />
        </View>
      ))}
      <TextInput style={styles.input} placeholder="Other…" value={other} onChangeText={setOther} />
      <Button
        title="Add"
        disabled={busy || !other.trim()}
        onPress={() => {
          if (!other.trim()) return;
          onStart(other.trim());
          setOther("");
        }}
        color={theme.colors.primaryGreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  presetButton: {
    marginRight: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    minWidth: 100,
  },
});
