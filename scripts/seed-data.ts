/**
 * Seed content for Phase 6.
 *
 * IMPORTANT: this is plain-language awareness text written as a starting
 * point, based on the cited public fact sheets. An administrator should
 * review it against the linked sources before the app is used publicly.
 */

const NHP = { sourceName: "National Health Portal India", sourceUrl: "https://nhp.gov.in" };
const NCDC = { sourceName: "National Centre for Disease Control", sourceUrl: "https://ncdc.mohfw.gov.in" };
const who = (name: string, path: string) => ({
  sourceName: `WHO: ${name}`,
  sourceUrl: `https://www.who.int/news-room/fact-sheets/detail/${path}`,
});

export const topics = [
  {
    name: "Dengue",
    slug: "dengue",
    kind: "Mosquito-borne",
    glance: [{ label: "Spread by", value: "Aedes mosquito" }, { label: "Appears after", value: "4 to 10 days" }, { label: "Peak season", value: "Monsoon" }, { label: "Vaccine", value: "Limited" }],
    category: "disease",
    icon: "bug",
    summary: "A mosquito-borne viral fever that is common during and after the monsoon.",
    overview:
      "Dengue is a viral infection spread to people through the bite of infected Aedes mosquitoes. Most people recover with rest and fluids, but some develop severe dengue, which can become life-threatening without prompt medical care.",
    symptoms: [
      "Sudden high fever",
      "Severe headache and pain behind the eyes",
      "Muscle, bone and joint pain",
      "Nausea and vomiting",
      "Skin rash and swollen glands",
    ],
    causes: [
      "Infection with the dengue virus",
      "Spread by the bite of infected Aedes mosquitoes, which bite mostly during the day",
      "Aedes mosquitoes breed in clean, stagnant water in and around homes",
    ],
    prevention: [
      "Empty and scrub coolers, buckets, flower pots and old tyres at least once a week",
      "Cover water storage containers tightly",
      "Use mosquito repellent and wear full-sleeved clothes, especially during the day",
      "Use window screens and bed nets, particularly for infants and anyone who is sick",
      "Support community fogging and clean-up drives in your area",
    ],
    whenToSeekHelp: [
      "See a doctor if you have a high fever for more than a day or two in dengue season",
      "Get urgent care if, as the fever settles, you have severe stomach pain, repeated vomiting, bleeding from the gums or nose, blood in vomit or stool, rapid breathing, or extreme tiredness or restlessness",
      "Ask a doctor before taking any medicine. Some pain relievers can increase bleeding risk",
    ],
    mythsVsFacts: [
      { myth: "Dengue spreads from person to person by touch or coughing.", fact: "It spreads only through the bite of an infected mosquito." },
      { myth: "Papaya leaf juice cures dengue.", fact: "There is no specific cure. Care focuses on rest, fluids and monitoring by a doctor." },
    ],
    sourceRefs: [who("Dengue and severe dengue", "dengue-and-severe-dengue"), NCDC, NHP],
  },
  {
    name: "Malaria",
    slug: "malaria",
    kind: "Mosquito-borne",
    glance: [{ label: "Spread by", value: "Anopheles mosquito" }, { label: "Appears after", value: "About 10 to 15 days" }, { label: "Peak season", value: "Monsoon and after" }, { label: "Vaccine", value: "Limited" }],
    category: "disease",
    icon: "droplets",
    summary: "A parasitic infection spread by Anopheles mosquitoes. It is preventable and curable.",
    overview:
      "Malaria is caused by Plasmodium parasites passed on by the bites of infected female Anopheles mosquitoes. It is both preventable and curable when found early, but can become serious quickly if treatment is delayed.",
    symptoms: [
      "Fever with chills and sweating, sometimes in repeating cycles",
      "Headache and body aches",
      "Nausea and vomiting",
      "Tiredness and weakness",
    ],
    causes: [
      "Plasmodium parasites in the blood",
      "Spread by infected female Anopheles mosquitoes, which bite mainly from evening to early morning",
      "Rarely, through infected blood or from mother to baby",
    ],
    prevention: [
      "Sleep under an insecticide-treated mosquito net",
      "Use repellents and cover arms and legs in the evening",
      "Remove or cover collections of standing water near the home",
      "Allow health workers to carry out indoor spraying where it is offered",
      "If you have fever in a malaria area, get a blood test promptly",
    ],
    whenToSeekHelp: [
      "Get tested at a health facility for any fever, especially in or after travel to a malaria area",
      "Seek emergency care for confusion, seizures, difficulty breathing, yellow eyes or skin, or very dark urine",
    ],
    mythsVsFacts: [
      { myth: "Malaria spreads by touching or sharing food with a patient.", fact: "It spreads through mosquito bites, not casual contact." },
      { myth: "Every fever is malaria, so treatment can start without a test.", fact: "Many illnesses cause fever. A blood test confirms malaria so the right treatment is given." },
    ],
    sourceRefs: [who("Malaria", "malaria"), NCDC, NHP],
  },
  {
    name: "Tuberculosis",
    slug: "tuberculosis",
    kind: "Airborne infection",
    glance: [{ label: "Spread by", value: "Coughs and sneezes" }, { label: "Appears after", value: "Weeks to months" }, { label: "Peak season", value: "Year-round" }, { label: "Vaccine", value: "BCG (in childhood)" }],
    category: "disease",
    icon: "wind",
    summary: "A bacterial infection that mainly affects the lungs. It is curable with a full course of treatment.",
    overview:
      "Tuberculosis (TB) is caused by bacteria that usually attack the lungs. It spreads through the air when a person with lung TB coughs, sneezes or speaks. TB is curable, and in India diagnosis and treatment are available free at government health facilities.",
    symptoms: [
      "Cough lasting two weeks or more",
      "Fever, especially in the evening, and night sweats",
      "Unexplained weight loss and loss of appetite",
      "Blood in the sputum or chest pain",
      "Constant tiredness",
    ],
    causes: [
      "Infection with Mycobacterium tuberculosis bacteria",
      "Spread through droplets in the air from a person with active lung TB",
      "Higher risk with poor nutrition, diabetes, HIV, tobacco use and crowded, poorly ventilated living spaces",
    ],
    prevention: [
      "Get a persistent cough checked early so treatment can start",
      "Complete the full TB treatment course, as stopping early can cause drug-resistant TB",
      "Cover your mouth when coughing and keep rooms well ventilated",
      "Ensure newborns receive the BCG vaccine as per the immunisation schedule",
      "Eat a nutritious diet and avoid tobacco",
    ],
    whenToSeekHelp: [
      "See a doctor or visit a government health centre if you have a cough for two weeks or more",
      "Seek care urgently if you cough up blood or have difficulty breathing",
    ],
    mythsVsFacts: [
      { myth: "TB spreads by sharing utensils or touching a patient.", fact: "It spreads through the air from people with active lung TB, not through casual touch or shared dishes." },
      { myth: "TB cannot be cured.", fact: "TB is curable with the full, regular course of medicines prescribed by a doctor." },
      { myth: "You can stop medicines once you feel better.", fact: "Stopping early lets the bacteria return and become resistant. Always finish the course." },
    ],
    sourceRefs: [who("Tuberculosis", "tuberculosis"), NHP],
  },
  {
    name: "Diabetes",
    slug: "diabetes",
    kind: "Long-term condition",
    glance: [{ label: "Spread by", value: "Not contagious" }, { label: "Develops", value: "Gradually" }, { label: "Peak season", value: "Year-round" }, { label: "Vaccine", value: "None" }],
    category: "disease",
    icon: "activity",
    summary: "A long-term condition in which blood sugar stays too high. Healthy habits can prevent or delay type 2.",
    overview:
      "Diabetes occurs when the body cannot make enough insulin, or cannot use it well, so sugar builds up in the blood. Over time this can damage the heart, kidneys, eyes and nerves. Type 2 diabetes is the most common and is strongly linked to lifestyle and weight.",
    symptoms: [
      "Feeling very thirsty and passing urine often",
      "Increased hunger and unusual tiredness",
      "Blurred vision",
      "Cuts and wounds that heal slowly",
      "Tingling or numbness in hands or feet, and unexplained weight loss",
    ],
    causes: [
      "Type 1: the body's immune system damages insulin-producing cells",
      "Type 2: linked to excess weight, low physical activity, an unhealthy diet, age and family history",
      "Gestational diabetes can appear during pregnancy",
    ],
    prevention: [
      "Stay at a healthy weight",
      "Be physically active, aiming for about 150 minutes of moderate activity a week",
      "Eat plenty of vegetables, fruit, whole grains and pulses, and limit sugary drinks and sweets",
      "Avoid tobacco",
      "Get your blood sugar checked regularly if you are over 30 or have risk factors",
    ],
    whenToSeekHelp: [
      "See a doctor for a blood sugar test if you notice the symptoms above or have risk factors",
      "Seek emergency care for confusion, extreme drowsiness, fruity-smelling breath, repeated vomiting or difficulty breathing",
      "If you already have diabetes, do not change or stop your medicines without your doctor's advice",
    ],
    mythsVsFacts: [
      { myth: "Eating sugar directly causes diabetes.", fact: "Diabetes is linked to overall diet, excess weight, inactivity and family history, though sugary foods and drinks add to the risk." },
      { myth: "People with diabetes can never eat sweets.", fact: "A balanced meal plan with portion control is key. A doctor or dietitian can guide you." },
      { myth: "Diabetes is contagious.", fact: "It cannot be passed from one person to another." },
    ],
    sourceRefs: [who("Diabetes", "diabetes"), NHP],
  },
  {
    name: "Hypertension",
    slug: "hypertension",
    kind: "Long-term condition",
    glance: [{ label: "Spread by", value: "Not contagious" }, { label: "Symptoms", value: "Often none" }, { label: "Peak season", value: "Year-round" }, { label: "Vaccine", value: "None" }],
    category: "disease",
    icon: "stethoscope",
    summary: "High blood pressure is often silent but raises the risk of heart attack, stroke and kidney disease.",
    overview:
      "Hypertension means the force of blood against artery walls is consistently too high. Many people feel nothing at all, which is why it is called a silent condition. Regular checks are the only reliable way to know.",
    symptoms: [
      "Usually none, which is why regular checks matter",
      "Sometimes headaches, dizziness or nosebleeds, but these are not reliable signs",
      "Very high pressure may cause chest pain, shortness of breath, vision problems or confusion",
    ],
    causes: [
      "Too much salt in the diet",
      "Being overweight and not getting enough physical activity",
      "Tobacco use and harmful alcohol use",
      "Stress, ageing, family history and some kidney conditions",
    ],
    prevention: [
      "Cut down on salt, aiming for less than 5 grams (about one teaspoon) a day, including pickles, papad and packaged snacks",
      "Eat more fruit, vegetables and pulses",
      "Stay active and keep a healthy weight",
      "Avoid tobacco and limit alcohol",
      "Have your blood pressure checked regularly, at least once a year after age 30",
    ],
    whenToSeekHelp: [
      "See a doctor if your readings are repeatedly high, for example 140/90 mmHg or above",
      "Seek emergency care for very high pressure with severe headache, chest pain, confusion, trouble speaking or weakness on one side",
      "If you take blood pressure medicine, do not stop it just because you feel fine",
    ],
    mythsVsFacts: [
      { myth: "If I feel fine, my blood pressure must be normal.", fact: "High blood pressure often has no symptoms. Only a measurement can tell." },
      { myth: "Once my BP is normal, I can stop my medicine.", fact: "Normal readings usually mean the treatment is working. Stop only if your doctor says so." },
    ],
    sourceRefs: [who("Hypertension", "hypertension"), NHP],
  },
  {
    name: "Heart Disease",
    slug: "heart-disease",
    kind: "Long-term condition",
    glance: [{ label: "Spread by", value: "Not contagious" }, { label: "Develops", value: "Over many years" }, { label: "Peak season", value: "Year-round" }, { label: "Vaccine", value: "None" }],
    category: "disease",
    icon: "heart-pulse",
    summary: "Heart and blood vessel diseases are a leading cause of death, and many risks can be reduced.",
    overview:
      "Cardiovascular disease covers conditions of the heart and blood vessels, including heart attack and stroke. Most cases are linked to risk factors that can be reduced with healthy habits and early treatment.",
    symptoms: [
      "Chest pain, pressure or tightness",
      "Pain spreading to the arm, shoulder, neck, jaw or back",
      "Shortness of breath, cold sweat, nausea or light-headedness",
      "Unusual tiredness. Women may have milder or different symptoms",
    ],
    causes: [
      "High blood pressure, high cholesterol and diabetes",
      "Tobacco use and harmful alcohol use",
      "Unhealthy diet, physical inactivity and excess weight",
      "Family history and air pollution",
    ],
    prevention: [
      "Do not use tobacco in any form",
      "Eat less salt, fried food and trans fats, and more vegetables, fruit and whole grains",
      "Be active most days of the week",
      "Keep blood pressure, blood sugar and cholesterol in check with regular screening",
      "Manage stress and get enough sleep",
    ],
    whenToSeekHelp: [
      "Chest pain or pressure lasting more than a few minutes is an emergency. Call 112 or 108 immediately",
      "Do not wait or drive yourself if you suspect a heart attack or stroke",
    ],
    mythsVsFacts: [
      { myth: "Heart disease only affects older people.", fact: "It can affect younger adults too, especially with tobacco use, diabetes, high blood pressure or family history." },
      { myth: "Heart disease is a men's problem.", fact: "It is a major cause of death in women as well." },
    ],
    sourceRefs: [who("Cardiovascular diseases", "cardiovascular-diseases-(cvds)"), NHP],
  },
  {
    name: "Seasonal Illnesses",
    slug: "seasonal-illnesses",
    kind: "Common infections",
    glance: [{ label: "Spread by", value: "Coughs and sneezes" }, { label: "Appears after", value: "1 to 3 days" }, { label: "Peak season", value: "Monsoon and winter" }, { label: "Vaccine", value: "Flu vaccine" }],
    category: "disease",
    icon: "thermometer",
    summary: "Flu, the common cold and viral fever are common as seasons change. Most settle with rest.",
    overview:
      "Seasonal flu, the common cold and other viral fevers spread easily when the weather changes. Most healthy people recover at home in a week or so. Some groups, such as young children, older adults, pregnant women and people with long-term conditions, are at higher risk of complications.",
    symptoms: [
      "Fever or feeling feverish",
      "Cough, sore throat and runny or blocked nose",
      "Body ache, headache and tiredness",
    ],
    causes: [
      "Viruses spread through droplets when an infected person coughs or sneezes",
      "Touching contaminated surfaces and then your face",
    ],
    prevention: [
      "Wash hands often with soap and water for at least 20 seconds",
      "Cover your mouth and nose with a tissue or your elbow when coughing or sneezing",
      "Stay home when unwell and avoid crowded places when ill",
      "Ask your doctor about the yearly flu vaccine if you are in a higher-risk group",
      "Rest, drink plenty of fluids and eat well",
    ],
    whenToSeekHelp: [
      "See a doctor if the fever lasts more than three days or keeps coming back",
      "Seek urgent care for difficulty breathing, chest pain, confusion, bluish lips or persistent vomiting",
      "Take extra care for infants, older adults, pregnant women and people with long-term conditions, and consult a doctor early",
    ],
    mythsVsFacts: [
      { myth: "Antibiotics cure colds and flu.", fact: "Colds and flu are caused by viruses, and antibiotics do not work against viruses. Take antibiotics only if a doctor prescribes them." },
      { myth: "Getting wet or feeling cold causes a cold.", fact: "Colds are caused by viruses, though cold weather means more time indoors together, which helps them spread." },
    ],
    sourceRefs: [who("Influenza (seasonal)", "influenza-(seasonal)"), NCDC, NHP],
  },
];

