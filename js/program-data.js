const HOUSE_CAPACITY = 10;
const PROGRAM_DAYS = 90;
const PROGRAM_WEEKS = 12;

const SKILL_PILLARS = [
  { id: "discipline", name: "Discipline & Character", icon: "⚔️", color: "#c45c26" },
  { id: "faith", name: "Faith & Devotion", icon: "✝️", color: "#d4a853" },
  { id: "finance", name: "Money & Stewardship", icon: "💰", color: "#2d6a4f" },
  { id: "hygiene", name: "Hygiene & Grooming", icon: "🪮", color: "#58a6ff" },
  { id: "fitness", name: "Fitness & Health", icon: "💪", color: "#3fb950" },
  { id: "work", name: "Work Readiness", icon: "🔧", color: "#5c4d7a" },
  { id: "etiquette", name: "Etiquette & Communication", icon: "🤝", color: "#a67c2e" },
  { id: "lifeskills", name: "Life Skills", icon: "🏠", color: "#8b949e" },
];

const CURRICULUM = [
  {
    week: 1,
    phase: "Foundation",
    title: "Intake & Ground Rules",
    focus: "Establish house order, faith foundation, and personal accountability.",
    modules: ["House orientation & rules", "Personal testimony & goals", "Morning routine establishment", "Vice accountability setup", "Room & space standards"],
    daily: ["5:30 AM Wake & devotion", "6:00 AM Fitness", "Chores & hygiene inspection", "Evening group reflection"],
  },
  {
    week: 2,
    phase: "Foundation",
    title: "Discipline & Order",
    focus: "Build self-control through structure, punctuality, and obedience to routine.",
    modules: ["Time management", "Task completion standards", "Conflict resolution", "Scripture memory (Proverbs)", "Journal discipline"],
    daily: ["5:30 AM Wake & devotion", "6:00 AM Fitness", "Skills workshop", "Accountability circle"],
  },
  {
    week: 3,
    phase: "Foundation",
    title: "Hygiene, Grooming & Presentation",
    focus: "A gentleman is clean, well-groomed, and presentable in every setting.",
    modules: ["Personal hygiene standards", "Grooming & dress code", "Laundry & clothing care", "Dental & health basics", "Professional appearance"],
    daily: ["Morning grooming inspection", "Fitness", "Life skills lab", "Mentor 1-on-1"],
  },
  {
    week: 4,
    phase: "Growth",
    title: "Financial Stewardship I",
    focus: "Understand money, budgeting, and breaking free from gambling and debt.",
    modules: ["Income vs expenses", "Budgeting workshop", "Saving & tithing", "Debt recovery plan", "Mid-program assessment"],
    daily: ["Devotion", "Fitness", "Finance class", "Work readiness intro"],
  },
  {
    week: 5,
    phase: "Growth",
    title: "Fitness, Nutrition & Health",
    focus: "Build physical strength and treat the body as God's temple.",
    modules: ["Exercise programming", "Nutrition basics", "Sleep discipline", "Substance-free living", "Mental health awareness"],
    daily: ["5:30 AM Group workout", "Nutrition meal prep", "Skills practice", "Evening devotional"],
  },
  {
    week: 6,
    phase: "Growth",
    title: "Communication & Etiquette",
    focus: "Speak with respect, listen well, and carry yourself as a man of honor.",
    modules: ["Respectful speech", "Active listening", "Table manners & dining etiquette", "Phone & digital etiquette", "Public speaking basics"],
    daily: ["Etiquette drills", "Role-play scenarios", "Fitness", "Group discussion"],
  },
  {
    week: 7,
    phase: "Growth",
    title: "Life Skills & Responsibility",
    focus: "Cook, clean, maintain a home, and serve others practically.",
    modules: ["Cooking basics", "Cleaning standards", "Home maintenance", "Errands & planning", "Serving the community"],
    daily: ["Chores rotation", "Cooking lab", "Community service", "Mentor check-in"],
  },
  {
    week: 8,
    phase: "Preparation",
    title: "Work Readiness I",
    focus: "Prepare for employment: CV, interview skills, and workplace discipline.",
    modules: ["CV & cover letter", "Interview preparation", "Workplace punctuality", "Teamwork & authority", "Mid-program assessment"],
    daily: ["Mock interviews", "CV workshop", "Fitness", "Employer visits"],
  },
  {
    week: 9,
    phase: "Preparation",
    title: "Work Readiness II & Apprenticeship",
    focus: "Match skills to trades and begin employer/apprenticeship conversations.",
    modules: ["Trade exploration", "Apprenticeship pathways", "Employer networking", "Reference building", "Placement planning"],
    daily: ["Site visits / job shadow", "Skills assessment", "Placement meetings", "Evening review"],
  },
  {
    week: 10,
    phase: "Preparation",
    title: "Financial Stewardship II",
    focus: "Plan for independence: salary, rent, savings, and long-term goals.",
    modules: ["First paycheck planning", "Rent & bills", "Emergency fund", "Investment basics", "Giving & generosity"],
    daily: ["Finance planning session", "Independence budget", "Fitness", "Mentor placement review"],
  },
  {
    week: 11,
    phase: "Transition",
    title: "Transition & Independence",
    focus: "Practice living independently while still in the safety of the house.",
    modules: ["Exit plan creation", "Housing search basics", "Transport & logistics", "Alumni brotherhood intro", "Final skill assessments"],
    daily: ["Independent day simulation", "Placement confirmation", "Graduation prep", "Testimony writing"],
  },
  {
    week: 12,
    phase: "Transition",
    title: "Graduation & Sending Forth",
    focus: "Graduate with documentation, placement secured, and a brotherhood for life.",
    modules: ["Graduation ceremony", "Placement handover", "Alumni onboarding", "90-day follow-up plan", "Cohort debrief"],
    daily: ["Final inspections", "Graduation rehearsal", "Ceremony", "Send-off & new intake prep"],
  },
];

