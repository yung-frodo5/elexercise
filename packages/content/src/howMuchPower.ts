import type { Article } from "./types";

export const howMuchPowerArticle: Article = {
  slug: "how-much-power",
  title: "How Much Power?",
  authors: [{ name: "Noah Korotzer" }],
  lastUpdated: "August 3rd, 2026",
  body: [
    {
      type: "subtitle",
      content: [
        {
          text:
            "Every workout generates electricity, whether we capture it or not. Here's how much — at three very different scales.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "“How much power?” is really three separate questions, depending on how far back you zoom. How much can one person generate in one workout? How much could an entire gym generate if it treated every cardio machine as a generator? And if you kept zooming out — to every gym, in every country — how much would that add up to? This article answers all three, and translates each answer into something easier to picture than a raw kilowatt-hour: a phone charge, a household's electric bill, an EV battery.",
        },
      ],
    },
    {
      type: "table",
      heading: "For Reference",
      headers: ["Item", "Energy (kWh)", "Source"],
      rows: [
        [
          [{ text: "Casual 45-minute workout (~100 W)" }],
          [{ text: "~0.075" }],
          [{ text: "Wikipedia, “Human power”", href: "https://en.wikipedia.org/wiki/Human_power" }],
        ],
        [
          [{ text: "Hard 90-minute workout (~250 W)" }],
          [{ text: "~0.375" }],
          [
            {
              text: "Princeton, “Human Power and Propulsion”",
              href: "https://www.princeton.edu/~maelabs/hpt/pro/human_3.htm",
            },
          ],
        ],
        [
          [{ text: "Full iPhone charge" }],
          [{ text: "~0.013" }],
          [
            {
              text: "Macworld, iPhone battery capacities compared",
              href:
                "https://www.macworld.com/article/678413/iphone-battery-capacities-compared-all-iphones-battery-life-in-mah-and-wh.html",
            },
          ],
        ],
        [
          [{ text: "Average EV, full battery charge" }],
          [{ text: "~75" }],
          [
            {
              text: "Recharged.com, EV Battery Capacity Guide",
              href: "https://recharged.com/articles/electric-vehicle-battery-capacity-guide/",
            },
          ],
        ],
        [
          [{ text: "Average U.S. household, one day" }],
          [{ text: "~29" }],
          [{ text: "U.S. EIA", href: "https://www.eia.gov/tools/faqs/faq.php?id=97&t=3" }],
        ],
        [
          [{ text: "Average U.S. household, one month" }],
          [{ text: "~899" }],
          [{ text: "U.S. EIA", href: "https://www.eia.gov/tools/faqs/faq.php?id=97&t=3" }],
        ],
        [
          [{ text: "Average U.S. household, one year" }],
          [{ text: "~10,791" }],
          [{ text: "U.S. EIA", href: "https://www.eia.gov/tools/faqs/faq.php?id=97&t=3" }],
        ],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The figures above recur throughout this piece — refer back to this table instead of re-deriving them each time.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "The Individual Level" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Humans are, by any engineering standard, weak generators. A casual, 45-minute session on a stationary bike at roughly 100 watts (W) generates about 0.075 kWh — enough to fully charge an iPhone about six times over. Push harder — a 90-minute effort sustaining roughly 250W, the same assumption used in the facility-level modeling below — and a single workout generates about 0.375 kWh, or nearly 30 iPhone charges.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Neither number moves a utility meter. But “doesn't move a meter” is exactly the standard human-generated power always gets held to, and it's the wrong one — nobody judges a single solar panel by whether it can power a city block, either. The right question is what happens when you stop counting one bike and start counting a building full of them.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "The Facility Level" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Along with my classmate Ryan Davies, I modeled exactly that scenario for a Stanford E3 class project: a mid-sized Northern California gym — 129 members working out an average of 104 times a year — that fully instruments its cardio floor with electricity-generating equipment.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "At that pace, the cardio floor alone generates about 6.57 MWh of electricity a year, offsetting roughly 29% of the gym's total annual energy bill — lighting, HVAC, hot water, everything — using equipment members were already paying to use. Push the assumptions further — a larger membership, working out more often — and generation rises to about 11.8 MWh a year: more than the reference table's “average U.S. household, one year” row, generated passively by people exercising for their own reasons, and enough to offset just over half the facility's total energy costs.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "That analysis — full assumptions, a load-by-load energy breakdown, solar and battery integration, and three modeled scenarios from baseline to “moonshot” — is available as a full report: ",
        },
        {
          text: "“Integrative Design Report: Project Exertricity,” co-authored with Ryan Davies",
          href: "/noahkorotzer_ryandavies_e3_report.pdf",
        },
        { text: "." },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "The National and Global Level" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "Zoom out again, past any one gym, to every gym. The U.S. now counts a record ~81 million gym members",
          footnote: 1,
        },
        { text: "; worldwide, that figure is roughly 184 million", footnote: 2 },
        { text: ". The average member visits about 1.5 times a week — call it 78 workouts a year", footnote: 3 },
        {
          text:
            ". Apply the harder-effort figure from the reference table (0.375 kWh per workout) across all of them, and recreational “useless work” adds up to:",
        },
      ],
    },
    {
      type: "callout",
      heading: "Scaling It Up (Back-of-the-Envelope)",
      items: [
        [
          { text: "United States: " },
          { text: "~2.4 TWh/year", bold: true },
          {
            text:
              " — enough to power roughly 220,000 average American households for a year, or fully charge about 32 million EV batteries.",
          },
        ],
        [
          { text: "Worldwide: " },
          { text: "~5.4 TWh/year", bold: true },
          {
            text:
              " — the equivalent of roughly 500,000 U.S. households for a year, or about 72 million EV battery charges.",
          },
        ],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "These are gym-membership numbers only — they don't count the runner logging miles on pavement, the home workout, or the office stairwell. The real number is bigger. The point isn't the precision of any single estimate; it's the order of magnitude. A “useless” hour on a machine, multiplied by how many hours humanity spends on machines like it, adds up to a meaningful slice of the grid — not a rounding error.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "None of this replaces baseload power, and it was never going to. But the premise this whole site is built on — that recreational exercise is “useless work” we could be capturing instead of discarding — holds up at every scale we checked: one person, one gym, and eight billion people. Curious where your own numbers land? ",
        },
        { text: "Try the Equipment Analyzer.", href: "/resources/equipment-analyzer" },
      ],
    },
  ],
  references: [
    {
      id: 1,
      url: "https://www.healthandfitness.org/2025-global-fitness-industry-report-shows-record-growth-and-whats-next-for-the-market/",
    },
    { id: 2, url: "https://gymdesk.com/blog/gym-membership-statistics" },
    { id: 3, url: "https://gitnux.org/gym-attendance-statistics/" },
  ],
};
