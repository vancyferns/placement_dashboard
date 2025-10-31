import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateProgressData() {
  const students = await prisma.student.findMany()

  for (const student of students) {
    // Check if progress data already exists
    const existingProgress = await prisma.progressData.findFirst({
      where: { studentId: student.id },
    })

    if (existingProgress) {
      console.log(`Progress data already exists for ${student.name}`)
      continue
    }

    // Generate 5 weeks of progress data
    for (let week = 0; week < 5; week++) {
      const date = new Date()
      date.setDate(date.getDate() - (4 - week) * 7) // Go back in weeks

      const weekProgress = {
        overall: Math.max(30, student.overallScore + Math.floor(Math.random() * 20 - 10)),
        resume: Math.max(30, student.resumeScore + Math.floor(Math.random() * 16 - 8)),
        aptitude: Math.max(30, student.aptitudeScore + Math.floor(Math.random() * 16 - 8)),
        softSkills: Math.max(30, student.softSkillsScore + Math.floor(Math.random() * 16 - 8)),
      }

      await prisma.progressData.create({
        data: {
          studentId: student.id,
          week: `Week ${week + 1}`,
          date,
          overall: weekProgress.overall,
          resume: weekProgress.resume,
          aptitude: weekProgress.aptitude,
          softSkills: weekProgress.softSkills,
        },
      })
    }

    console.log(`✅ Generated progress data for ${student.name}`)
  }

  console.log('🎉 All progress data generated!')
}

generateProgressData()
  .catch((e) => {
    console.error('Error generating progress data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
