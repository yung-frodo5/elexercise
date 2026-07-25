import { Button, StyleSheet, Text, View } from "react-native";
import type { Session } from "@exercise-tracker/shared-types";
import { theme } from "@exercise-tracker/design-tokens";

export function SessionList({
  sessions,
  onStop,
  busy,
}: {
  sessions: Session[];
  onStop?: (sessionId: string) => void;
  busy?: boolean;
}) {
  return (
    <View>
      {sessions.map((s) => (
        <View key={s.id} style={styles.sessionRow}>
          <Text>
            {s.activityType} — {s.status}
          </Text>
          {onStop && s.status === "in_progress" && (
            <Button
              title="Stop"
              onPress={() => onStop(s.id)}
              disabled={busy}
              color={theme.colors.secondaryGreen}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
});
