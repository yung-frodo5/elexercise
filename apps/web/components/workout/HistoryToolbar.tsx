"use client";

import { theme } from "@exercise-tracker/design-tokens";
import { familjenGrotesk } from "../../lib/fonts";
import { FilterChip } from "../ui/FilterChip";
import { ExpandableSearch } from "../ui/ExpandableSearch";

export function HistoryToolbar({
  activityCount,
  sportOptions,
  selectedSports,
  onToggleSport,
  keywords,
  searchOpen,
  onSearchOpenChange,
  onKeywordsChange,
}: {
  activityCount: number;
  sportOptions: string[];
  selectedSports: string[];
  onToggleSport: (sport: string) => void;
  keywords: string;
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onKeywordsChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weight.semibold,
          color: theme.colors.navy,
          whiteSpace: "nowrap",
          fontFamily: familjenGrotesk.style.fontFamily,
          letterSpacing: "-0.02em",
        }}
      >
        {activityCount}{" "}
        <span style={{ fontFamily: familjenGrotesk.style.fontFamily, fontWeight: theme.typography.weight.medium }}>
          {activityCount === 1 ? "Workout" : "Workouts"}
        </span>
      </p>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          {sportOptions.map((option) => (
            <FilterChip
              key={option}
              label={option}
              active={selectedSports.includes(option)}
              onClick={() => onToggleSport(option)}
            />
          ))}
        </div>

        <ExpandableSearch
          value={keywords}
          open={searchOpen}
          onOpenChange={onSearchOpenChange}
          onChange={onKeywordsChange}
        />
      </div>
    </div>
  );
}
