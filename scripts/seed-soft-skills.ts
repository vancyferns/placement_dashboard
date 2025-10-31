import { prisma } from '../lib/prisma';

const softSkillsQuestions = [
  // Communication Skills
  {
    question: "During a team meeting, you notice a colleague struggling to explain their idea. What's the best approach?",
    options: JSON.stringify([
      "Interrupt and explain it for them",
      "Let them continue without help",
      "Ask clarifying questions to help them express their thoughts",
      "Change the subject to avoid awkwardness"
    ]),
    correctAnswer: 2,
    category: "Communication"
  },
  {
    question: "You receive critical feedback via email. How should you respond?",
    options: JSON.stringify([
      "Immediately defend yourself",
      "Ignore it and move on",
      "Thank them for the feedback and ask for specific examples",
      "Forward it to your manager"
    ]),
    correctAnswer: 2,
    category: "Communication"
  },
  {
    question: "When presenting to senior management, which approach is most effective?",
    options: JSON.stringify([
      "Use technical jargon to show expertise",
      "Adapt your language to your audience and focus on key insights",
      "Read directly from slides",
      "Speak as quickly as possible to save time"
    ]),
    correctAnswer: 1,
    category: "Communication"
  },
  
  // Leadership Skills
  {
    question: "Your team is falling behind schedule on a project. What's your priority as a leader?",
    options: JSON.stringify([
      "Blame team members for delays",
      "Work overtime alone to catch up",
      "Assess bottlenecks, redistribute tasks, and support the team",
      "Ask for deadline extension immediately"
    ]),
    correctAnswer: 2,
    category: "Leadership"
  },
  {
    question: "A team member consistently produces excellent work but has poor attendance. How do you handle this?",
    options: JSON.stringify([
      "Ignore it since their work is good",
      "Have a private conversation to understand the issue and find a solution",
      "Publicly call them out in a meeting",
      "Report them to HR immediately"
    ]),
    correctAnswer: 1,
    category: "Leadership"
  },
  {
    question: "When delegating tasks, what's most important?",
    options: JSON.stringify([
      "Assign tasks based on who has the lightest workload",
      "Do everything yourself to ensure quality",
      "Match tasks to team members' strengths and developmental goals",
      "Assign tasks randomly for fairness"
    ]),
    correctAnswer: 2,
    category: "Leadership"
  },
  
  // Teamwork Skills
  {
    question: "Two team members have a disagreement that's affecting the project. What do you do?",
    options: JSON.stringify([
      "Take sides with the person you agree with",
      "Ignore it and hope it resolves itself",
      "Facilitate a discussion to help them find common ground",
      "Remove both from the project"
    ]),
    correctAnswer: 2,
    category: "Teamwork"
  },
  {
    question: "Your idea was rejected in favor of another team member's approach. How do you respond?",
    options: JSON.stringify([
      "Withdraw from participating actively",
      "Argue why your idea was better",
      "Support the chosen approach and contribute your best effort",
      "Complain to others outside the team"
    ]),
    correctAnswer: 2,
    category: "Teamwork"
  },
  {
    question: "A team member needs help with a task, but you're busy with your own work. What do you do?",
    options: JSON.stringify([
      "Tell them you're too busy",
      "Do their task for them",
      "Schedule time to help them or connect them with someone who can",
      "Report them for not being able to complete their work"
    ]),
    correctAnswer: 2,
    category: "Teamwork"
  },
  
  // Problem Solving
  {
    question: "You encounter a complex problem with no obvious solution. What's your first step?",
    options: JSON.stringify([
      "Make a quick guess and implement it",
      "Ask someone else to solve it",
      "Break it down into smaller parts and analyze each component",
      "Escalate immediately to management"
    ]),
    correctAnswer: 2,
    category: "Problem Solving"
  },
  {
    question: "A solution you implemented isn't working as expected. What do you do?",
    options: JSON.stringify([
      "Blame external factors",
      "Hide the issue and hope no one notices",
      "Analyze what went wrong, learn from it, and iterate",
      "Give up and try something completely different"
    ]),
    correctAnswer: 2,
    category: "Problem Solving"
  },
  {
    question: "When faced with multiple urgent issues, how do you prioritize?",
    options: JSON.stringify([
      "Work on the easiest ones first",
      "Tackle them in the order they arrived",
      "Assess impact and urgency, then prioritize accordingly",
      "Work on all of them simultaneously"
    ]),
    correctAnswer: 2,
    category: "Problem Solving"
  },
  
  // Adaptability
  {
    question: "Your project requirements suddenly change midway. How do you react?",
    options: JSON.stringify([
      "Complain about the change",
      "Continue with the original plan",
      "Quickly reassess and adjust your approach to meet new requirements",
      "Refuse to make changes"
    ]),
    correctAnswer: 2,
    category: "Adaptability"
  },
  {
    question: "You're asked to learn a new technology for an upcoming project. What's your approach?",
    options: JSON.stringify([
      "Decline because you prefer familiar tools",
      "Say yes but don't actually learn it",
      "Embrace the opportunity and create a structured learning plan",
      "Learn only the bare minimum required"
    ]),
    correctAnswer: 2,
    category: "Adaptability"
  },
  {
    question: "You receive feedback that your work style isn't meshing well with the team. How do you respond?",
    options: JSON.stringify([
      "Insist the team should adapt to you",
      "Ignore the feedback",
      "Seek to understand the concerns and find ways to adjust",
      "Look for a different team"
    ]),
    correctAnswer: 2,
    category: "Adaptability"
  },
  
  // Time Management
  {
    question: "You have multiple deadlines approaching. How do you manage them?",
    options: JSON.stringify([
      "Work on whichever task you feel like at the moment",
      "Create a prioritized schedule with buffer time for unexpected issues",
      "Try to complete everything at once",
      "Ask for extensions on all deadlines"
    ]),
    correctAnswer: 1,
    category: "Time Management"
  },
  {
    question: "A colleague keeps interrupting you with non-urgent questions. What do you do?",
    options: JSON.stringify([
      "Ignore all their questions",
      "Drop everything to help them each time",
      "Set boundaries and suggest specific times for discussions",
      "Complain to their manager"
    ]),
    correctAnswer: 2,
    category: "Time Management"
  },
  {
    question: "You realize you've underestimated the time needed for a task. What's your best approach?",
    options: JSON.stringify([
      "Rush to finish on time regardless of quality",
      "Communicate early with stakeholders about the revised timeline",
      "Work all night to meet the original deadline",
      "Deliver incomplete work on time"
    ]),
    correctAnswer: 1,
    category: "Time Management"
  },
  
  // Emotional Intelligence
  {
    question: "A team member seems upset but hasn't said anything. What do you do?",
    options: JSON.stringify([
      "Ignore it, it's their personal issue",
      "Announce it in the team meeting",
      "Privately check in with them to see if they're okay",
      "Tell others about your observations"
    ]),
    correctAnswer: 2,
    category: "Emotional Intelligence"
  },
  {
    question: "You're feeling overwhelmed with work. What's the healthiest response?",
    options: JSON.stringify([
      "Keep quiet and power through",
      "Take out frustrations on colleagues",
      "Communicate your workload concerns and ask for support if needed",
      "Quit immediately"
    ]),
    correctAnswer: 2,
    category: "Emotional Intelligence"
  },
  {
    question: "A colleague receives recognition for a project you both worked on. How do you feel and respond?",
    options: JSON.stringify([
      "Feel resentful and distance yourself from them",
      "Publicly point out your contributions",
      "Feel happy for them and mention your collaboration naturally if it comes up",
      "Demand equal recognition immediately"
    ]),
    correctAnswer: 2,
    category: "Emotional Intelligence"
  }
];

async function seedSoftSkillsQuestions() {
  console.log('🌱 Seeding soft skills questions...');
  
  try {
    // Clear existing soft skills questions
    await prisma.softSkillsQuestion.deleteMany({});
    console.log('Cleared existing soft skills questions');
    
    // Create new questions
    for (const question of softSkillsQuestions) {
      await prisma.softSkillsQuestion.create({
        data: question
      });
    }
    
    console.log(`✅ Successfully seeded ${softSkillsQuestions.length} soft skills questions`);
    console.log('Categories:', [...new Set(softSkillsQuestions.map(q => q.category))].join(', '));
  } catch (error) {
    console.error('Error seeding soft skills questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSoftSkillsQuestions();
