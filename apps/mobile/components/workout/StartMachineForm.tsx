import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";
import { theme } from "@exercise-tracker/design-tokens";

export function StartMachineForm({
  onStart,
  busy,
}: {
  onStart: (scanToken: string) => void;
  busy: boolean;
}) {
  const [machineId, setMachineId] = useState("");

  return (
    <View style={styles.machineRow}>
      <TextInput
        style={styles.input}
        placeholder="Machine ID"
        value={machineId}
        onChangeText={setMachineId}
      />
      <Button
        title="Connect"
        disabled={busy || !machineId.trim()}
        onPress={() => {
          if (!machineId.trim()) return;
          onStart(machineId.trim());
          setMachineId("");
        }}
        color={theme.colors.primaryGreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  machineRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    minWidth: 100,
  },
});