export const tips = [
  { category: "hygiene", text: "Wash your hands with soap and water for at least 20 seconds before eating and after using the toilet." },
  { category: "hygiene", text: "Cover your mouth and nose with a tissue or your elbow when you cough or sneeze." },
  { category: "prevention", text: "Empty and scrub water coolers, buckets and flower pot trays once a week to stop mosquitoes from breeding." },
  { category: "prevention", text: "Sleep under a mosquito net, especially in the evening hours in malaria-prone areas." },
  { category: "nutrition", text: "Fill half your plate with vegetables and fruit, and choose whole grains and pulses more often." },
  { category: "nutrition", text: "Cut down on salt. Pickles, papad and packaged snacks add more than you think." },
  { category: "nutrition", text: "Drink clean, safe water through the day. Boil or filter it if you are unsure of the source." },
  { category: "activity", text: "Aim for about 30 minutes of brisk walking or other moderate activity on most days." },
  { category: "activity", text: "Break up long periods of sitting with a short walk or stretch every hour." },
  { category: "checkups", text: "Get your blood pressure and blood sugar checked regularly, even if you feel healthy." },
  { category: "checkups", text: "A cough that lasts two weeks or more should be checked for TB at a health centre." },
  { category: "mental-wellbeing", text: "Talking to someone you trust helps. If you feel overwhelmed, reach out to a health professional." },
  { category: "vaccination", text: "Keep your child's immunisation card up to date and follow the national schedule." },
  { category: "tobacco", text: "Quitting tobacco at any age lowers your risk of heart disease, lung disease and cancer." },
];

