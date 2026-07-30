import { useEffect, useRef } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { theme, withAlpha } from "@exercise-tracker/design-tokens";
import { SearchIcon } from "./SearchIcon";

/** Icon that expands into an underline search field — same ink as web (navy). */
export function ExpandableSearch({
  value,
  open,
  onOpenChange,
  onChange,
  placeholder = "Search...",
  ink = theme.colors.navy,
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Stroke/text color — navy on white history chrome (main palette). */
  ink?: string;
}) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function clearAndClose() {
    onChange("");
    onOpenChange(false);
  }

  return (
    <View style={styles.row}>
      {open ? (
        <>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: ink, borderBottomColor: withAlpha(ink, 0.35) }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={withAlpha(ink, 0.45)}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onBlur={() => {
              if (!value.trim()) onOpenChange(false);
            }}
          />
          <TouchableOpacity
            onPress={clearAndClose}
            accessibilityLabel="Close search"
            style={styles.iconButton}
            hitSlop={8}
          >
            <SearchIcon size={14} color={theme.colors.secondaryGreen} />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={() => onOpenChange(true)}
          accessibilityLabel="Search"
          style={styles.iconButton}
          hitSlop={8}
        >
          <SearchIcon size={14} color={ink} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 120,
    paddingVertical: 2,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    fontSize: theme.typography.size.xs,
    fontFamily: "Menlo",
  },
});
