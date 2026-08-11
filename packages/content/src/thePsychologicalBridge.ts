import type { Article } from "./types";

export const thePsychologicalBridgeArticle: Article = {
  slug: "the-psychological-bridge",
  title: "The Psychological Bridge: From Exercise to Climate Action",
  authors: [{ name: "Noah Korotzer" }, { name: "Eric Ingram" }],
  lastUpdated: "August 10th, 2026",
  style: "technical",
  body: [
    {
      type: "callout",
      heading: "Abstract",
      style: "prose",
      items: [
        [
          {
            text:
              "Studies show that climate anxiety does not consistently translate into climate action. Not only is affective distress a poor predictor of behavioral engagement, but these individual behaviors and efforts are often ",
          },
          { text: "disconnected from real, tangible outcomes.", bold: true },
          {
            text:
              " In this article we discuss “elexercise”, a concrete mechanism that aims to close the gap by attaching a measurable output of climate action to each workout. Drawing on parallel literatures in exercise and climate psychology, we propose elexercise as a way to ",
          },
          { text: "strengthen an individual's self-efficacy and environmental identity,", bold: true },
          { text: " as well as " },
          {
            text: "harness the more powerful mechanisms of collective efficacy and group-based action",
            bold: true,
          },
          {
            text:
              ", the strongest predictors of sustained climate engagement. We consider how an elexercise-based gym or system at large could be designed for equitable access and also address the psychological risks elexercise must guard against. We conclude that elexercise could be an effective way to treat climate anxiety by reducing barriers to action and connecting individual efforts to collective impact.",
          },
        ],
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Introduction" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Systematic reviews of climate anxiety describe three distinct pathways by which people are affected: direct exposure to acute weather events like heatwaves or flash floods, indirect exposure through disruptions to societal systems such as the global food chain and workforce, and, increasingly, a purely anticipatory pathway driven by awareness and media exposure rather than lived experience.",
          footnote: 1,
        },
        { text: "", footnote: 2 },
        {
          text:
            " The first two pathways represent tangible harms that require restorative intervention beyond the scope of this article. The third pathway, however, suggests that ",
        },
        {
          text: "a person never needs to experience harm firsthand to carry the psychological weight of climate change",
          bold: true,
        },
        { text: "." },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "What exactly constitutes “climate anxiety”? The Climate Change Anxiety Scale identifies four components: cognitive-emotional impairment (rumination, sleep disruption, intrusive thoughts), functional impairment (interference with work and relationships), personal experience, and behavioral engagement.",
          footnote: 3,
        },
        {
          text:
            " Critically, the strongest predictor of that last component—real behavior change—is not how anxious or impaired someone feels but instead trait-level environmental identity, followed by direct personal experience. Affective distress and functional impairment, the symptoms we most associate with “climate anxiety,” are seemingly unrelated to whether or not someone takes action. This somewhat counterintuitive finding suggests that those most committed to climate action are not the most worried or even the most directly impacted, but rather, those who feel the greatest connection to our environment and hold climate justice as a strong personal value.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "However, the scale and severity of climate change demands widespread, committed action. Barriers to action cluster around a few consistent themes: low perceived individual efficacy, a sense that one's own effort is a rounding error against a planetary problem, and a socioeconomic gradient in which privilege buys both awareness and indifference while disadvantage brings direct exposure without the bandwidth to act on it.",
          footnote: 4,
        },
        {
          text:
            " Political betrayal, or the sense that institutions have failed to act despite decades of warning, compounds this by eroding hope and one's sense of agency.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Further, one might ask: should we strive to treat climate anxiety as a distinct clinical pathology? Anxiety is a response to an environmental danger stimulus, and climate change is a very real environmental danger. ",
        },
        { text: "The goal is not to insulate people against feeling any level of concern", bold: true },
        {
          text:
            ", for we cannot solve this problem by numbing it away. Rather, we propose that the best treatment for climate anxiety is to reduce the barriers to climate action and connect individuals to broader, collective efforts with measurable impacts that people can identify with and relate to.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "We explore a specific, concrete intervention that sits at the intersection of two well-studied literatures: the psychology of exercise and the psychology of climate anxiety and action. We discuss whether combining them can act as a force multiplier that empowers people to mitigate their climate anxiety by taking real climate action.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Elexercise: Closing the Loop on Fitness" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The premise of elexercise—the act of producing electricity through exercise—is straightforward, but its psychological implications are not. Elexercise is ",
        },
        { text: "explicitly", italic: true },
        {
          text:
            " useful because the workout produces clean electricity that would otherwise come from the grid and therefore carry both a financial and a carbon emission cost. But the more interesting question is whether it's ",
        },
        { text: "implicitly", italic: true },
        { text: " useful. " },
        {
          text: "Does the physical act of generating clean power change how people relate to both exercise and climate action?",
          bold: true,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Effort from conventional workouts produces energy that is metabolized, dissipated as heat, and transferred into equipment; nothing external is created beyond the first-order effect of improved personal health. Elexercise closes that loop by creating a second-order output with social and environmental value. In doing so, it directly answers the climate anxiety literature's most stubborn finding: awareness and worry don't reliably translate into behavior because individual effort feels disconnected from any tangible outcome. The wattage from elexercise is not a policy promise or a distant emissions target, it is a number that goes up because a person just did tangibly useful work.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Climate anxiety is associated with solastalgia, or the distress of losing a sense of solace connected to one's home or environment.",
          footnote: 5,
        },
        {
          text:
            " Elexercise may offer a mechanism to rebuild the link in the other direction: a workout that is visibly useful to the environment reframes the gym itself as a site of environmental reciprocity rather than a purely self-directed space. The implications of this reframing show up at two levels, which structure the rest of this article: how it changes the ",
        },
        { text: "individual, internal relationship", bold: true },
        { text: " to climate anxiety and self-efficacy and how it changes the " },
        { text: "interpersonal, group-level dynamics", bold: true },
        { text: " that may matter even more than individual belief." },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Individual: Efficacy, Identity, and Audience" }],
    },
    {
      type: "subheading",
      content: [{ text: "Closing the efficacy gap" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Exercise reliably improves several distinct types of self-efficacy: task efficacy (can I do the exercise itself), coping efficacy (can I push through barriers), and scheduling efficacy (can I make time for this). Task efficacy specifically predicts ",
        },
        { text: "intention", italic: true },
        { text: " to exercise, while scheduling and coping efficacy predict actual " },
        { text: "maintenance", italic: true },
        { text: " of behavior over time.", footnote: 6 },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Climate psychology draws a similar distinction between self-efficacy (can I personally do something) and response efficacy (will what I do actually matter).",
          footnote: 7,
        },
        {
          text:
            " Individual climate action is associated with strong perceived individual efficacy, but that efficacy is hard to sustain when the individual's action produces little to no perceptible feedback. This may help explain why, per the Climate Change Anxiety Scale, affective and cognitive climate distress correlate poorly with actual behavioral engagement.",
          footnote: 3,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Elexercise offers a structural fix by harnessing the well-established efficacy-building mechanism of exercise, and attaching climate response efficacy directly to it.",
          bold: true,
        },
        {
          text:
            " Every completed set becomes both a task-efficacy event (“I can do this workout”) and a response-efficacy event (“this workout did something real”). This kind of pairing has precedent outside the climate context: smokers randomized to cognitive-behavioral therapy plus vigorous exercise were twice as likely to remain abstinent at a three-month follow-up compared to CBT alone, suggesting that layering a structured behavioral goal onto exercise can meaningfully shift outcomes in an entirely different domain.",
          footnote: 8,
        },
      ],
    },
    {
      type: "subheading",
      content: [{ text: "Cultivating environmental identity" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "The finding that trait-level environmental identity is the strongest predictor of climate behavioral engagement",
          footnote: 3,
        },
        {
          text:
            " poses a natural design question: is elexercise better positioned as a “climate-minded business for gym people” or a “gym for climate-minded people”? Individuals who strongly identify with the environment will likely be the earliest and most durable adopters, self-selecting into a space that lets them act in accordance with an identity they already hold. But it is worth considering whether repeated participation in a visibly impactful, socially reinforced activity can ",
        },
        { text: "cultivate", italic: true },
        {
          text:
            " environmental identity in people who didn't walk in with it, thus turning the gym from an endpoint that rewards existing identity into a starting point that builds new identity.",
        },
      ],
    },
    {
      type: "subheading",
      content: [{ text: "Education opportunities" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Elexercise also creates a natural setting for climate education that most fitness spaces lack. A generator-and-battery system installed in visible, understandable hardware is inherently more legible than an abstract carbon-offset number. Cause and effect are literally wired together. This creates an opportunity to connect interested people to further educational resources, such as how the local grid's carbon intensity varies by region, what a given session's kWh output actually displaces, how a specific piece of hardware works, etc. ",
        },
        { text: "If people could ", bold: true },
        { text: "physically feel", bold: true, italic: true },
        {
          text: " the amount of work required to power their daily habits, would they be more willing to change them?",
          bold: true,
        },
        {
          text:
            " This form of education would meet people where their attention already is rather than competing for a separate moment of engagement with a climate message.",
        },
      ],
    },
    {
      type: "subheading",
      content: [{ text: "Audience-specific effects" }],
    },
    {
      type: "paragraph",
      content: [
        { text: "Two populations deserve particular attention. " },
        { text: "Women", bold: true },
        { text: " show consistently higher climate worry than men even after controlling for baseline mental health,", footnote: 4 },
        {
          text: " a pattern that is well-replicated.",
        },
        {
          text:
            " In developing the Climate Change Worry Scale, gender and political orientation accounted for roughly 20% of the variance in an individual's worry score.",
          footnote: 9,
        },
        {
          text:
            " Additionally, women's reported exercise motivators skew toward social factors and tension release rather than the fitness-and-health framing that motivates men.",
          footnote: 8,
        },
        {
          text:
            " That combination—heightened climate concern plus a motivational profile centered on social connection—suggests elexercise's community and shared-purpose framing may resonate especially strongly for women.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Youth", bold: true },
        {
          text: ", meanwhile, sit at another collision point, as this is a population prone to new mental health onset due to their development stage, while being raised in an era of overly saturated media exposure to climate messaging",
          footnote: 1,
        },
        { text: "", footnote: 2 },
        {
          text:
            ". Younger cohorts express a strong preference for more creative, novel, and multilevel forms of action compared with older adults, who gravitate towards a narrower, more conventional set of behaviors that are less visibly impactful (e.g. recycling; unplugging appliances) or have higher barriers to entry (e.g. switching to an electric vehicle; installing rooftop solar).",
          footnote: 10,
        },
        {
          text:
            " Worry itself tracks this developmental window closely—cross-sectional data shows that climate worry climbs from age 15 through 25 before leveling off, with pandemic-era young adults already predisposed to elevated baseline levels before entering this critical window.",
          footnote: 4,
        },
        {
          text:
            " A genuinely novel form of climate action like elexercise may have disproportionate appeal to a generation looking for ways to act that don't map onto their parents' protest-or-consumer-choice playbook.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Community as a Force Multiplier" }],
    },
    {
      type: "paragraph",
      content: [
        { text: "Climate psychology literature is extraordinarily consistent on one point: " },
        { text: "collective mechanisms outperform individual ones", bold: true },
        { text: ". Group-based emotions lead people to appraise " },
        { text: "collective", italic: true },
        {
          text:
            " efficacy rather than individual efficacy, which matters because individual costs frequently outweigh individual benefit, and individual efficacy for a planetary-scale problem is (appropriately) perceived as low.",
          footnote: 11,
        },
        {
          text:
            " When people believe that their individual effort contributes to a larger group's goal, that belief alone can overcome the sense of helplessness that individual action, considered in isolation, tends to produce.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "One study found that engaging in collective—but not individual—climate action reduces the relationship between climate anxiety and depressive symptoms, suggesting that collective action taps into something distinct from general affective coping: a felt sense that one's specific contribution to a shared effort actually mattered.",
          footnote: 12,
        },
        {
          text:
            " Acting in isolation on a problem this large tends to reinforce hopelessness rather than resolve it. Acting with others reframes the same effort as part of something with real scale. Neighborhood-level climate action research finds that working together not only motivates through social norms but also strengthens both collective and, indirectly, individual efficacy.",
          footnote: 13,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Exercise's existing social infrastructure could therefore be quite an asset. Group fitness, team sports, and gym communities are already default social activities for a large share of participants; elexercise doesn't need to invent communal exercise, it needs to channel an existing social behavior toward a shared, visible, group-level output. Imagine if a workout class or gym cohort could actively see its combined power and energy generation, translated directly into carbon emissions offset in the same way an individual sees their own HR or calorie count on a treadmill. Given that neighborhood-level social capital and “arenas for joined action” are specifically identified as levers for strengthening collective climate intention,",
          footnote: 13,
        },
        {
          text: " a physical, recurring, socially embedded space like a gym, which already produces tangible amounts of ‘work/power/energy’ that goes unused, is an ideal candidate to present itself as an arena for collective climate action.",
          bold: true,
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Accessibility and governance" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The socioeconomic dimension of eco-anxiety research is unambiguous: privilege buys access to knowledge that improves awareness, as well as the resources to act on it. However privilege also correlates with indifference; meanwhile, the socioeconomically disadvantaged tend to experience the most direct exposure while not having the information, physical means, or mental bandwidth to engage in action.",
          footnote: 4,
        },
        {
          text:
            " A climate-minded gym pitched purely as a fitness amenity risks reinforcing these effects, reaching only those with the schedule flexibility and disposable income to prioritize it.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The more promising framing, drawn directly from this concern, is to treat elexercise less as a standalone product and more as one component of a multidomain resilience hub. By bundling elexercise with things lower-resource communities urgently need (e.g., education programming, access to affordable and healthy food, etc.), the idealized resilience hub may serve as a low cost social safety net, collectively funded and operated by the power of exercise. Positioned this way, elexercise doesn't compete with someone's hierarchy of needs—it rides alongside services that meet those needs and lends them an additional, tangible climate and fitness benefit. Gyms already have many components that are necessary for resilience hubs: space, water, medical equipment, bathroom capacity (including showers), strong HVAC systems, and locations near populace.",
          footnote: 18,
        },
        {
          text: " With backup power generation and storage, gyms could be the ideal facility to provide community resilience during emergencies.",
          bold: true,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The governance dimension borrows from local climate policy research: cities that lead on climate action tend to influence peer cities horizontally more than they're influenced vertically by state or national policy.",
          footnote: 14,
        },
        {
          text:
            " A gym, or network of gyms expanding horizontally across the country, could plausibly play an analogous “guiding” role at the community level—modeling a behavior, building local capacity, and creating a peer-to-peer influence effect—while individual members take on the “follower” role of extending that behavior into their own lives through what they learn on-site.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Potential harms and mitigation strategies" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Any intervention that combines fitness, gamification, and a moralized cause carries real risk. Proactively predicting these harmful effects could help mitigate their impacts.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Overtraining and exercise dependence.", bold: true },
        {
          text:
            " Excessive exercise can become a primary behavioral dependence or a secondary manifestation of disordered eating, with physiological and psychological withdrawal on cessation.",
          footnote: 15,
        },
        {
          text:
            " If elexercise adds a climate-guilt-driven incentive to “do more,” it risks nudging susceptible individuals past this threshold in ways that a purely fitness-motivated gym would not.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Body image and social comparison.", bold: true },
        {
          text:
            " Exposure to fitness-oriented social media imagery has been shown to decrease appearance-based self-esteem and body satisfaction, even as it increases stated motivation to exercise.",
          footnote: 16,
        },
        {
          text:
            " Gamification elements (leaderboards, badges, visible progress tiers) can be motivating for some or a source of comparison-driven distress for others. This is especially true when paired with maladaptive perfectionism—a pattern of unattainable goals and inability to feel satisfied regardless of performance—which has been identified as a mechanistic link between problematic exercise, body image concerns, and disordered eating.",
          footnote: 17,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        { text: "Climate-impact framing itself as a harm vector.", bold: true },
        {
          text:
            " Perhaps the least obvious risk is in how the climate benefit is communicated. If messaging implies that meaningful climate reversal is achievable through personal effort, it could set an unattainable bar that effectively extends maladaptive perfectionism to environmental impact. On the flip side, it is also possible that demonstrating the relative weak power of an individual's exercise could create a depressing or paralyzing effect, thereby reducing continued engagement.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [{ text: "Practical mitigations.", bold: true }],
    },
    {
      type: "list",
      items: [
        [
          {
            text: "Provide alternative pathways for individuals who already show clinically significant exercise-related pathology.",
          },
        ],
        [
          {
            text:
              "Create climate messaging that is honest and focused on local, marginal, additive impact; “helping” as a collective rather than “fixing” as an individual.",
          },
        ],
        [{ text: "Allow people to opt out of the gamified incentive structures." }],
        [
          {
            text:
              "Connect people to active mitigation resources, such as therapy. Group-based therapy within the community of like minded people could be especially beneficial.",
          },
        ],
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Research Gaps" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text: "Psychological outcomes from combining energy-generating exercise with climate-action have not been formally studied.",
          bold: true,
        },
        {
          text:
            " Everything in this article is a synthesis of two adjacent, well-established literatures rather than direct evidence for the combined intervention, and several questions can only be answered empirically:",
        },
      ],
    },
    {
      type: "list",
      items: [
        [{ text: "Does elexercise change the underlying trait-level relationship someone has with exercise?" }],
        [
          {
            text:
              "Is there a measurable interaction between exercise self-efficacy and climate response-efficacy? Does gaining confidence in one domain transfer to the other, or do they operate as parallel, non-interacting tracks?",
          },
        ],
        [
          {
            text:
              "Where is the participation threshold? Does knowing that even a single session contributes marginally increase adoption among people who would otherwise not exercise at all, or do people only engage if they believe they can commit to a climate-significant volume?",
          },
        ],
        [{ text: "How is the behavioral pattern different between climate-motivated and fitness-motivated participants?" }],
        [
          {
            text:
              "How does the effect vary by level of baseline climate activism, individual climate efficacy, and climate worry? Is this fundamentally a tool that serves people who are already climate-engaged, fitness-engaged, or genuinely both?",
          },
        ],
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "A natural next step is a small acceptability-and-feasibility study embedded in a real elexercise deployment. This research study could speak to adoption, short-term maintenance, and self-reported changes in both exercise and climate self-efficacy before attempting anything more resource-intensive like a controlled trial.",
        },
      ],
    },
    {
      type: "subtitle",
      content: [{ text: "Conclusion" }],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Climate psychology has identified why individual action feels ineffective and why collective framing works best. Exercise psychology has also built a rich understanding of efficacy, motivation, identity, and the social infrastructure that makes sustained behavior change possible. ",
        },
        {
          text:
            "Neither literature was built with the other in mind, but, examined side by side, they describe a remarkably complementary set of strengths and challenges.",
          bold: true,
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Elexercise is a concrete attempt to harness that synergy by empowering climate action that provides an immediate, embodied, unit of measurable output that adds up through collective effort, while also giving exercise a second-order productive outcome beyond individual health. We propose that elexercise could therefore be an effective way to treat climate anxiety rather than suppress it.",
        },
      ],
    },
  ],
  references: [
    {
      id: 1,
      citation:
        "Niedzwiedz, C. L., Kankawale, S. M., & Katikireddi, S. V. (2025). A systematic review of social, political, and geographic factors associated with eco-anxiety in children and young people. Nature Mental Health.",
      url: "https://doi.org/10.1038/s44220-025-00550-z",
    },
    {
      id: 2,
      citation:
        "Niedzwiedz, C. L., Olsen, J. R., Rizeq, J., et al. (2025). Coming to terms with climate change: A glossary for climate change impacts on mental health and well-being. Journal of Epidemiology and Community Health, 79(4), 295–301.",
      url: "https://doi.org/10.1136/jech-2024-222716",
    },
    {
      id: 3,
      citation:
        "Clayton, S., & Karazsia, B. T. (2020). Development and validation of a measure of climate change anxiety. Journal of Environmental Psychology, 69, Article 101434.",
      url: "https://doi.org/10.1016/j.jenvp.2020.101434",
    },
    {
      id: 4,
      citation:
        "Kankawale, S. M., & Niedzwiedz, C. L. (2023). Eco-anxiety among children and young people: A systematic review of social, political, and geographic determinants. medRxiv.",
      url: "https://doi.org/10.1101/2023.12.19.23300198",
    },
    {
      id: 5,
      citation:
        "Cianconi, P., Hanife, B., Grillo, F., Betrò, S., Lesmana, C. B. J., & Janiri, L. (2023). Eco-emotions and psychoterratic syndromes: Reshaping mental health assessment under climate change. The Yale Journal of Biology and Medicine, 96(2), 211–226.",
      url: "https://doi.org/10.59249/EARX2427",
    },
    {
      id: 6,
      citation:
        "Ghayour Baghbani, S. M., Arabshahi, M., & Saatchian, V. (2023). The impact of exercise interventions on perceived self-efficacy and other psychological outcomes in adults: A systematic review and meta-analysis. European Journal of Integrative Medicine, 62, Article 102281.",
      url: "https://doi.org/10.1016/j.eujim.2023.102281",
    },
    {
      id: 7,
      citation: "Betrò, S. (2024). From eco-anxiety to eco-hope: Surviving the climate change threat. Frontiers in Psychiatry, 15, Article 1429571.",
      url: "https://doi.org/10.3389/fpsyt.2024.1429571",
    },
    {
      id: 8,
      citation:
        "Sherwood, N. E., & Jeffery, R. W. (2000). The behavioral determinants of exercise: Implications for physical activity interventions. Annual Review of Nutrition, 20, 21–44.",
      url: "https://doi.org/10.1146/annurev.nutr.20.1.21",
    },
    {
      id: 9,
      citation: "Stewart, A. E. (2021). Psychometric properties of the Climate Change Worry Scale. International Journal of Environmental Research and Public Health, 18(2), Article 494.",
      url: "https://doi.org/10.3390/ijerph18020494",
    },
    {
      id: 10,
      citation:
        "Sangervo, J., Jylhä, K. M., & Pihkala, P. (2022). Climate anxiety: Conceptual considerations, and connections with climate hope and action. Global Environmental Change, 76, Article 102569.",
      url: "https://doi.org/10.1016/j.gloenvcha.2022.102569",
    },
    {
      id: 11,
      citation: "Brosch, T. (2025). From individual to collective climate emotions and actions: A review. Current Opinion in Behavioral Sciences, 61, Article 101466.",
      url: "https://doi.org/10.1016/j.cobeha.2024.101466",
    },
    {
      id: 12,
      citation:
        "Schwartz, S. E. O., Benoit, L., Clayton, S., Parnes, M. F., Swenson, L., & Lowe, S. R. (2023). Climate change anxiety and mental health: Environmental activism as buffer. Current Psychology, 42, 16708–16721.",
      url: "https://doi.org/10.1007/s12144-022-02735-6",
    },
    {
      id: 13,
      citation:
        "Klöckner, C. A., Brenner-Fliesser, M., Carrus, G., De Gregorio, E., Löfström, E., Luketina, R., Niemi, A., Pihkola, H., Schwarzinger, S., Similä, L., & Sokka, L. (2024). Climate actions on the neighbourhood level—Individual, collective, cultural, and socio-structural factors. PLOS Climate, 3(11), Article e0000424.",
      url: "https://doi.org/10.1371/journal.pclm.0000424",
    },
    {
      id: 14,
      citation:
        "Fuhr, H., Hickmann, T., & Kern, K. (2018). The role of cities in multi-level climate governance: Local climate policies and the 1.5°C target. Current Opinion in Environmental Sustainability, 30, 1–6.",
      url: "https://doi.org/10.1016/j.cosust.2017.10.006",
    },
    {
      id: 15,
      citation:
        "Adams, J., & Kirkby, R. (2002). Exercise dependence and overtraining: The physiological and psychological consequences of excessive exercise. Sports Medicine, Training and Rehabilitation, 10(3), 199–222.",
      url: "https://doi.org/10.1080/10578310210395",
    },
    {
      id: 16,
      citation:
        "Tiggemann, M., & Zaccardo, M. (2015). “Exercise to be fit, not skinny”: The effect of fitspiration imagery on women's body image. Body Image, 15, 61–67.",
      url: "https://doi.org/10.1016/j.bodyim.2015.06.003",
    },
    {
      id: 17,
      citation: "Edwards, C. D., et al. (2024). A perfect storm for athletes. Advances in Psychiatry and Behavioral Health.",
      url: "https://doi.org/10.1016/j.ypsc.2024.04.001",
    },
    {
      id: 18,
      citation:
        "Farley, A., Belnap, H., & Parvania, M. (2024). Resilience hubs: Bolstering the grid and empowering communities. IEEE Power and Energy Magazine, 22(4), 38–48.",
      url: "https://doi.org/10.1109/MPE.2024.3412876",
    },
  ],
};
