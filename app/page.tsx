"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Building2, BarChart3 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">PlacementReady</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            Your Complete Placement Readiness Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Track your progress, improve your skills, and get ready for your dream job with our comprehensive assessment
            and guidance system.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription className="text-base">
                Access your personalized dashboard, take assessments, and track your placement readiness
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Track your readiness score</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Take aptitude tests</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Get resume feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">View personalized roadmap</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
                  Login as Student
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => router.push('/register')}>
                  Register New Student
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Placement Officer</CardTitle>
              <CardDescription className="text-base">
                Monitor student progress, manage company requirements, and organize training programs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">View batch analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Match students to companies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Identify weak areas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Suggest training programs</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={() => router.push('/login')}>
                  Login as Officer
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => router.push('/officer-register')}>
                  Register as Officer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Smart Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time progress tracking with detailed analytics and personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span>Comprehensive Tests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Aptitude tests, resume analysis, and soft skills assessment with instant feedback.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Company Matching</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intelligent matching system to connect students with suitable company opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
