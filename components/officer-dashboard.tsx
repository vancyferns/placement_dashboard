"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Building2, Search, Filter, BookOpen, Target, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Student {
  id: string
  name: string
  email: string
  overall_score: number
  resume_score: number
  aptitude_score: number
  soft_skills_score: number
  interview_score: number
}

interface BatchAnalytics {
  total_students: number
  average_score: number
  weak_students_count: number
  strong_students_count: number
  weak_areas: string[]
  suggested_seminars: string[]
}

interface Company {
  id: string
  name: string
  requirements: {
    min_overall_score: number
    min_aptitude_score: number
    required_skills: string[]
    min_cgpa: number
  }
}

interface CompanyMatch {
  company: Company
  eligible: boolean
  match_percentage: number
}

export default function OfficerDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [analytics, setAnalytics] = useState<BatchAnalytics | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in or not an officer
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'OFFICER') {
      router.push('/student-dashboard')
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from API
      const [studentsResponse, analyticsResponse, companiesResponse] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/analytics'),
        fetch('/api/companies'),
      ])

      const fetchedStudents = await studentsResponse.json()
      const fetchedAnalytics = await analyticsResponse.json()
      const fetchedCompanies = await companiesResponse.json()

      setStudents(fetchedStudents)
      setAnalytics(fetchedAnalytics)
      setCompanies(fetchedCompanies)

      // Generate company matches
      const matches = fetchedCompanies.map((company: Company) => {
        const eligibleStudents = fetchedStudents.filter(
          (student: Student) =>
            student.overall_score >= company.requirements.min_overall_score &&
            student.aptitude_score >= company.requirements.min_aptitude_score,
        )

        return {
          company,
          eligible: eligibleStudents.length > 0,
          match_percentage: Math.round((eligibleStudents.length / fetchedStudents.length) * 100),
        }
      })

      setCompanyMatches(matches)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      
      // Fallback to mock data
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "Arjun Sharma",
          email: "arjun.sharma@college.edu",
          overall_score: 72,
          resume_score: 68,
          aptitude_score: 75,
          soft_skills_score: 70,
          interview_score: 74,
        },
        {
          id: "2",
          name: "Priya Patel",
          email: "priya.patel@college.edu",
          overall_score: 85,
          resume_score: 88,
          aptitude_score: 82,
          soft_skills_score: 85,
          interview_score: 85,
        },
        {
          id: "3",
          name: "Rahul Kumar",
          email: "rahul.kumar@college.edu",
          overall_score: 58,
          resume_score: 55,
          aptitude_score: 60,
          soft_skills_score: 58,
          interview_score: 59,
        },
        {
          id: "4",
          name: "Sneha Singh",
          email: "sneha.singh@college.edu",
          overall_score: 78,
          resume_score: 75,
          aptitude_score: 80,
          soft_skills_score: 77,
          interview_score: 80,
        },
        {
          id: "5",
          name: "Vikram Reddy",
          email: "vikram.reddy@college.edu",
          overall_score: 65,
          resume_score: 62,
          aptitude_score: 68,
          soft_skills_score: 65,
          interview_score: 65,
        },
        {
          id: "6",
          name: "Ananya Gupta",
          email: "ananya.gupta@college.edu",
          overall_score: 82,
          resume_score: 80,
          aptitude_score: 85,
          soft_skills_score: 80,
          interview_score: 83,
        },
        {
          id: "7",
          name: "Karthik Jain",
          email: "karthik.jain@college.edu",
          overall_score: 52,
          resume_score: 48,
          aptitude_score: 55,
          soft_skills_score: 52,
          interview_score: 53,
        },
        {
          id: "8",
          name: "Meera Agarwal",
          email: "meera.agarwal@college.edu",
          overall_score: 76,
          resume_score: 73,
          aptitude_score: 78,
          soft_skills_score: 75,
          interview_score: 78,
        },
        {
          id: "9",
          name: "Rohan Mehta",
          email: "rohan.mehta@college.edu",
          overall_score: 69,
          resume_score: 66,
          aptitude_score: 72,
          soft_skills_score: 68,
          interview_score: 70,
        },
        {
          id: "10",
          name: "Divya Shah",
          email: "divya.shah@college.edu",
          overall_score: 88,
          resume_score: 90,
          aptitude_score: 85,
          soft_skills_score: 88,
          interview_score: 89,
        },
      ]

      const mockAnalytics: BatchAnalytics = {
        total_students: 10,
        average_score: 71.5,
        weak_students_count: 3,
        strong_students_count: 4,
        weak_areas: ["Resume Writing", "Soft Skills"],
        suggested_seminars: ["Resume Writing Workshop", "Soft Skills Workshop"],
      }

      const mockCompanies: Company[] = [
        {
          id: "c1",
          name: "TechCorp Solutions",
          requirements: {
            min_overall_score: 70,
            min_aptitude_score: 65,
            required_skills: ["Python", "SQL", "Problem Solving"],
            min_cgpa: 7.0,
          },
        },
        {
          id: "c2",
          name: "DataFlow Analytics",
          requirements: {
            min_overall_score: 75,
            min_aptitude_score: 70,
            required_skills: ["Data Analysis", "Statistics", "Python"],
            min_cgpa: 7.5,
          },
        },
        {
          id: "c3",
          name: "WebDev Innovations",
          requirements: {
            min_overall_score: 65,
            min_aptitude_score: 60,
            required_skills: ["JavaScript", "React", "Node.js"],
            min_cgpa: 6.5,
          },
        },
      ]

      setStudents(mockStudents)
      setAnalytics(mockAnalytics)
      setCompanies(mockCompanies)

      // Generate company matches
      const matches = mockCompanies.map((company) => {
        const eligibleStudents = mockStudents.filter(
          (student) =>
            student.overall_score >= company.requirements.min_overall_score &&
            student.aptitude_score >= company.requirements.min_aptitude_score,
        )

        return {
          company,
          eligible: eligibleStudents.length > 0,
          match_percentage: Math.round((eligibleStudents.length / mockStudents.length) * 100),
        }
      })

      setCompanyMatches(matches)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    switch (filterType) {
      case "weak":
        return student.overall_score < 60
      case "average":
        return student.overall_score >= 60 && student.overall_score < 75
      case "strong":
        return student.overall_score >= 75
      default:
        return true
    }
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Strong</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Average</Badge>
    return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Weak</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading placement officer dashboard...</p>
        </div>
      </div>
    )
  }

  // Chart data
  const scoreDistribution = [
    {
      name: "Weak (< 60)",
      count: students.filter((s) => s.overall_score < 60).length,
      fill: "hsl(var(--destructive))",
    },
    {
      name: "Average (60-74)",
      count: students.filter((s) => s.overall_score >= 60 && s.overall_score < 75).length,
      fill: "hsl(var(--chart-3))",
    },
    { name: "Strong (75+)", count: students.filter((s) => s.overall_score >= 75).length, fill: "hsl(var(--chart-1))" },
  ]

  const skillsData = [
    { skill: "Resume", average: Math.round(students.reduce((sum, s) => sum + s.resume_score, 0) / students.length) },
    {
      skill: "Aptitude",
      average: Math.round(students.reduce((sum, s) => sum + s.aptitude_score, 0) / students.length),
    },
    {
      skill: "Soft Skills",
      average: Math.round(students.reduce((sum, s) => sum + s.soft_skills_score, 0) / students.length),
    },
    {
      skill: "Interview",
      average: Math.round(students.reduce((sum, s) => sum + s.interview_score, 0) / students.length),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Placement Officer Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage student progress and company placements</p>
                {user && <p className="text-xs text-muted-foreground mt-1">{user.email}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{analytics?.total_students}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="seminars">Seminars</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{analytics?.total_students}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active in batch</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{analytics?.average_score}</div>
                  <Progress value={analytics?.average_score || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                    Weak Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{analytics?.weak_students_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2 text-green-500" />
                    Strong Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{analytics?.strong_students_count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Placement ready</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Student performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {scoreDistribution.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Average</CardTitle>
                  <CardDescription>Batch performance by skill area</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={skillsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="skill" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Weak Areas & Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Areas Needing Attention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Weak Areas Identified:</h4>
                    <div className="space-y-2">
                      {analytics?.weak_areas.map((area, index) => (
                        <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-400 font-medium">{area}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Suggested Actions:</h4>
                    <div className="space-y-2">
                      {analytics?.suggested_seminars.map((seminar, index) => (
                        <div key={index} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-sm text-blue-400 font-medium">{seminar}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>Monitor and manage individual student progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="weak">Weak (&lt; 60)</SelectItem>
                      <SelectItem value="average">Average (60-74)</SelectItem>
                      <SelectItem value="strong">Strong (75+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Students List */}
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="p-4 border border-border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium text-foreground">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                            {getScoreBadge(student.overall_score)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(student.overall_score)}`}>
                              {student.overall_score}
                            </div>
                            <div className="text-xs text-muted-foreground">Overall</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-foreground">{student.resume_score}</div>
                            <div className="text-xs text-muted-foreground">Resume</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-foreground">{student.aptitude_score}</div>
                            <div className="text-xs text-muted-foreground">Aptitude</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-foreground">{student.soft_skills_score}</div>
                            <div className="text-xs text-muted-foreground">Soft Skills</div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary" />
                  Company Requirements & Matching
                </CardTitle>
                <CardDescription>Manage company requirements and match students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {companyMatches.map((match) => (
                    <div key={match.company.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{match.company.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {match.match_percentage}% of students eligible
                          </p>
                        </div>
                        <Badge variant={match.eligible ? "default" : "secondary"}>
                          {match.eligible ? "Active" : "No Matches"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Requirements:</h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Min Overall Score: {match.company.requirements.min_overall_score}</li>
                            <li>• Min Aptitude Score: {match.company.requirements.min_aptitude_score}</li>
                            <li>• Min CGPA: {match.company.requirements.min_cgpa}</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Required Skills:</h5>
                          <div className="flex flex-wrap gap-2">
                            {match.company.requirements.required_skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Eligible Students
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit Requirements
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seminars" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Training Programs & Seminars
                </CardTitle>
                <CardDescription>Organize training based on identified weak areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-semibold text-blue-400 mb-2">Recommended Seminars</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on current batch performance, these seminars are recommended:
                    </p>
                    <div className="space-y-3">
                      {analytics?.suggested_seminars.map((seminar, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                          <div>
                            <h5 className="font-medium text-foreground">{seminar}</h5>
                            <p className="text-sm text-muted-foreground">
                              {seminar.includes("Resume")
                                ? "3 students need improvement"
                                : "4 students need improvement"}
                            </p>
                          </div>
                          <Button size="sm">Schedule</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Available Training Programs</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Technical Skills Bootcamp</CardTitle>
                          <CardDescription>Programming, algorithms, and system design</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Duration: 2 weeks</p>
                            <p className="text-muted-foreground">Target: Students with aptitude score &lt; 65</p>
                          </div>
                          <Button className="w-full mt-3 bg-transparent" variant="outline">
                            Schedule Program
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Communication Workshop</CardTitle>
                          <CardDescription>Soft skills and interview preparation</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Duration: 1 week</p>
                            <p className="text-muted-foreground">Target: Students with soft skills score &lt; 70</p>
                          </div>
                          <Button className="w-full mt-3 bg-transparent" variant="outline">
                            Schedule Program
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Resume Building Session</CardTitle>
                          <CardDescription>Professional resume writing and formatting</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Duration: 3 days</p>
                            <p className="text-muted-foreground">Target: Students with resume score &lt; 70</p>
                          </div>
                          <Button className="w-full mt-3 bg-transparent" variant="outline">
                            Schedule Program
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Mock Interview Series</CardTitle>
                          <CardDescription>Practice interviews with industry experts</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">Duration: Ongoing</p>
                            <p className="text-muted-foreground">Target: All students</p>
                          </div>
                          <Button className="w-full mt-3 bg-transparent" variant="outline">
                            Schedule Program
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
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
