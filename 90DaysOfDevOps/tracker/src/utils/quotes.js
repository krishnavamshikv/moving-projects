// Curated motivational and encouraging quotes based on cohort pace & delay

export const DELAYED_MOTIVATIONAL_QUOTES = [
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "A delay is never a defeat. Every single command and configuration you master today counts.",
  "Fall down seven times, stand up eight. Reset your focus and take on the next task.",
  "The best time to plant a tree was 20 years ago. The second best time is right now.",
  "You don't need to be extreme, just consistent. Pick one task today and conquer it.",
  "Small daily improvements over time lead to stunning, long-term mastery. Keep going.",
  "Don't look at how far you have left to go. Focus on the single step right in front of you.",
  "Mastery in DevOps isn't built in a sprint — it's forged in perseverance and resilience.",
  "Progress over perfection. Even one completed task today moves your needle forward.",
  "The expert in DevOps was once a beginner who simply refused to quit.",
  "Don't watch the clock; do what it does: keep moving forward one tick at a time. — Sam Levenson",
  "Pace is personal, but momentum is real. Rebuild your streak with your very next task.",
  "A delay simply means your comeback story is going to be that much better.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "A 1% gain each day compounds into extraordinary capability. Don't look back.",
  "Consistency is the DNA of mastery. Lock in, write the code, and keep shipping.",
  "Your only true benchmark is who you were yesterday. Let's finish one more task today.",
  "Even senior DevOps architects have faced backlogs. What matters is showing up today.",
  "Momentum starts with a single click. Open today's task and see it through.",
  "The marathon of engineering doesn't reward rush — it rewards those who refuse to stop.",
  "Never give up on a goal just because of the time it will take. The time will pass anyway. — Earl Nightingale",
  "Doubt kills more dreams than failure ever will. Believe in your routine and keep pushing.",
  "Breathe, reset, and recommit. You have everything you need to finish this track.",
  "Rough days pass, but DevOps skills last forever. One task at a time!",
  "Great works are performed not by strength, but by perseverance. — Samuel Johnson",
  "A river cuts through rock not because of its power, but because of its persistence.",
  "Action cures anxiety. Open terminal, tackle one problem, and watch the momentum return.",
  "Zero days are the only failure. Doing 10 minutes of learning today is an absolute victory.",
  "Don't let yesterday take up too much of today. — Will Rogers",
  "You don't have to see the whole staircase, just take the first step. — Martin Luther King Jr.",
  "Every master was once a disaster. Keep troubleshooting and keep growing.",
  "Resilience is learning how to restart without self-blame. Let's get today's lab done.",
  "Even a cluster that fails health checks can be brought back up healthy. So can your pace.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "Consistency always beats intensity in the long run. Take it day by day.",
  "Delayed deadlines don't define your potential. Your dedication to keep learning does."
];

export const ENCOURAGING_QUOTES = [
  "Blazing velocity! Keep this rhythm and nothing will stand in your way.",
  "Outstanding momentum! You're operating at true cloud-native speed.",
  "Precision, velocity, and execution. You're mastering DevOps in real time.",
  "You're crushing the pace! Excellence isn't an act, it's a daily habit.",
  "Great work! Discipline is the bridge between DevOps goals and accomplishments.",
  "Superb consistency! You are well ahead of the cohort curve.",
  "High velocity locked in! Keep pushing the envelope and setting the standard.",
  "Every deployment counts, and right now you're running like a top-tier CI/CD pipeline!"
];

export function getRandomQuote(isDelayed) {
  const list = isDelayed ? DELAYED_MOTIVATIONAL_QUOTES : ENCOURAGING_QUOTES;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
