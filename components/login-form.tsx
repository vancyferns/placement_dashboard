"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { UserCircle, Briefcase } from "lucide-react"

export function LoginForm() {
  const [studentEmail, setStudentEmail] = useState("")
  const [officerEmail, setOfficerEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!studentEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const success = await login(studentEmail, 'STUDENT')
      
      if (success) {
        toast({
          title: "Login Successful! 🎉",
          description: "Welcome back! Redirecting to your dashboard...",
        })
        
        setTimeout(() => {
          router.push('/student-dashboard')
        }, 1000)
      } else {
        toast({
          title: "Login Failed",
          description: "Student not found. Please register first.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!officerEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const success = await login(officerEmail, 'OFFICER')
      
      if (success) {
        toast({
          title: "Login Successful! 🎉",
          description: "Welcome back! Redirecting to your dashboard...",
        })
        
        setTimeout(() => {
          router.push('/officer-dashboard')
        }, 1000)
      } else {
        toast({
          title: "Login Failed",
          description: "Officer account not found. Please contact admin.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Placement Portal Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="officer" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Officer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4 mt-6">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email Address</Label>
                  <Input
                    id="student-email"
                    type="email"
                    placeholder="your.email@college.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Student"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="/register" className="text-blue-600 hover:underline font-semibold">
                    Register here
                  </a>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="officer" className="space-y-4 mt-6">
              <form onSubmit={handleOfficerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="officer-email">Email Address</Label>
                  <Input
                    id="officer-email"
                    type="email"
                    placeholder="officer@college.edu"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Officer"}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Need officer access?{" "}
                  <a href="/officer-register" className="text-blue-600 hover:underline font-semibold">
                    Register here
                  </a>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Demo Access:</strong>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Use any registered student email to login, or register a new account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