const THE_FORGE = {
  name: "The Forge",
  tagline: "Where iron sharpens iron.",
  day: "Friday",
  time: "19:00",
  durationMinutes: 60,
  description:
    "The Forge is IronMen's weekly men's brotherhood. Every Friday, real men gather to be sharpened — no fluff, no weak prayers, no excuses. We confront truth, build iron discipline, forge character, and hold each other accountable. This is where boys become men, and men become dangerous to mediocrity.",
};

const FRIDAY_SERVICE = {
  ...THE_FORGE,
  label: THE_FORGE.name,
};

const SERVICE_ORDER = [
  { time: "0:00", duration: 5, item: "Opening Prayer", lead: "Worship Leader" },
  { time: "0:05", duration: 15, item: "Praise & Worship", lead: "Music Team" },
  { time: "0:20", duration: 5, item: "Scripture Reading", lead: "Assigned Brother" },
  { time: "0:25", duration: 25, item: "Message / Teaching", lead: "Speaker" },
  { time: "0:50", duration: 5, item: "Testimony or Accountability Moment", lead: "Open" },
  { time: "0:55", duration: 5, item: "Closing Prayer & Announcements", lead: "House Director / Pastor" },
];

const SERVICE_TOPICS = [
  { week: 1, title: "The Fear of the Lord", scripture: "Proverbs 9:10", speaker: "Guest Pastor" },
  { week: 2, title: "Breaking Free from Bondage", scripture: "John 8:36", speaker: "House Director" },
  { week: 3, title: "Discipline — The Mark of a Man", scripture: "1 Corinthians 9:27", speaker: "Senior Mentor" },
  { week: 4, title: "Stewardship & Money", scripture: "Luke 16:10", speaker: "Finance Mentor" },
  { week: 5, title: "Purity in a Corrupt Age", scripture: "1 Thessalonians 4:3-4", speaker: "Guest Speaker" },
  { week: 6, title: "Brotherhood & Accountability", scripture: "Proverbs 27:17", speaker: "House Director" },
  { week: 7, title: "Work as Worship", scripture: "Colossians 3:23", speaker: "Employer Partner" },
  { week: 8, title: "Forgiveness & Restoration", scripture: "1 John 1:9", speaker: "Guest Pastor" },
  { week: 9, title: "Leadership at Home & Work", scripture: "1 Timothy 3:1-5", speaker: "Senior Mentor" },
  { week: 10, title: "Overcoming Gambling & Greed", scripture: "Hebrews 13:5", speaker: "House Director" },
  { week: 11, title: "Preparing for Graduation & Sending", scripture: "Joshua 1:9", speaker: "Alumni Brother" },
  { week: 12, title: "Commissioning & New Beginnings", scripture: "Philippians 1:6", speaker: "Guest Pastor" },
];

const DAILY_SCHEDULE = [
  { time: "05:30", activity: "Wake Up, Personal Devotion", category: "Faith" },
  { time: "06:00", activity: "Group Fitness / Exercise", category: "Fitness" },
  { time: "07:00", activity: "Shower, Grooming & Hygiene Inspection", category: "Hygiene" },
  { time: "07:45", activity: "Breakfast & House Chores", category: "Life Skills" },
  { time: "08:30", activity: "Morning Training / Workshop", category: "Training" },
  { time: "12:00", activity: "Lunch & Rest", category: "Life Skills" },
  { time: "13:30", activity: "Afternoon Skills Session", category: "Training" },
  { time: "16:00", activity: "Work Readiness / Apprenticeship Activity", category: "Work" },
  { time: "17:30", activity: "Free Time (Structured — reading, journaling)", category: "Discipline" },
  { time: "18:30", activity: "Dinner", category: "Life Skills" },
  { time: "19:30", activity: "Evening Devotion & Accountability Circle", category: "Faith" },
  { time: "21:00", activity: "Lights Out Preparation", category: "Discipline" },
  { time: "22:00", activity: "Lights Out", category: "Discipline" },
];

