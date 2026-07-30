// Fixed pixel height so the root layout can reserve matching space below it
// (a fixed-position element is out of flow and would otherwise overlap
// content). Kept dependency-free so any component can read it without
// pulling in SiteHeader's own imports (Supabase client, session hooks, etc.).
// 64 + room for the mini level bar under the signed-in profile button.
export const HEADER_HEIGHT = 84;
