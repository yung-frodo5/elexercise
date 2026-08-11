import type { Article } from "./types";

export const lifeCycleAnalysisArticle: Article = {
  slug: "life-cycle-analysis",
  title: "Understanding the Environmental Footprint",
  authors: [{ name: "Emily Wexler" }, { name: "Noah Korotzer" }],
  lastUpdated: "August 10th, 2026",
  style: "technical",
  body: [
    {
      type: "callout",
      heading: "Executive Summary",
      items: [
        [
          { text: "Elexercise equipment can potentially be carbon negative", bold: true },
          { text: ", but the outcome depends on how the equipment is produced and used." },
        ],
        [
          { text: "Production impacts depend largely on " },
          { text: "material and manufacturing factors,", bold: true },
          {
            text:
              " particularly the choice of raw materials (e.g. battery, steel) and electricity consumption for manufacturing.",
          },
        ],
        [
          {
            text: "Energy generated, grid carbon intensity, and equipment lifespan",
            bold: true,
          },
          { text: " determine how much of those emissions can be offset." },
        ],
        [
          { text: "Sensitivity analysis", bold: true },
          { text: " shows when elexercise equipment can outperform conventional fitness equipment." },
        ],
      ],
    },
    { type: "subtitle", content: [{ text: "Introduction" }] },
    {
      type: "paragraph",
      content: [
        {
          text:
            "While the sustainability opportunities for electricity-generating cardio equipment has already been established",
          footnote: 1,
        },
        {
          text:
            ", the environmental impact of potential innovative strength-training equipment is not yet understood. This project therefore evaluates a proposed novel device that allows users to perform strength-training exercises using the inertial resistance of a generator. To understand potential environmental impacts of the device, a Life Cycle Assessment (LCA) was performed to quantify the net amount of greenhouse gases (GHGs) generated.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "LCA is a scientific method used to measure the environmental impacts of products and services across every stage of a product's lifespan, from raw material extraction and manufacturing to use, transportation, and end-of-life (EoL) management. Looking at the full life cycle of a product helps identify which activities or materials generate the greatest impacts and where changes can have the most significant environmental benefits. As shown in the diagram below, the assessment includes all major stages of the equipment's lifespan, beginning with extraction of raw materials used for the squat rack frame and battery. The raw materials are then sent to manufacturing plants to be further processed and assembled into the final equipment.",
        },
      ],
    },
    {
      type: "graphic",
      key: "life-cycle-stages-diagram",
      alt:
        "Flowchart of the equipment life cycle: Raw Material Extraction, Converting, Installation and Use, and End of Life Management.",
      caption: [{ text: "Fig. 1: Stages of Equipment Lifespan" }],
    },
    { type: "subtitle", content: [{ text: "Definition" }] },
    {
      type: "paragraph",
      content: [
        {
          text:
            "During the use phase, mechanical energy produced by the user is transferred through a generator that converts mechanical motion into electricity. The generated electricity is stored in a rechargeable 2 kWh lithium iron phosphate (LFP) battery, and subsequently supplied to the electrical grid through a grid-compatible inverter. As stated earlier, this assessment explores the conditions under which the system delivers net environmental benefits, such as how frequently it is used, how much electricity it generates per workout session, the lifetime of the battery, and the carbon intensity of the local electricity grid.",
          footnote: 2,
        },
      ],
    },
    { type: "subtitle", content: [{ text: "Life Cycle Impact Assessment" }] },
    {
      type: "paragraph",
      content: [
        {
          text:
            "A set of hypothetical parameter values were used to generate baseline results for the system. It is assumed that the machine is used for eight 1-hour workouts per day (based on a commercial gym setting) each week and generates 20 W during usage, on average. Squat racks are considered very durable, even under heavy use; therefore, the lifespan of the prototype is assumed to be 15 years. The battery is assumed to have a round-trip efficiency of 85%",
          footnote: 3,
        },
        {
          text:
            " and is replaced every 10 years. Under these conditions, the prototype can be considered carbon negative after 10 years of use.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "As shown in the graph below, raw materials used for LFP battery pack and rack make up the largest portion of total system impacts: 156.3 kg CO2-eq and 97 kg CO2-eq, respectively. Converting impacts generate ~20% of the system impacts, while the end-of-life stage shows a negligible (<5%) contribution.",
        },
      ],
    },
    {
      type: "graphic",
      key: "life-cycle-baseline-gwp-chart",
      alt:
        "Stacked bar chart showing global warming potential contributions by component -- raw materials for battery and rack, converting, end-of-life, and electricity offsets -- for the squat rack system under baseline assumptions.",
      caption: [{ text: "Fig. 2: GWP of Various Components Under Baseline Assumptions" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "To understand how variations in electricity generated per session may influence results, sensitivity analyses were performed on two additional scenarios, representing 30 Wh/workout and 50 Wh/workout. At 30 Wh/workout, the system reaches carbon negativity after about 7 years of use. Further increasing the value to 50 Wh/workout results in carbon negativity after only 4 years of use.",
        },
      ],
    },
    {
      type: "graphic",
      key: "life-cycle-power-sensitivity-chart",
      alt:
        "Line chart showing global warming potential over 10 years at 20, 30, and 50 watt-hours generated per workout, each reaching carbon negativity at a different year.",
      caption: [{ text: "Fig. 3: Sensitivity Analysis of Power Generation Impact on GWP" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "In the baseline scenario, the assumed carbon intensity (CI) of the local electricity grid is 0.703 kgCO2-eq/kWh",
          footnote: 2,
        },
        {
          text:
            ". A more conservative CI factor of 0.504 kgCO2-eq/kWh was evaluated in a sensitivity analysis to compare how many years it would take for the system to become carbon negative compared to baseline. The CI factor was selected to represent average grid impacts in California. Under these conditions, it would take almost 14 years of use to offset the impacts of the machine, assuming all other parameters remain the same.",
        },
      ],
    },
    {
      type: "graphic",
      key: "life-cycle-carbon-intensity-sensitivity-chart",
      alt:
        "Line chart comparing global warming potential over 14 years under the baseline grid carbon-intensity factor versus a lower California grid carbon-intensity factor.",
      caption: [{ text: "Fig. 4: Sensitivity Analysis of Carbon Intensity Impact on GWP" }],
    },
    { type: "subtitle", content: [{ text: "Conclusion" }] },
    {
      type: "paragraph",
      content: [
        {
          text:
            "One of the biggest advantages of LCA is that it enables manufacturers to identify impact hotspots and areas of improvement along the supply-chain of their products. Additionally, it empowers consumers to make more informed decisions when it comes to reducing their carbon footprint. This project is a conceptual prototype designed to explore how sustainability can be integrated into fitness equipment. The results of this study can be used to explore alternatives such as increasing recycled steel content, selecting lower-impact battery technologies, improving manufacturing efficiency, or extending battery life. Future work could evaluate different battery sizes, improve the efficiency of the energy recovery system, or investigate how multiple machines could work together to supply electricity within a gym.",
        },
      ],
    },
  ],
  references: [
    {
      id: 1,
      citation: "SportsArt. (2026). Another Industry First — Carbon Negative.",
      url: "https://www.gosportsart.com/certified-carbon-negative/",
    },
    {
      id: 2,
      citation:
        "U.S. Environmental Protection Agency. (2026). Greenhouse Gas Equivalencies Calculator: Calculations and References.",
      url: "https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references",
    },
    {
      id: 3,
      citation:
        "New York State Energy Research and Development Authority. (2024). Energy Storage System Performance Impact Evaluation.",
      url: "https://www.nyserda.ny.gov/-/media/Project/Nyserda/Files/Publications/PPSER/NYSERDA/2024-Energy-Storage-Impact-Evaluation-Report.pdf",
    },
  ],
};