const PLACEMENT_TYPES = [
  { id: "employment", label: "Full Employment" },
  { id: "apprenticeship", label: "Apprenticeship" },
  { id: "internship", label: "Internship" },
  { id: "self-employed", label: "Self-Employment" },
  { id: "further-training", label: "Further Training" },
];

function createDefaultSkills() {
  const skills = {};
  SKILL_PILLARS.forEach((p) => {
    skills[p.id] = { baseline: 1, current: 1, logs: [] };
  });
  return skills;
}

function createResident(data) {
  return {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name || "",
    age: data.age || 18,
    room: data.room || null,
    phone: data.phone || "",
    intakeDate: data.intakeDate || new Date().toISOString().split("T")[0],
    mentor: data.mentor || "",
    background: data.background || "",
    vices: data.vices || [],
    status: "active",
    skills: createDefaultSkills(),
    trainingLogs: [],
    assessments: [],
    documents: [],
    placement: null,
    linkedUserName: data.linkedUserName || "",
  };
}

function createCohort(name, startDate) {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + PROGRAM_DAYS);
  return {
    id: `cohort-${Date.now()}`,
    name: name || `Cohort ${new Date().getFullYear()}`,
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
    status: "active",
    residents: [],
    graduationDate: null,
    graduationNotes: "",
  };
}

function getDefaultFridayService() {
  return {
    mode: "zoom",
    zoomLink: "",
    zoomMeetingId: "",
    zoomPasscode: "",
    physicalVenue: "",
    physicalAddress: "",
    serviceTime: FRIDAY_SERVICE.time,
    durationMinutes: FRIDAY_SERVICE.durationMinutes,
    currentTopicIndex: 0,
    plannedSpeaker: "",
    sessions: [],
  };
}

function getDefaultHouse() {
  return {
    name: "IronMen Halfway House",
    capacity: HOUSE_CAPACITY,
    address: "",
    cohorts: [],
    fridayService: getDefaultFridayService(),
  };
}

const INTAKE_CRITERIA = {
  mandatory: [
    { id: "age", label: "Male, aged 18 years or older", verify: "National ID / passport" },
    { id: "commitment", label: "Willing to live on-site for full 90 days (12 weeks)", verify: "Signed program agreement" },
    { id: "faith", label: "Committed to God-fearing, faith-based lifestyle during residence", verify: "Pastoral interview" },
    { id: "vicefree", label: "Willing to abstain from porn, gambling, drugs, and alcohol", verify: "Written commitment" },
    { id: "medical", label: "Medically stable — no condition requiring hospitalisation", verify: "Medical clearance form" },
    { id: "mental", label: "Mentally stable — not in acute psychiatric crisis", verify: "Counsellor assessment" },
    { id: "safety", label: "No active violent behaviour or threat to residents/staff", verify: "Background check + interview" },
    { id: "literacy", label: "Literate enough for training and house rules (English/Kiswahili)", verify: "Literacy screening" },
    { id: "motivation", label: "Genuinely motivated to change — not only external pressure", verify: "Director interview" },
    { id: "rules", label: "Agrees to all house rules, schedule, and accountability", verify: "Signed handbook acknowledgement" },
  ],
  disqualifiers: [
    "Under 18 years of age",
    "Unwilling to participate in faith-based activities",
    "Active, unrepentant involvement in porn, gambling, or substances at intake",
    "History of sexual offences or violence against women/children",
    "Severe untreated mental illness posing risk to self or others",
    "Refusal to submit to house rules, curfew, phone policy, or drug testing",
    "Known gang activity or criminal enterprise involvement",
    "Medical condition requiring specialised care unavailable at facility",
    "Dismissive or hostile attitude toward mentorship",
  ],
  interviewAreas: [
    { id: "motivation", label: "Motivation to change" },
    { id: "faith", label: "Faith openness" },
    { id: "discipline", label: "Discipline potential" },
    { id: "honesty", label: "Honesty" },
    { id: "work", label: "Work readiness" },
    { id: "community", label: "Community fit" },
  ],
  minInterviewScore: 3.5,
  requiredDocuments: [
    "Completed Resident Intake Form",
    "Copy of National ID or passport",
    "Two reference letters (spiritual + character/professional)",
    "Medical clearance certificate (within 30 days)",
    "Signed House Rules Handbook acknowledgement",
    "Signed 90-day Program Agreement",
    "Emergency contact details",
    "Photograph for resident file",
  ],
};