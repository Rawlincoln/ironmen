const DEVOTIONALS = [
  {
    day: 1,
    verse: "Trust in the LORD with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
    reflection: "Success without God is hollow. Today, surrender one decision you have been trying to control on your own.",
    challenge: "Write down one area where you will seek God's wisdom before acting.",
  },
  {
    day: 2,
    verse: "No temptation has overtaken you except what is common to mankind. And God is faithful.",
    reference: "1 Corinthians 10:13",
    reflection: "Every man faces temptation. The difference is whether you face it alone or with God and brothers beside you.",
    challenge: "Identify your weakest hour today and plan an escape route before it arrives.",
  },
  {
    day: 3,
    verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you.",
    reference: "Joshua 1:9",
    reflection: "Courage is not the absence of fear — it is obedience in spite of it. Step into responsibility today.",
    challenge: "Do one hard thing you have been avoiding: a conversation, a bill, a workout, an apology.",
  },
  {
    day: 4,
    verse: "As iron sharpens iron, so one person sharpens another.",
    reference: "Proverbs 27:17",
    reflection: "You were not made to walk alone. Accountability is not weakness — it is wisdom.",
    challenge: "Reach out to your accountability partner and share honestly how your week is going.",
  },
  {
    day: 5,
    verse: "The righteous lead blameless lives; blessed are their children after them.",
    reference: "Proverbs 20:7",
    reflection: "Every choice you make today shapes the man you become and the legacy you leave.",
    challenge: "List three habits you want the next generation to learn from watching you.",
  },
  {
    day: 6,
    verse: "Whoever can be trusted with very little can also be trusted with much.",
    reference: "Luke 16:10",
    reflection: "Financial discipline, punctuality, and keeping your word are foundations of success.",
    challenge: "Review your spending this week. Cut one unnecessary expense and redirect it toward a goal.",
  },
  {
    day: 7,
    verse: "Submit yourselves, then, to God. Resist the devil, and he will flee from you.",
    reference: "James 4:7",
    reflection: "Resistance requires submission first. You cannot fight temptation in your own strength forever.",
    challenge: "Spend 15 minutes in prayer before any leisure screen time today.",
  },
];

const RESOURCES = [
  {
    category: "Purity",
    title: "Breaking Free from Pornography",
    summary: "Practical steps: install filters, remove triggers, replace idle time with purpose, and confess quickly when you stumble.",
    tips: ["Use accountability software", "Avoid late-night phone use", "Exercise when urges hit", "Memorize Scripture"],
  },
  {
    category: "Gambling",
    title: "Taking Back Control of Your Finances",
    summary: "Gambling promises quick wealth but delivers bondage. Replace the thrill with real financial goals.",
    tips: ["Close betting accounts", "Give a trusted person access to finances", "Set a monthly budget", "Celebrate small savings wins"],
  },
  {
    category: "Substances",
    title: "Walking in Sobriety",
    summary: "Freedom from drugs and alcohol starts with admitting you need help and building a new community.",
    tips: ["Attend support meetings", "Avoid old environments", "Build a morning routine", "Seek professional help if needed"],
  },
  {
    category: "Character",
    title: "Becoming a Man of Your Word",
    summary: "Integrity is doing what you said you would do, long after the mood in which you said it has passed.",
    tips: ["Under-promise and over-deliver", "Write commitments down", "Apologize quickly when you fail", "Keep small promises daily"],
  },
  {
    category: "Success",
    title: "Building a Life of Purpose",
    summary: "Success is not just wealth — it is stewardship, service, and becoming who God created you to be.",
    tips: ["Define your values first", "Set 90-day goals", "Find a mentor", "Serve others weekly"],
  },
  {
    category: "Faith",
    title: "Growing in the Fear of the Lord",
    summary: "To fear God is to honor Him above all — it is the beginning of wisdom and the foundation of a upright life.",
    tips: ["Read Scripture daily", "Join a Bible study", "Worship consistently", "Practice gratitude"],
  },
];

const VICES = [
  { id: "porn", name: "Pornography", icon: "🛡️", color: "#c45c26" },
  { id: "gambling", name: "Gambling", icon: "💰", color: "#2d6a4f" },
  { id: "drugs", name: "Drugs & Alcohol", icon: "🚫", color: "#5c4d7a" },
  { id: "other", name: "Other", icon: "⚔️", color: "#4a5568", customizable: true },
];

const DEFAULT_GOALS = [
  { id: "spiritual", label: "Daily prayer & Scripture", category: "Faith" },
  { id: "fitness", label: "Exercise 3x per week", category: "Health" },
  { id: "finance", label: "Save 10% of income", category: "Finance" },
  { id: "service", label: "Serve others weekly", category: "Character" },
];

const ENCOURAGEMENTS = [
  "Every day clean is a victory. Keep going, brother.",
  "Falling is not failing — staying down is. Get back up.",
  "You are being forged into the man God intended.",
  "Your future self is counting on today's discipline.",
  "Courage is built one honest day at a time.",
  "The brotherhood is proud of your commitment.",
];