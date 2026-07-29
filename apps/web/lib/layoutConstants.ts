// Fixed pixel height so the root layout can reserve matching space below it
// (a fixed-position element is out of flow and would otherwise overlap
// content). Kept dependency-free so any component can read it without
// pulling in SiteHeader's own imports (Supabase client, session hooks, etc.).
export const HEADER_HEIGHT = 64;
