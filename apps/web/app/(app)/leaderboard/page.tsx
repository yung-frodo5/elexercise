"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../../lib/useSession";
import { useProfile } from "../../../lib/useProfile";
import { useFriends } from "../../../lib/useFriends";
import { AvatarCircle } from "../../../components/profile/AvatarCircle";

const headerCell: CSSProperties = {
  textAlign: "left",
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  borderBottom: `1px solid ${theme.colors.border}`,
  color: theme.colors.textMuted,
  fontSize: theme.typography.size.xs,
  textTransform: "uppercase",
};

const cell: CSSProperties = {
  padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
  borderBottom: `1px solid ${theme.colors.border}`,
  color: theme.colors.textPrimary,
};

// Standing in for real friends until there's actual social data to show --
// lets the leaderboard be reviewed with more than one row on a fresh/empty
// account. Not backed by the friends table, so adding a real friend doesn't
// remove or interact with these in any way.
const PLACEHOLDER_FRIENDS = [
  { id: "placeholder-1", displayName: "Jordan (placeholder)", level: 12, elexir: 1840, avatarUrl: null },
  { id: "placeholder-2", displayName: "Sam (placeholder)", level: 7, elexir: 612, avatarUrl: null },
  { id: "placeholder-3", displayName: "Riley (placeholder)", level: 3, elexir: 205, avatarUrl: null },
];

// Total energy generated is just elexir: by design, elexir is 1:1 with Wh
// earned through machine sessions (see SupabaseWorkoutRepository.awardElexir),
// so there's no separate aggregation to keep in sync with the leaderboard.
export default function LeaderboardPage() {
  const { session } = useSupabaseSession();
  const { displayName, level, elexir, avatarUrl } = useProfile(session?.user.id);
  const { friends, loading, error, addFriend } = useFriends(session?.user.id);

  const [nameInput, setNameInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    const result = await addFriend(nameInput);
    if (result.ok) {
      setNameInput("");
    } else {
      setAddError(result.error);
    }
    setAdding(false);
  }

  const rows = [
    ...(session
      ? [
          {
            id: session.user.id,
            displayName: displayName ?? session.user.email ?? "You",
            level: level ?? 1,
            elexir: elexir ?? 0,
            avatarUrl,
            isMe: true,
          },
        ]
      : []),
    ...friends.map((friend) => ({
      id: friend.id,
      displayName: friend.display_name,
      level: friend.level,
      elexir: friend.elexir,
      avatarUrl: friend.avatar_url,
      isMe: false,
    })),
    ...PLACEHOLDER_FRIENDS.map((friend) => ({ ...friend, isMe: false })),
  ].sort((a, b) => b.elexir - a.elexir);

  return (
    <main style={{ padding: theme.spacing.xl, maxWidth: 640, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
      <h1 style={{ color: theme.colors.textPrimary }}>Leaderboard</h1>

      {error && <p style={{ color: theme.colors.error }}>{error}</p>}

      {loading ? (
        <p style={{ marginTop: theme.spacing.xl, color: theme.colors.textMuted }}>Loading…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: theme.spacing.xl }}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}></th>
              <th style={headerCell}>Name</th>
              <th style={{ ...headerCell, textAlign: "right" }}>Level</th>
              <th style={{ ...headerCell, textAlign: "right" }}>Total energy</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} style={row.isMe ? { backgroundColor: theme.colors.sageAccent } : undefined}>
                <td style={cell}>{index + 1}</td>
                <td style={cell}>
                  <AvatarCircle src={row.avatarUrl ?? ""} size={28} />
                </td>
                <td
                  style={{
                    ...cell,
                    fontWeight: row.isMe ? theme.typography.weight.bold : theme.typography.weight.regular,
                  }}
                >
                  {row.displayName}
                  {row.isMe ? " (you)" : ""}
                </td>
                <td style={{ ...cell, textAlign: "right" }}>{row.level}</td>
                <td style={{ ...cell, textAlign: "right" }}>{row.elexir} Wh</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
        <input
          style={{ flex: 1 }}
          placeholder="Friend's display name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button type="submit" disabled={adding}>
          {adding ? "Adding…" : "Add friend"}
        </button>
      </form>
      {addError && <p style={{ marginTop: theme.spacing.xs, color: theme.colors.error }}>{addError}</p>}
    </main>
  );
}
