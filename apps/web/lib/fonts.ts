import { Familjen_Grotesk } from "next/font/google";

// Shared instance -- next/font/google dedupes correctly when the same call
// is imported into multiple components, so this avoids repeating the same
// loader call (and risking a mismatched config) at every use site.
export const familjenGrotesk = Familjen_Grotesk({ subsets: ["latin"] });
