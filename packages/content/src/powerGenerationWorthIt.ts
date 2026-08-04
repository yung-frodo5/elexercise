import type { Article } from "./types";

export const powerGenerationWorthItArticle: Article = {
  slug: "is-the-power-generation-worth-it",
  title: "Is the Power Generation Worth It?",
  authors: [{ name: "Noah Korotzer" }],
  lastUpdated: "August 3rd, 2026",
  body: [
    {
      type: "paragraph",
      content: [
        { text: "The most common question: “How much power could I generate?”", italic: true, break: true },
        { text: "The second most common question: “How much would it be worth?”", italic: true, break: true },
        { text: "My favorite answer: “Wanna find out?”", italic: true, break: true },
        { text: "My second favorite answer: “It’s complicated. Let me explain…”", italic: true },
      ],
    },
    {
      type: "callout",
      heading: "Executive Summary",
      items: [
        [
          { text: "The " },
          { text: "unit economics favor electricity-generating exercise equipment", bold: true },
          { text: " far more often than commonly assumed." },
        ],
        [
          { text: "The two most important variables are " },
          { text: "usage rate and electricity price", bold: true },
          { text: "; high-usage public facilities and high-cost regions see the strongest returns." },
        ],
        [
          { text: "A stationary bike in California recoups its investment in generated electricity " },
          { text: "before year 2", bold: true },
          { text: " at high usage, even without valuing carbon savings." },
        ],
        [
          { text: "Adding a $300/ton CO2e carbon price improves the case further — in Hawaii, an elexercise bike can save " },
          { text: "nearly half its capital cost", bold: true },
          { text: " thanks to higher electricity prices and grid carbon intensity." },
        ],
        [
          { text: "The comparison cuts both ways: a motorized treadmill that consumes power can cost " },
          { text: "$8,000+ more", bold: true },
          { text: " over its lifespan than an elexercise alternative under the same conditions." },
        ],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The concept of generating electricity from exercise is not new; human-generated power dates back to 1831 when Hippolyte Pixii invented the first dynamo",
          footnote: 1,
        },
        {
          text:
            ". However, due to the physical weakness of humans in comparison to energy-dense fuels like coal, along with the massive growth of the electrical power grid, human-generated power moved to the fringes of society. It was still useful in certain cases – in rural Australia, “Schools of the Air” leveraged pedal-powered radios to deliver education to grid-less communities",
          footnote: 2,
        },
        {
          text:
            " and many emergency packs still include a hand-cranked radio – but for the most part, humans developed more powerful, cheaper, labor-free ways to generate consistent power.",
        },
      ],
    },
    {
      type: "graphic",
      key: "power-generation-pixii-machine",
      alt: "Illustration of Hippolyte Pixii's dynamo, the first machine to generate electric current",
      caption: [
        {
          text: "National MagLab - Pixii Machine",
          href: "https://nationalmaglab.org/magnet-academy/watch-play/interactive-tutorials/pixii-machine/",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Technological developments, thanks in large part to the development of the electric grid, have automated labor to the point where many people face health risks from increasingly sedentary lives. Simultaneously, the electrical power sector contributes significantly to global climate change through greenhouse gas (GHG) emissions. This brings us to an absurd situation: the fitness industry, through its efforts to provide people with personal health solutions via recreational exercise, consumes electricity and contributes to global carbon emissions. In other words, we burn fossil fuels to comfortably do useless work. ",
        },
        {
          text:
            "This has led many to wonder why we don’t solve two problems at once and generate electricity from exercise, rather than consuming it.",
          footnote: 3,
        },
        {
          text:
            " The generally accepted answer is that the unit economics don’t work out – it’s simply not worth the effort. In this article, ",
        },
        {
          text:
            "I challenge that assumption and assert that there are many scenarios in which electricity-generating exercise equipment is cheaper than its traditional counterpart.",
          bold: true,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The unit economics of this question are best understood on a per-equipment basis. For someone looking to buy a piece of new equipment, the primary question is whether or not the generated electricity pays itself off over the lifespan of the equipment. The analysis depends on several explicit variables, mainly:",
        },
      ],
    },
    {
      type: "list",
      items: [
        [{ text: "Equipment capital cost ($)" }],
        [{ text: "Energy-harvesting components’ incremental cost ($)" }],
        [{ text: "Energy generation average per-workout (Wh)" }],
        [{ text: "Equipment usage rate (workouts/week)" }],
        [{ text: "Electricity price ($/kWh)" }],
        [{ text: "Lifespan (years)" }],
        [{ text: "Discount factor (%)" }],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "This article assumes an average power generation of 150 Wh and a discount factor of 7%. Analysis was created using our ",
        },
        { text: "Equipment Analyzer – check it out for yourself!", href: "/resources/equipment-analyzer" },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Let’s begin with the most widespread use-case: a stationary bike. " },
        { text: "SportsArt claims that its ECO-POWR line is cost-competitive", footnote: 4 },
        {
          text:
            "; let’s assume a 10% price hike over traditional equipment that costs $2000. Let’s also assume CA electricity prices, which average around $0.27/kWh. For somebody looking to purchase a bike for their at-home gym, expecting to use it 3x per week, the electricity generation would not be worth it. However, for a public facility expecting significant more usage (50x per week), the electricity generation potential is much higher and eventually does pay for itself. As shown in the graph below, a gym in CA can expect to recoup its investment on electricity generation before year 2!",
        },
      ],
    },
    {
      type: "graphic",
      key: "power-generation-bike-comp-no-carbon-price",
      alt: "Line chart comparing cumulative cost over time for a traditional vs. electricity-generating stationary bike in California, excluding any carbon price, showing the electricity-generating bike breaking even before year 2 at high usage",
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "This analysis can be improved by accounting for the implicit value of displacing carbon emissions. This depends on two more factors:",
        },
      ],
    },
    {
      type: "list",
      items: [
        [{ text: "Regional grid carbon intensity (g CO2e/kWh)" }],
        [{ text: "Carbon price ($/ton CO2e)" }],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Carbon prices are not (yet) enforced; rather, they are a method for entities to place a number on how much they value reducing their Carbon footprint. For example, ",
        },
        {
          text: "Delta Electronics imposes an internal Carbon price of $300/ton CO2e to help make informed decisions",
          footnote: 5,
        },
        { text: ". If we include that same Carbon price in the above analysis, using " },
        { text: "the CAMX regional grid’s carbon intensity", footnote: 6 },
        {
          text:
            ", the case for elexercise equipment is improved. Over the equipment’s lifespan, a gym can expect electricity-generating equipment to be ",
        },
        {
          text: "$697 cheaper than its traditional counterpart despite costing $200 more to begin with",
          bold: true,
        },
        {
          text:
            ". The lifetime cost is reduced by $737 in electricity generation (34% of capital cost) and $160 in displaced CO2e (7% of capital cost).",
        },
      ],
    },
    {
      type: "graphic",
      key: "power-generation-bike-comp-ca",
      alt: "Line chart comparing cumulative cost over time for a traditional vs. electricity-generating stationary bike in California, including a $300/ton CO2e carbon price, showing the electricity-generating bike as the cheaper option over its lifespan",
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "This analysis is obviously dependent on all of the factors mentioned above. Let’s take the same stationary bike comparison to Hawaii, where electricity prices and carbon emissions are higher. Now, the elexercise bike generates $1037 in electricity (47% of capital cost) and $557 in displaced CO2e (25% of capital cost). In regions with high electricity prices and dirty grids, electricity-generating equipment is a slam dunk. Want to test some custom values from your own local electricity prices or regional grid intensity? ",
        },
        { text: "Check out our Equipment Analyzer here!", href: "/resources/equipment-analyzer" },
      ],
    },
    {
      type: "graphic",
      key: "power-generation-bike-comp-hi",
      alt: "Line chart comparing cumulative cost over time for a traditional vs. electricity-generating stationary bike in Hawaii, showing a larger cost advantage for the electricity-generating bike than in California due to higher electricity prices and carbon intensity",
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Now, let’s account for exercise equipment that consumes power, remaining in Hawaii with our $300/ton CO2e carbon price. A gym might not focus too much on the electrical costs of a piece of equipment, but this analysis suggests that it would be worthwhile. ",
        },
        { text: "A motorized treadmill consumes an average of 650W during usage.", footnote: 7 },
        {
          text:
            " Let’s compare its lifetime costs to a passive treadmill that doesn’t consume power and to an elexercise treadmill that actively generates power. For a gym expecting 50 hours of use per week, we see that the results are substantial, despite accounting for the 10% price-hike as before. Over the 7 year lifespan, ",
        },
        {
          text: "the motorized treadmill costs an extra $8,203 total – $5,533 more in electricity and $2,970 in carbon",
          bold: true,
        },
        { text: "!" },
      ],
    },
    {
      type: "graphic",
      key: "power-generation-treadmill-comp",
      alt: "Line chart comparing lifetime cost across a passive, motorized, and electricity-generating treadmill in Hawaii, showing the motorized treadmill costing over $1,800 more than the electricity-generating option over 7 years",
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "To summarize, the unit economics of electricity-generating exercise equipment is heavily dependent on two specific variables: usage rate and electricity prices. In many scenarios – primarily public facilities where equipment sees heavy usage – electricity-generating equipment is much cheaper than its traditional counterpart over the lifetime of the equipment.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ text: "This analysis did not consider several factors that would impact the analysis:" }],
    },
    {
      type: "list",
      items: [
        [{ text: "Does elexercise equipment require extra maintenance or constitute a shorter lifespan?" }],
        [
          {
            text:
              "By designing elexercise equipment from the ground up (rather than retro-fitting traditional equipment designs), can we reduce capital costs and increase power output (as suggested by ",
          },
          { text: "Free Electric", footnote: 8 },
          { text: ")?" },
        ],
        [{ text: "What would be the value of integrated energy storage (e.g. batteries)?" }],
        [{ text: "Does elexercise equipment offer more implicit value, like improved motivation or education?" }],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "These questions are difficult to answer given the lack of publicly available information. In fact, many of these questions have never been formally researched, as far as I can tell.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Instead, I will conclude by referring back to my favorite answer… " },
        { text: "Wanna find out?", bold: true },
      ],
    },
  ],
  references: [
    { id: 1, url: "https://nationalmaglab.org/magnet-academy/watch-play/interactive-tutorials/pixii-machine/" },
    {
      id: 2,
      url: "https://adelaideaz.com/articles/alfred-traeger-s-two-way-pedal-radio-enables-flying-doctor-and-outback-school-of-the-air",
    },
    { id: 3, url: "https://www.sciencedirect.com/science/article/pii/S259017452500371X" },
    { id: 4, url: "https://www.gosportsart.com/eco-powr/" },
    { id: 5, url: "https://sustainability.stanford.edu/news/reduce-emissions-while-increasing-profit-aim-efficiency" },
    { id: 6, url: "https://www.epa.gov/egrid/summary-data" },
    { id: 7, url: "https://www.energysage.com/electricity/house-watts/how-many-watts-does-a-treadmill-use/" },
    { id: 8, url: "https://www.asme.org/topics-resources/content/human-power-powers-power-all-humans" },
  ],
};
