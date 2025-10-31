"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Brain } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  category: string
}

interface TestResult {
  score: number
  correct_answers: number
  total_questions: number
  feedback: string[]
}

interface AptitudeTestProps {
  studentId: string
  onComplete?: (score: number) => void
}

export default function AptitudeTest({ studentId, onComplete }: AptitudeTestProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [loading, setLoading] = useState(false)

  // Mock questions data (in real app, this would come from the API)
  const mockQuestions: Question[] = [
    {
      id: "q1",
      question: "If a train travels 120 km in 2 hours, what is its average speed?",
      options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"],
      correct_answer: 1,
      category: "quantitative",
    },
    {
      id: "q2",
      question: "Complete the series: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correct_answer: 1,
      category: "logical",
    },
    {
      id: "q3",
      question: "Choose the word most similar to 'Abundant':",
      options: ["Scarce", "Plentiful", "Limited", "Rare"],
      correct_answer: 1,
      category: "verbal",
    },
    {
      id: "q4",
      question: "If 3x + 7 = 22, what is the value of x?",
      options: ["3", "4", "5", "6"],
      correct_answer: 2,
      category: "quantitative",
    },
    {
      id: "q5",
      question: "Which number comes next: 1, 4, 9, 16, 25, ?",
      options: ["30", "32", "36", "40"],
      correct_answer: 2,
      category: "logical",
    },
  ]

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !testCompleted) {
      handleSubmitTest()
    }
  }, [testStarted, timeLeft, testCompleted])

  const startTest = async () => {
    try {
      const response = await fetch('/api/aptitude/questions')
      const data = await response.json()
      setQuestions(data.questions || [])
      setTestStarted(true)
      setCurrentQuestion(0)
      setAnswers({})
      setTimeLeft(1800) // Reset timer
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      // Fallback to mock questions if API fails
      setQuestions(mockQuestions)
      setTestStarted(true)
      setCurrentQuestion(0)
      setAnswers({})
      setTimeLeft(1800)
    }
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/aptitude/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId, // Use the passed studentId prop
          answers,
          questions, // Send questions for validation
        }),
      })

      const result = await response.json()

      setResult({
        score: result.score,
        correct_answers: result.correct_answers,
        total_questions: result.total_questions,
        feedback: result.feedback,
      })

      setTestCompleted(true)
      
      // Callback to refresh dashboard
      if (onComplete) {
        onComplete(result.score)
      }
    } catch (error) {
      console.error('Failed to submit test:', error)
      
      // Fallback to local calculation
      const correctCount = questions.reduce((count, question) => {
        return answers[question.id] === question.correct_answer ? count + 1 : count
      }, 0)

      const score = Math.round((correctCount / questions.length) * 100)

      setResult({
        score,
        correct_answers: correctCount,
        total_questions: questions.length,
        feedback: ['Test submitted. Please check with your administrator.'],
      })

      setTestCompleted(true)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const resetTest = () => {
    setTestStarted(false)
    setTestCompleted(false)
    setResult(null)
    setCurrentQuestion(0)
    setAnswers({})
    setTimeLeft(1800)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Evaluating your answers...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (testCompleted && result) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              Test Completed!
            </CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{result.score}/100</div>
              <div className="text-muted-foreground">
                {result.correct_answers} out of {result.total_questions} questions correct
              </div>
              <Progress value={result.score} className="mt-4 max-w-md mx-auto" />
            </div>

            <div className="flex gap-3">
              <Button onClick={resetTest} variant="outline" className="flex-1 bg-transparent">
                Take Another Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Show all questions with answers */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review all questions with correct answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;
              
              return (
                <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{q.category}</Badge>
                      <span className="font-semibold">Question {index + 1}</span>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-red-500 font-semibold">✗</span>
                    )}
                  </div>
                  
                  <p className="text-foreground font-medium mb-3">{q.question}</p>
                  
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectAnswer = q.correct_answer === optIndex;
                      
                      return (
                        <div 
                          key={optIndex}
                          className={`p-2 rounded ${
                            isCorrectAnswer 
                              ? 'bg-green-500/20 border border-green-500/50' 
                              : isUserAnswer 
                              ? 'bg-red-500/20 border border-red-500/50'
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {isUserAnswer && !isCorrectAnswer && <span className="text-red-500">✗</span>}
                            <span className={isCorrectAnswer ? 'font-semibold text-green-700 dark:text-green-400' : ''}>
                              {option}
                            </span>
                            {isUserAnswer && <span className="text-xs text-muted-foreground">(Your answer)</span>}
                            {isCorrectAnswer && <span className="text-xs text-green-600 dark:text-green-400">(Correct answer)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            Aptitude Test
          </CardTitle>
          <CardDescription>Test your quantitative, logical, and verbal reasoning skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">10</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">30</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">Mixed</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Test Instructions:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You have 30 minutes to complete 10 questions</li>
              <li>• Questions cover quantitative, logical, and verbal reasoning</li>
              <li>• You can navigate between questions and change answers</li>
              <li>• The test will auto-submit when time runs out</li>
              <li>• You'll receive instant feedback and recommendations</li>
            </ul>
          </div>

          <Button onClick={startTest} className="w-full" size="lg">
            Start Aptitude Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary" />
              Question {currentQuestion + 1} of {questions.length}
            </CardTitle>
            <CardDescription>
              <Badge variant="outline" className="mt-1">
                {currentQ?.category}
              </Badge>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={timeLeft < 300 ? "text-red-500 font-semibold" : "text-muted-foreground"}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">{currentQ?.question}</h3>

          <RadioGroup
            value={answers[currentQ?.id] !== undefined ? answers[currentQ?.id].toString() : undefined}
            onValueChange={(value) => handleAnswerSelect(currentQ.id, Number.parseInt(value))}
          >
            {currentQ?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button onClick={previousQuestion} disabled={currentQuestion === 0} variant="outline">
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmitTest} disabled={Object.keys(answers).length !== questions.length}>
                Submit Test
              </Button>
            ) : (
              <Button onClick={nextQuestion} disabled={answers[currentQ?.id] === undefined}>
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : "outline"}
                size="sm"
                className="w-10 h-10 p-0"
                onClick={() => setCurrentQuestion(index)}
              >
                {answers[questions[index]?.id] !== undefined ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