/** Window = [startMonth/startDay, endMonth/endDay]. Years are resolved at seed time. */
export const campaignTemplates = [
  {
    title: "World Diabetes Day",
    description: "Learn about diabetes risk, healthy eating and why regular blood sugar checks matter. Observed every year on 14 November.",
    topicTags: ["diabetes"],
    start: [11, 1],
    end: [11, 30],
  },
  {
    title: "World Heart Day",
    description: "Know the risk factors for heart disease and simple steps to protect your heart. Observed every year on 29 September.",
    topicTags: ["heart-disease", "hypertension"],
    start: [9, 15],
    end: [9, 30],
  },
  {
    title: "World TB Day",
    description: "Know the symptoms of TB, where to get free testing and treatment, and why completing treatment matters. Observed every year on 24 March.",
    topicTags: ["tuberculosis"],
    start: [3, 10],
    end: [3, 31],
  },
  {
    title: "World Hypertension Day",
    description: "Check your blood pressure and learn how salt, stress and inactivity affect it. Observed every year on 17 May.",
    topicTags: ["hypertension"],
    start: [5, 10],
    end: [5, 20],
  },
  {
    title: "Monsoon Mosquito-Proofing Drive",
    description: "Dengue and malaria rise in the rainy season. Clear standing water weekly, cover containers and use nets and repellents.",
    topicTags: ["dengue", "malaria"],
    start: [6, 1],
    end: [10, 31],
  },
  {
    title: "Winter Cough and Cold Care",
    description: "Practise hand washing and cough etiquette, and know when a fever or cough needs a doctor.",
    topicTags: ["seasonal-illnesses"],
    start: [11, 15],
    end: [2, 28],
  },
];
