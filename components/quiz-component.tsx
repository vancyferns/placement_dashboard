// components/quiz-component.tsx
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, Award } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index
}

interface QuizComponentProps {
  milestoneTitle: string;
  quizData: QuizQuestion[];
  onComplete: () => void; // Function to call when quiz is passed
}

export default function QuizComponent({ milestoneTitle, quizData, onComplete }: QuizComponentProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let newScore = 0;
    quizData.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        newScore++;
      }
    });
    
    setScore(newScore);
    setSubmitted(true);

    if (newScore === quizData.length) {
      toast({
        title: "Milestone Complete! 🥳",
        description: `Great job on the "${milestoneTitle}" quiz!`,
      });
      onComplete(); // Mark the milestone as complete
    } else {
      toast({
        title: "Almost there!",
        description: `You got ${newScore}/${quizData.length}. Review the materials and try again!`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-4 bg-background">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          End of Module Quiz
        </CardTitle>
        <CardDescription>Test your knowledge on "{milestoneTitle}" to complete this module.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {quizData.map((q, qIndex) => (
          <div key={qIndex} className="space-y-3">
            <p className="font-semibold">{qIndex + 1}. {q.question}</p>
            <RadioGroup
              value={answers[qIndex]?.toString()}
              onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
              disabled={submitted}
            >
              {q.options.map((option, oIndex) => {
                const isCorrect = oIndex === q.correctAnswer;
                const isSelected = answers[qIndex] === oIndex;
                
                return (
                  <div key={oIndex} className={`flex items-center space-x-2 p-2 rounded-md
                    ${submitted && isCorrect ? 'bg-green-500/10 border border-green-500/20' : ''}
                    ${submitted && !isCorrect && isSelected ? 'bg-red-500/10 border border-red-500/20' : ''}
                  `}>
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {submitted && isCorrect && <Check className="h-4 w-4 text-green-500" />}
                    {submitted && !isCorrect && isSelected && <X className="h-4 w-4 text-red-500" />}
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        ))}
        
        {submitted ? (
          <div className="text-center">
            <p className="text-2xl font-bold">Your Score: {score}/{quizData.length}</p>
            <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <Button onClick={handleSubmit} className="w-full" disabled={Object.keys(answers).length !== quizData.length}>
            Submit Quiz
          </Button>
        )}
      </CardContent>
    </Card>
  );
}