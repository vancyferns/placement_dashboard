"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Brain, MessageSquare, Target, TrendingUp, FileText, Award, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import AptitudeTest from "@/components/aptitude-test"
import ResumeAnalyzer from "@/components/resume-analyzer"
import { SoftSkillsTest } from "@/components/soft-skills-test"

interface StudentData {
  id: string
  name: string
  email: string
  overall_score: number
  resume_score: number
  aptitude_score: number
  soft_skills_score: number
  interview_score: number
  progress_data: Array<{
    week: string
    date: string
    overall: number
    resume: number
    aptitude: number
    soft_skills: number
  }>
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in or not a student
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'STUDENT') {
      router.push('/officer-dashboard')
      return
    }

    fetchStudentData()
  }, [user, router])

  const fetchStudentData = async () => {
    if (!user || !user.studentId) {
      setLoading(false)
      return
    }

    try {
      // Fetch ONLY the logged-in student's data
      const detailResponse = await fetch(`/api/students/${user.studentId}`)
      const studentData = await detailResponse.json()
      
      setStudent(studentData)
    } catch (error) {
      console.error("Failed to fetch student data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Good</Badge>
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Needs Improvement</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load student data</p>
          <Button onClick={fetchStudentData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{student.overall_score}/100</div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
            <TabsTrigger value="skills">Soft Skills</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    Resume Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{student.resume_score}</div>
                  <Progress value={student.resume_score} className="mt-2" />
                  <div className="mt-2">{getScoreBadge(student.resume_score)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-primary" />
                    Aptitude Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{student.aptitude_score}</div>
                  <Progress value={student.aptitude_score} className="mt-2" />
                  <div className="mt-2">{getScoreBadge(student.aptitude_score)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{student.soft_skills_score}</div>
                  <Progress value={student.soft_skills_score} className="mt-2" />
                  <div className="mt-2">{getScoreBadge(student.soft_skills_score)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    Interview Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{student.interview_score}</div>
                  <Progress value={student.interview_score} className="mt-2" />
                  <div className="mt-2">{getScoreBadge(student.interview_score)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Progress Over Time
                </CardTitle>
                <CardDescription>Your improvement journey over the last 5 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={student.progress_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="resume" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="aptitude" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    <Line type="monotone" dataKey="soft_skills" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400 font-medium">Resume Improvement</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add more technical projects and quantify your achievements
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400 font-medium">Aptitude Strength</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Great job on logical reasoning! Keep practicing quantitative problems
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400 font-medium">Soft Skills Focus</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Work on communication skills and leadership examples
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume">
            <ResumeAnalyzer studentId={student.id} />
          </TabsContent>

          <TabsContent value="aptitude">
            <AptitudeTest studentId={student.id} />
          </TabsContent>

          <TabsContent value="skills">
            <SoftSkillsTest studentId={student.id} onComplete={fetchStudentData} />
          </TabsContent>

          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle>3-Week Improvement Roadmap</CardTitle>
                <CardDescription>Personalized plan based on your current performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-foreground">Week 1: Resume Enhancement</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Add 2 technical projects with detailed descriptions</li>
                      <li>• Quantify achievements with numbers and metrics</li>
                      <li>• Improve formatting and visual appeal</li>
                      <li>• Get feedback from career services</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-chart-2 pl-4">
                    <h4 className="font-semibold text-foreground">Week 2: Aptitude Practice</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Practice 50 quantitative problems daily</li>
                      <li>• Focus on time management techniques</li>
                      <li>• Take 3 mock aptitude tests</li>
                      <li>• Review weak areas identified in tests</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-chart-3 pl-4">
                    <h4 className="font-semibold text-foreground">Week 3: Soft Skills & Interview Prep</h4>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• Practice elevator pitch and self-introduction</li>
                      <li>• Prepare STAR method examples for behavioral questions</li>
                      <li>• Attend communication workshop</li>
                      <li>• Take mock interviews with feedback</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
