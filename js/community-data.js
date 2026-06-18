const PARTNERSHIP_TYPES = [
  { id: "financial", label: "Financial Support", icon: "💰", desc: "Fund the halfway house, cohorts, or individual needs" },
  { id: "mentorship", label: "Mentorship", icon: "🤝", desc: "Walk alongside a young man — spiritually, professionally, or practically" },
  { id: "employer", label: "Employer / Apprenticeship", icon: "🔧", desc: "Offer jobs, internships, or trade apprenticeships to graduating brothers" },
  { id: "church", label: "Church / Ministry", icon: "✝️", desc: "Provide pastoral support, venue, or Friday service partnership" },
  { id: "women", label: "Moms & Women Supporters", icon: "💐", desc: "For mothers and women who believe in god-fearing, responsible, masculine men" },
];

const FINANCIAL_TIERS = [
  {
    id: "brother",
    name: "Brother Supporter",
    amount: "KES 2,000/mo",
    impact: "Covers hygiene kits, Bibles, and training materials for one resident",
  },
  {
    id: "cohort",
    name: "Cohort Sponsor",
    amount: "KES 50,000/mo",
    impact: "Supports food and utilities for the full house (10 men) for one month",
  },
  {
    id: "graduate",
    name: "Graduate Launch Fund",
    amount: "KES 15,000 one-time",
    impact: "Helps one graduate with transport, work clothes, and first-month expenses",
  },
  {
    id: "building",
    name: "House & Facility",
    amount: "Custom",
    impact: "Rent, furniture, renovations, or startup capital for the physical halfway house",
  },
];

const MENTORSHIP_ROLES = [
  { id: "resident", title: "Resident Mentor", commitment: "90 days, 6+ hrs/week", desc: "Assigned to 1–3 men in the house. Weekly 1-on-1s, accountability, skill assessments." },
  { id: "career", title: "Career / Trade Mentor", commitment: "2–4 hrs/month", desc: "Guide brothers in your profession — CV review, interview prep, workplace wisdom." },
  { id: "friday", title: "Friday Service Speaker", commitment: "1 hr/month", desc: "Deliver a 25-minute teaching at the weekly brotherhood service." },
  { id: "employer", title: "Employer Partner", commitment: "Ongoing", desc: "Commit to interviewing or hiring IronMen graduates. Offer apprenticeships in your trade." },
];

const OPPORTUNITY_TYPES = [
  { id: "all", label: "All" },
  { id: "employment", label: "Employment" },
  { id: "internship", label: "Internship" },
  { id: "apprenticeship", label: "Apprenticeship" },
];

const DEFAULT_PRIORITY_DAYS = 14;

const DEFAULT_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Construction Site Assistant",
    organization: "BuildRight Contractors",
    type: "apprenticeship",
    location: "Nairobi",
    description: "Learn masonry, concrete work, and site safety. IronMen graduates receive priority interview. 6-month paid apprenticeship with certification pathway.",
    requirements: ["18+", "Physically fit", "Willing to start early", "IronMen graduate or final-month resident"],
    contact: "hr@buildright.example",
    deadline: "",
    status: "open",
    postedDate: new Date().toISOString().split("T")[0],
    priorityDays: DEFAULT_PRIORITY_DAYS,
  },
  {
    id: "opp-2",
    title: "Office Admin Intern",
    organization: "Grace Community Centre",
    type: "internship",
    location: "Nairobi",
    description: "3-month internship in administration, data entry, and customer service. Ideal for brothers building office skills.",
    requirements: ["Basic literacy", "Punctual and presentable", "Computer basics helpful"],
    contact: "admin@gracecentre.example",
    deadline: "",
    status: "open",
    postedDate: new Date().toISOString().split("T")[0],
    priorityDays: DEFAULT_PRIORITY_DAYS,
  },
  {
    id: "opp-3",
    title: "Motorcycle Mechanic Trainee",
    organization: "Rider's Garage",
    type: "apprenticeship",
    location: "Kiambu",
    description: "Hands-on training in motorcycle repair and maintenance. Tools provided. Progress to full mechanic role after 12 months.",
    requirements: ["Mechanical interest", "Disciplined work ethic", "Resident or graduate preferred"],
    contact: "0712-000-000",
    deadline: "",
    status: "open",
    postedDate: new Date().toISOString().split("T")[0],
    priorityDays: DEFAULT_PRIORITY_DAYS,
  },
  {
    id: "opp-4",
    title: "Retail Sales Associate",
    organization: "Cornerstone Hardware",
    type: "employment",
    location: "Nairobi",
    description: "Full-time sales role with on-the-job training. Stable income for brothers ready to support themselves after graduation.",
    requirements: ["Good communication", "Honest and reliable", "Friday service attendance encouraged"],
    contact: "jobs@cornerstone.example",
    deadline: "",
    status: "open",
    postedDate: new Date().toISOString().split("T")[0],
    priorityDays: DEFAULT_PRIORITY_DAYS,
  },
];

const DEFAULT_PARTNERS = [
  { id: "p-1", name: "Your Church Here", type: "church", since: "2026", note: "Become our first church partner" },
  { id: "p-2", name: "Your Business Here", type: "employer", since: "2026", note: "List your company as an employer partner" },
];

const WOMEN_SUPPORT_TYPES = [
  { id: "prayer", label: "Prayer & Intercession", icon: "🙏", desc: "Commit to praying for residents, mentors, and graduating brothers each week." },
  { id: "financial", label: "Financial Support", icon: "💝", desc: "Give toward food, housing, graduate launch funds, or care packages for the house." },
  { id: "care", label: "Care Packages & Practical Help", icon: "📦", desc: "Provide toiletries, bedding, work clothes, meals, or other practical needs." },
  { id: "referral", label: "Refer a Young Man", icon: "👨", desc: "Know a son, nephew, or young man who needs structure, faith, and brotherhood? Connect him with us." },
  { id: "encouragement", label: "Letters & Encouragement", icon: "✉️", desc: "Write notes of hope, Scripture, and affirmation that remind brothers they are not forgotten." },
  { id: "advocacy", label: "Advocate & Share", icon: "📣", desc: "Speak up in your church and community about the need for godly, responsible, masculine men." },
];

const WOMEN_RELATIONSHIPS = [
  { id: "mom", label: "Mom" },
  { id: "grandmother", label: "Grandmother" },
  { id: "sister", label: "Sister" },
  { id: "aunt", label: "Aunt" },
  { id: "wife", label: "Wife / Spouse" },
  { id: "friend", label: "Friend" },
  { id: "church", label: "Church Sister" },
  { id: "other", label: "Other Supporter" },
];

const DEFAULT_WOMEN_SUPPORTERS = [
  { id: "w-1", name: "Your Name Here", relationship: "mom", since: "2026", note: "Be the first woman listed on our wall of support" },
];

function getDefaultCommunity() {
  return {
    partners: [...DEFAULT_PARTNERS],
    inquiries: [],
    womenSupporters: [...DEFAULT_WOMEN_SUPPORTERS],
    supporterInquiries: [],
    opportunities: [...DEFAULT_OPPORTUNITIES],
    interestLogs: [],
    paymentInfo: {
      mpesa: "M-Pesa Paybill: 522522 — Account: IRONMEN",
      bank: "Bank: [Your Bank] — Account: [Number] — Name: IronMen Brotherhood",
      note: "Contact the House Director for partnership confirmation after giving.",
    },
  };
}