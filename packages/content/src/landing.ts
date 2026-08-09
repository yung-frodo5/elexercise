import type { Article } from "./types";

export const landingArticle: Article = {
  slug: "what-is-elexercise",
  title: "What is elexercise?",
  authors: [{ name: "Noah Korotzer" }],
  body: [
    {
      type: "paragraph",
      content: [
        { text: "Elexercise takes aim at a global-scale absurdity: " },
        { text: "humans currently do an immense amount of useless work", bold: true },
        {
          text:
            ". Of course, it’s not completely useless. As our lives grow increasingly sedentary, we turn towards recreational exercise in order to live long, healthy lives. Exercise facilities all over the world offer a simple service: the opportunity to do work. Pedal to spin a wheel for a little while. Lift weights up and down, repeatedly. Climb up a wall, then climb back down. None of this work creates any productive output – at least, not yet.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The electric power sector is responsible for ~33% of global greenhouse gas (GHG) emissions. Gyms have some of the highest energy costs per square foot in commercial real estate because of power-intensive HVAC systems and cardio equipment (",
        },
        {
          text: "source",
          href: "https://blog.budderfly.com/gym-energy-costs-breakdown-what-drives-your-utility-bills-and-how-budderfly-cuts-them",
        },
        { text: "). Step back for a second and think about the fitness industry at large: " },
        { text: "we burn fossil fuels to generate electricity so that we can do useless work more comfortably", bold: true },
        { text: "." },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "Humans are weak generators, so we could not come close to generating enough electricity to meet our own total demand. Of course, any amount of clean electricity generated through elexercise is better than none, and it’s certainly better than exercise that consumes electricity (like running on a motorized treadmill). However, elexercise aims to reframe our relative weakness. ",
        },
        { text: "If we could ", bold: true },
        { text: "physically feel", bold: true, italic: true },
        {
          text: " how much work is required to generate the electricity we use, would it impact our consumption habits?",
          bold: true,
        },
        { text: " Could elexercise be a vehicle for education about electricity, climate, and sustainability?" },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          text:
            "The immense scale of climate change can feel paralyzing, especially at the individual level. It’s a problem we can only solve together, as a collective. Imagine a world wherein our exercise facilities (AKA our “do-controlled-work” facilities) are not only carbon-negative but also provide educational resources to connect communities with sustainable solutions. ",
        },
        {
          text: "Exercise already plays a pivotal role in our personal health. Could it help contribute to our planetary health, too?",
          bold: true,
        },
      ],
    },
    {
      type: "graphic",
      key: "what-is-elexercise-diagram",
      alt:
        "Animated diagram of a person doing a squat exercise connected to a generator, which charges a battery that powers a microinverter, a grow light, and small devices like a phone.",
    },
  ],
};
