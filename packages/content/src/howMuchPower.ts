import type { Article } from "./types";

export const howMuchPowerArticle: Article = {
  slug: "how-much-power",
  title: "How Much Power?",
  authors: [{ name: "Noah Korotzer" }],
  lastUpdated: "August 3rd, 2026",
  body: [
    {
      type: "callout",
      heading: "Executive Summary",
      items: [
        [
          { text: "Individually:", bold: true },
          { text: " a single hard workout can generate 0.375 kWh — nearly 30 iPhone charges." },
        ],
        [
          { text: "Facility:", bold: true },
          {
            text:
              " human power alone could offset roughly 46% of an energy-efficient gym's annual electricity bill, rising to 83% under more ambitious assumptions.",
          },
        ],
        [
          { text: "Collectively:", bold: true },
          {
            text:
              " U.S. gym members alone could generate an estimated 2.4 TWh a year, enough to power 220,000 households. Worldwide, this number rises to 5.4 TWh. Furthermore, these numbers only represent paid gym memberships.",
          },
        ],
      ],
    },
    {
      type: "subtitle",
      content: [
        {
          text: "Every workout generates energy, whether we capture it or not.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Currently, when we work out, we are a bunch of distributed heat generators. Most of the heat is dissipated by our own body but some of it is dissipated by the machines that we use. This article explores how much electrical power we might generate if we converted that latter portion into electricity instead. Power generation at the individual level is small but non-zero. When you aggregate our individual exercise efforts, something becomes clear: our collective efforts, together, are worthwhile. Just how worthwhile? Read on to find out.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Note: ", bold: true },
        {
          text:
            "The bottom of this article contains a reference table with common energy quantities. References to the table are made throughout.",
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
            "Humans are, by any engineering standard, weak generators. A casual, 45-minute session on a stationary bike at 100 watts (W) generates 0.075 kWh. Most would say this is negligible, but it is actually enough to fully charge an iPhone six times. Push harder — a 90-minute effort sustaining 250W — and a single workout can generate 0.375 kWh. This would constitute nearly 30 iPhone charges or over 7 full laptop charges, from a single workout!",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Still, both numbers are significantly less than the average U.S. household's daily energy consumption. Framed another way, this can help us understand the electricity generation that we take for granted every day: many of us couldn't possibly generate the amount of power we consume. Much of that electrical power comes from fossil-fueled generators. If we could all ",
        },
        {
          text: "physically feel",
          bold: true,
          italic: true,
        },
        {
          text: " just how much work is needed to power our daily habits, might we change them?",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "To summarize - the individual person isn't canceling their own utility bill, though they can power some of their small electronics. However, nobody judges a single solar panel by whether it can power a city block. The right question is not what happens when you count one person on one bike, but instead what happens when you count a building full of them.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "A Gym's Power Potential" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Along with my classmate Ryan Davies, I modeled this scenario for a class project in Extreme Energy Efficiency. We considered a mid-sized Northern California gym — 129 members working out an average of 104 times a year — that is fully instrumented with electricity-generating equipment. We analyzed not only the human power potential but also energy efficiency improvements to explore whether or not elexercise could transform a gym into a truly carbon-negative grid asset.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Our analysis shows that human-power alone could generate ~6.57 MWh of electricity a year, offsetting roughly 46% of the energy-efficient gym's total annual energy bill (14.3 MWh) that comes from lighting, HVAC, hot water, and everything else. Push the assumptions further (a larger membership working out more often) and generation rises to about 11.8 MWh a year, an impressive 83% of the gym's electricity consumption. All of this could be generated “passively” by people exercising for their own reasons (though, of course, it sure doesn't ",
        },
        { text: "feel", italic: true },
        {
          text:
            " so passive 😆). Paired with rooftop solar, we find that a gym could indeed be a significant electricity generator — one that is naturally distributed in urban environments, generates power even in the evening after the sun goes down, and has lower operating costs than its competitors.",
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
      content: [{ text: "The Collective Whole" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "Now consider not just one gym but every gym. The U.S. now counts a record ~81 million gym members",
          footnote: 1,
        },
        { text: "; worldwide, that figure is estimated at roughly 184 million", footnote: 2 },
        {
          text:
            ". These numbers will likely continue to grow as societies develop globally. The average member visits about 1.5 times a week, an average of 78 workouts a year",
          footnote: 3,
        },
        {
          text:
            ". Apply the 0.375 kWh hard-effort workout figure from above across all of them, and recreational “useless work” adds up to:",
        },
      ],
    },
    {
      type: "list",
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
            "Furthermore, these numbers only represent paid gym memberships. They don't count exercise facilities in universities, professional sports teams, community centers, public parks, at-home gyms, offices, and more. The real potential is even bigger! A “useless” hour on a machine, multiplied by how many hours humanity spends on machines like it, adds up to a meaningful slice of the grid, and therefore a non-negligible piece of global GHG emissions.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "What's this? There's more?! Most of that exercise is done during on-peak hours (from 4-9 PM) when people finish work and electricity demand ramps up quickly. This is a time period of intense strain on the grid, and therefore a time period where distributed energy generation would be more useful than average, in terms of both economics and displaced carbon. Add on top of that the fact that the electricity generation would be replacing heat generation, therefore reducing the A/C load, and we end up with quite the force multiplier.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "None of this replaces baseload power, and it was never going to. But hopefully by now you agree with a core tenet of elexercise: ",
        },
        {
          text: "individually, we may be weak, but collectively, we are quite strong.",
          bold: true,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Curious where your own numbers land? " },
        { text: "Try the Equipment Analyzer.", href: "/resources/equipment-analyzer" },
      ],
    },
    {
      type: "table",
      heading: "Common Energy Quantities",
      headers: ["Item", "Energy (kWh)", "Source"],
      rows: [
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
          [{ text: "Microwave, 2 minutes of use (~1,000 W)" }],
          [{ text: "~0.033" }],
          [
            {
              text: "Maytag, microwave wattage guide",
              href: "https://www.maytag.com/blog/kitchen/microwave-wattages.html",
            },
          ],
        ],
        [
          [{ text: "Full laptop charge" }],
          [{ text: "~0.05" }],
          [
            {
              text: "Battery Skills, average laptop battery capacity",
              href: "https://batteryskills.com/what-is-the-average-laptop-battery-capacity/",
            },
          ],
        ],
        [
          [{ text: "Casual 45-minute workout (~100 W)", bold: true }],
          [{ text: "~0.075" }],
          [{ text: "Wikipedia, “Human power”", href: "https://en.wikipedia.org/wiki/Human_power" }],
        ],
        [
          [{ text: "Microwave, vampire draw for one day (~4 W idle)" }],
          [{ text: "~0.096" }],
          [
            {
              text: "ASAP, new standards cut vampire energy waste",
              href: "https://appliance-standards.org/blog/new-standards-cut-vampire-energy-waste",
            },
          ],
        ],
        [
          [{ text: "Television, 1 hour of use (~100 W)" }],
          [{ text: "~0.1" }],
          [
            {
              text: "EcoFlow, how much electricity does a TV use",
              href: "https://www.ecoflow.com/us/blog/how-much-electricity-does-tv-use",
            },
          ],
        ],
        [
          [{ text: "PS5, 1 hour of gaming (~200 W)" }],
          [{ text: "~0.2" }],
          [
            {
              text: "EcoFlow, how many watts does a PS5 use",
              href: "https://www.ecoflow.com/us/blog/how-many-watts-does-ps5-use",
            },
          ],
        ],
        [
          [{ text: "Hard 90-minute workout (~250 W)", bold: true }],
          [{ text: "~0.375" }],
          [
            {
              text: "Princeton, “Human Power and Propulsion”",
              href: "https://www.princeton.edu/~maelabs/hpt/pro/human_3.htm",
            },
          ],
        ],
        [
          [{ text: "Dyson Airwrap, 20 minutes of use (~1,300 W)" }],
          [{ text: "~0.433" }],
          [
            {
              text: "Engineer Fix, how many watts does the Dyson Airwrap use",
              href: "https://engineerfix.com/how-many-watts-does-the-dyson-airwrap-use/",
            },
          ],
        ],
        [
          [{ text: "Refrigerator, one day" }],
          [{ text: "~1.5" }],
          [
            {
              text: "EnergySage, how many watts does a refrigerator use",
              href: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-refrigerator-use/",
            },
          ],
        ],
        [
          [{ text: "Average U.S. household, one day" }],
          [{ text: "~29" }],
          [{ text: "U.S. EIA", href: "https://www.eia.gov/tools/faqs/faq.php?id=97&t=3" }],
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
