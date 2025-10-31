"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  category: string
}

interface SoftSkillsTestProps {
  studentId: string
  onComplete?: (score: number) => void
}

export function SoftSkillsTest({ studentId, onComplete }: SoftSkillsTestProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/soft-skills/questions')
        const data = await response.json()
        
        if (response.ok) {
          setQuestions(data.questions)
        } else {
          alert(data.error || 'Failed to load questions')
        }
      } catch (error) {
        console.error('Error fetching questions:', error)
        alert('Failed to load questions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  // Timer
  useEffect(() => {
    if (!testStarted || testCompleted) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testStarted, testCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: optionIndex
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      const unanswered = questions.length - Object.keys(answers).length
      if (!confirm(`You have ${unanswered} unanswered questions. Do you want to submit anyway?`)) {
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/soft-skills/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          answers
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.result)
        setTestCompleted(true)
        if (onComplete) {
          onComplete(data.result.score)
        }
      } else {
        alert(data.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Failed to submit test')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCategoryBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Soft Skills Assessment...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!testStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soft Skills Assessment</CardTitle>
          <CardDescription>
            Test your soft skills including communication, leadership, teamwork, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>{questions.length} questions covering 7 categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>30 minutes duration</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Read each scenario carefully and choose the best response</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Categories Covered:</h4>
            <div className="flex flex-wrap gap-2">
              {['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Adaptability', 'Time Management', 'Emotional Intelligence'].map(cat => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>

          <Button onClick={() => setTestStarted(true)} className="w-full" size="lg">
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (testCompleted && results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soft Skills Assessment Results</CardTitle>
          <CardDescription>Here's your performance breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(results.score)}`}>
              {results.score}%
            </div>
            <p className="text-gray-600 mt-2">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Category Performance:</h4>
            {Object.entries(results.categoryScores).map(([category, score]: [string, any]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    {score >= 70 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    {category}
                  </span>
                  <Badge className={getCategoryBadgeColor(score)}>
                    {score}%
                  </Badge>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Recommendations:
            </h4>
            <ul className="space-y-1 text-sm">
              {Object.entries(results.categoryScores).map(([category, score]: [string, any]) => {
                if (score < 70) {
                  return (
                    <li key={category} className="text-gray-700">
                      • Focus on improving your <strong>{category}</strong> skills (current: {score}%)
                    </li>
                  )
                }
                return null
              }).filter(Boolean)}
              {Object.values(results.categoryScores).every((score: any) => score >= 70) && (
                <li className="text-gray-700">
                  • Great job! You're performing well across all categories. Keep practicing to maintain these skills.
                </li>
              )}
            </ul>
          </div>

          <Button onClick={() => window.location.reload()} className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg">{currentQuestion.question}</div>

        <RadioGroup
          value={answers[currentQuestion.id]?.toString()}
          onValueChange={(value) => handleAnswerSelect(parseInt(value))}
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-start space-x-3 space-y-0 p-4 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className="font-normal cursor-pointer flex-1"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {Object.keys(answers).length} / {questions.length} answered
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
