/** Editorial guidance, independent of vacancy volume. Live hiring claims come from queries. */
export const CITY_GUIDES = {
  nicosia: {
    displayName: "Nicosia", slug: "nicosia", city: "Nicosia",
    description: "Find tech and IT jobs in Nicosia (Lefkosia), Cyprus. Compare software engineering, data, gaming and IT roles by employer, experience level and work arrangement.",
    heading: "Finding a technology role in Nicosia",
    paragraphs: [
      "Searching for work in the capital? Employers may describe their location as Nicosia or Lefkosia. Check the office address before applying: an office in the wider Nicosia district can mean a different commute from a city-centre role.",
      "For software and gaming applications, highlight the systems or products you have shipped and the tools you used. For data and IT positions, show how you improved reliability, reporting or security. Match those examples to the requirements in the actual vacancy rather than sending the same CV to every employer.",
      "A hybrid label does not specify how many days you will spend in the office. Ask about the team's working pattern, language requirements and interview format before committing to a commute or relocation. The current listings below are the source for which employers are hiring here today.",
    ],
    question: "Should I search for Nicosia or Lefkosia jobs?",
    answer: "Both names refer to the capital. Use Nicosia for this city page, and check each vacancy's office address for the exact workplace. Employers may use Lefkosia in their descriptions; a district location is not necessarily in the city centre.",
  },
  limassol: {
    displayName: "Limassol", slug: "limassol", city: "Limassol",
    description: "Explore tech and IT jobs in Limassol (Lemesos), Cyprus. Find software, product, data and operations vacancies, with work arrangements and employer-published salaries where available.",
    heading: "Choosing a tech job in Limassol",
    paragraphs: [
      "Limassol is also called Lemesos. When comparing vacancies, look beyond the job title to the product and customers you would support. A role serving a trading platform, payment service or game can involve different reliability, security and delivery requirements.",
      "Ask whether the position includes on-call cover, market-hours support or shifts, and how that work is compensated. Engineering applicants can strengthen their application with examples of production performance, incident handling and collaboration with product or compliance teams when those skills are relevant to the advert.",
      "Confirm the office location and required attendance before comparing offers. For relocation, ask the employer what assistance is actually included and whether it applies to your circumstances. Compare gross annual base pay separately from bonuses, equity and relocation benefits; an undisclosed salary is not a published pay range.",
    ],
    question: "What should I check before accepting a Limassol tech role?",
    answer: "Confirm the office address, hybrid attendance, any shift or on-call duties and the gross base salary. If you need relocation support, ask what the employer offers and who qualifies. These details vary by vacancy and should be confirmed with the hiring team.",
  },
  larnaca: {
    displayName: "Larnaca", slug: "larnaca", city: "Larnaca",
    description: "Browse tech and IT jobs in Larnaca (Larnaka), Cyprus. Check current local vacancies, compare office and hybrid arrangements, and explore remote opportunities separately.",
    heading: "Planning your job search in Larnaca",
    paragraphs: [
      "Larnaca and Larnaka are alternative spellings you may encounter in job adverts. Check whether the workplace is in the city or elsewhere in the district, particularly when a position involves customer-site visits or regular office attendance.",
      "If today's local selection is small, start with the skills and experience that match the available role rather than narrowing immediately to one title. IT support, software development and data positions can have different responsibilities even when their titles look similar. Read the full requirements before applying.",
      "To widen your search while staying based in Larnaca, compare remote vacancies and the Nicosia and Limassol city pages. Those are separate searches: a job in another city is not automatically remote. Confirm office-day expectations, travel costs and whether the employer permits working from your location.",
    ],
    question: "How can I widen a Larnaca job search when few roles are listed?",
    answer: "Check the separate remote jobs page and compare Nicosia and Limassol vacancies. Keep location and work arrangement distinct: a hybrid role in another city can still require regular travel. You can also create a candidate account to set job alert preferences.",
  },
  paphos: {
    displayName: "Paphos", slug: "paphos", city: "Paphos",
    description: "Find tech and IT jobs in Paphos (Pafos), Cyprus. Browse current local opportunities and practical advice for comparing office-based roles with remote work.",
    heading: "Finding the right IT opportunity in Paphos",
    paragraphs: [
      "Employers may use Paphos or Pafos in their adverts. Confirm the actual office or customer-site location: a vacancy described by district can involve travel beyond the town. For support and systems roles, ask whether you need to visit client sites and whether transport is provided.",
      "When a local team advertises a broad technical role, ask how responsibilities are divided between development, infrastructure and support. Prepare concrete examples of the work the employer needs, such as maintaining a business application, troubleshooting an incident or delivering a web project.",
      "If no suitable local vacancy is open, explore remote jobs separately and consider Limassol roles only after checking attendance requirements. A remote label can still carry country, time-zone or occasional office restrictions. Confirm those terms before applying from Paphos.",
    ],
    question: "Can I work remotely while living in Paphos?",
    answer: "Check the separate remote jobs listings and confirm the employer's permitted work locations, time-zone expectations and any office visits. The Paphos city page lists roles assigned to Paphos; it does not assume that jobs elsewhere can be done remotely.",
  },
} as const;

export const CORE_CITIES = Object.values(CITY_GUIDES);
export type CitySlug = keyof typeof CITY_GUIDES;
