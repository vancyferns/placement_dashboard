import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample students
  const students = [
    { name: 'Arjun Sharma', email: 'arjun.sharma@college.edu', rollNumber: 'CS101', cgpa: 7.5 },
    { name: 'Priya Patel', email: 'priya.patel@college.edu', rollNumber: 'CS102', cgpa: 8.5 },
    { name: 'Rahul Kumar', email: 'rahul.kumar@college.edu', rollNumber: 'CS103', cgpa: 6.8 },
    { name: 'Sneha Singh', email: 'sneha.singh@college.edu', rollNumber: 'CS104', cgpa: 7.8 },
    { name: 'Vikram Reddy', email: 'vikram.reddy@college.edu', rollNumber: 'CS105', cgpa: 7.2 },
  ]

  const password = await bcrypt.hash('password123', 10)

  for (const studentData of students) {
    const user = await prisma.user.create({
      data: {
        email: studentData.email,
        name: studentData.name,
        password,
        role: 'STUDENT',
      },
    })

    const scores = {
      overall: Math.floor(Math.random() * 30) + 60,
      resume: Math.floor(Math.random() * 30) + 55,
      aptitude: Math.floor(Math.random() * 30) + 60,
      softSkills: Math.floor(Math.random() * 30) + 55,
      interview: Math.floor(Math.random() * 30) + 60,
    }

    await prisma.student.create({
      data: {
        userId: user.id,
        name: studentData.name,
        email: studentData.email,
        rollNumber: studentData.rollNumber,
        cgpa: studentData.cgpa,
        branch: 'Computer Science',
        overallScore: scores.overall,
        resumeScore: scores.resume,
        aptitudeScore: scores.aptitude,
        softSkillsScore: scores.softSkills,
        interviewScore: scores.interview,
      },
    })
  }

  // Create placement officer
  const officerUser = await prisma.user.create({
    data: {
      email: 'officer@college.edu',
      name: 'Dr. Placement Officer',
      password,
      role: 'OFFICER',
    },
  })

  await prisma.officer.create({
    data: {
      userId: officerUser.id,
      name: 'Dr. Placement Officer',
      email: 'officer@college.edu',
      department: 'Training & Placement',
    },
  })

  // Create aptitude questions
  const questions = [
    {
      question: 'If a train travels 120 km in 2 hours, what is its average speed?',
      options: JSON.stringify(['50 km/h', '60 km/h', '70 km/h', '80 km/h']),
      correctAnswer: 1,
      category: 'quantitative',
    },
    {
      question: 'Complete the series: 2, 6, 12, 20, 30, ?',
      options: JSON.stringify(['40', '42', '44', '46']),
      correctAnswer: 1,
      category: 'logical',
    },
    {
      question: "Choose the word most similar to 'Abundant':",
      options: JSON.stringify(['Scarce', 'Plentiful', 'Limited', 'Rare']),
      correctAnswer: 1,
      category: 'verbal',
    },
    {
      question: 'If 3x + 7 = 22, what is the value of x?',
      options: JSON.stringify(['3', '4', '5', '6']),
      correctAnswer: 2,
      category: 'quantitative',
    },
    {
      question: 'Which number comes next: 1, 4, 9, 16, 25, ?',
      options: JSON.stringify(['30', '32', '36', '40']),
      correctAnswer: 2,
      category: 'logical',
    },
    {
      question: "Antonym of 'Optimistic':",
      options: JSON.stringify(['Hopeful', 'Positive', 'Pessimistic', 'Confident']),
      correctAnswer: 2,
      category: 'verbal',
    },
    {
      question: 'A rectangle has length 8m and width 6m. What is its area?',
      options: JSON.stringify(['42 sq m', '48 sq m', '52 sq m', '56 sq m']),
      correctAnswer: 1,
      category: 'quantitative',
    },
    {
      question: 'If all roses are flowers and some flowers are red, then:',
      options: JSON.stringify([
        'All roses are red',
        'Some roses are red',
        'No roses are red',
        'Cannot be determined',
      ]),
      correctAnswer: 3,
      category: 'logical',
    },
    {
      question: 'Choose the correctly spelled word:',
      options: JSON.stringify(['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate']),
      correctAnswer: 1,
      category: 'verbal',
    },
    {
      question: 'What is 15% of 200?',
      options: JSON.stringify(['25', '30', '35', '40']),
      correctAnswer: 1,
      category: 'quantitative',
    },
  ]

  for (const q of questions) {
    await prisma.question.create({ data: q })
  }

  // Create companies
  const companies = [
    {
      name: 'TechCorp Solutions',
      minOverallScore: 70,
      minAptitudeScore: 65,
      requiredSkills: JSON.stringify(['Python', 'SQL', 'Problem Solving']),
      minCgpa: 7.0,
      description: 'Leading technology solutions provider',
    },
    {
      name: 'DataFlow Analytics',
      minOverallScore: 75,
      minAptitudeScore: 70,
      requiredSkills: JSON.stringify(['Data Analysis', 'Statistics', 'Python']),
      minCgpa: 7.5,
      description: 'Data analytics and insights company',
    },
    {
      name: 'WebDev Innovations',
      minOverallScore: 65,
      minAptitudeScore: 60,
      requiredSkills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
      minCgpa: 6.5,
      description: 'Modern web development agency',
    },
  ]

  for (const company of companies) {
    await prisma.company.create({ data: company })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
