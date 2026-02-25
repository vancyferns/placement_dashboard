'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Award, Sparkles, ClipboardCheck, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown'; // <-- NEW IMPORT

// --- New state for the interview flow ---
type InterviewState = 'idle' | 'in_progress' | 'generating_report' | 'finished';

const INTERVIEW_DURATION = 300; // 300 seconds = 5 minutes

export default function MockInterview() {
  const [interviewState, setInterviewState] = useState<InterviewState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('Welcome! Click "Start Interview" when you are ready.');
  const [isLoading, setIsLoading] = useState(false); 
  const [finalReport, setFinalReport] = useState(''); // For the final report
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text-to-Speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech Synthesis not supported.');
    }
  };

  // Timer useEffect
  useEffect(() => {
    if (interviewState === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleEndInterview(true); // End interview when timer hits 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewState]);

  // Speech Recognition useEffect
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.error('Speech Recognition not supported.');
    }
  }, []);

  const handleListen = () => {
    if (isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition start error:", error);
        alert("Could not start speech recognition. Please use Chrome and allow microphone access.");
      }
    }
  };

  // Main logic loop
  const handleSubmitAnswer = async (answer: string) => {
    setIsLoading(true);
    setTranscript('...'); // Show user we are processing
    
    // Store the current question and answer
    const newHistory = [...history, { question: currentQuestion, answer: answer }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, answer: answer }),
      });

      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      const newAiResponse = data.response;

      // Check if AI said to end the interview
      if (newAiResponse.trim() === "INTERVIEW_ENDED") {
        await handleEndInterview(false, newHistory); // Pass false for "not time up"
        return;
      }
      
      // --- If not ending, continue to the next question ---
      setCurrentQuestion(newAiResponse);
      speak(newAiResponse);

    } catch (error) {
      console.error(error);
      const errorText = "Sorry, I'm having trouble connecting. Please try again.";
      setCurrentQuestion(errorText); // Use currentQuestion, not aiResponse
      speak(errorText);
    } finally {
      setIsLoading(false);
      setTranscript('');
    }
  };

  // Function to start the interview
  const handleStartInterview = async () => {
    setInterviewState('in_progress');
    setIsLoading(true);
    
    // This is a "fake" answer to get the first question
    const firstAnswer = "I am ready to begin"; 
    const firstQuestion = "Welcome"; // Placeholder

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: firstQuestion, answer: firstAnswer }),
      });
      if (!res.ok) throw new Error("Failed to get AI response");

      const data = await res.json();
      const newAiResponse = data.response;
      setCurrentQuestion(newAiResponse);
      speak(newAiResponse);
    } catch (error) {
      console.error(error);
      const errorText = "Sorry, I'm having trouble connecting. Please try again.";
      setCurrentQuestion(errorText);
      speak(errorText);
    } finally {
      setIsLoading(false);
      setTranscript('');
    }
  };

  // Function to end the interview and get report
  const handleEndInterview = async (isTimeUp: boolean, finalHistory?: { question: string, answer: string }[]) => {
    setInterviewState('generating_report');
    if (isTimeUp) {
      speak("Great, that's all the time we have. I'm generating your performance report now.");
    } else {
      speak("Thank you for completing the interview. I'm generating your performance report now.");
    }

    const transcript = finalHistory || history; // Use the most up-to-date history

    try {
      const res = await fetch('/api/interview-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: transcript }),
      });
      if (!res.ok) throw new Error("Failed to generate report");

      const data = await res.json();
      setFinalReport(data.report);
      setInterviewState('finished');
      speak("Your report is ready. You can review it now.");

    } catch (error) {
      console.error("Report generation failed:", error);
      setInterviewState('finished'); // Go to report screen even if it fails
      setFinalReport("# Error\n\nSorry, I was unable to generate your report. Please try again.");
      speak("Sorry, I was unable to generate your report.");
    } finally {
      setIsLoading(false);
      setTimeLeft(INTERVIEW_DURATION); // Reset timer
    }
  };

  // Function to restart the interview
  const handleRestart = () => {
    setHistory([]);
    setFinalReport('');
    setCurrentQuestion('Welcome! Click "Start Interview" when you are ready.');
    setTranscript('');
    setInterviewState('idle');
    setTimeLeft(INTERVIEW_DURATION);
  };

  // This useEffect triggers when listening stops
  useEffect(() => {
    if (!isListening && transcript && !isLoading && interviewState === 'in_progress') {
      if (transcript !== '...') {
        handleSubmitAnswer(transcript);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  // Helper to format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- RENDER LOGIC ---

  // 1. Idle State (Welcome Screen)
  if (interviewState === 'idle') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Award className="h-6 w-6 mr-2 text-primary" />
              AI Mock Interview
            </CardTitle>
            <CardDescription>Get ready to practice your skills!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              This is a 5-minute timed interview.
            </p>
            <p>You will be evaluated on:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Clarity and conciseness of your answers.</li>
              <li>Use of the STAR method for behavioral questions.</li>
              <li>Your technical knowledge (if applicable).</li>
              <li>Your overall enthusiasm and communication.</li>
            </ul>
            <p>
              When you're ready, click the button below to start. The AI will ask the first question.
            </p>
            <Button onClick={handleStartInterview} className="w-full" size="lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. In-Progress State (The Interview)
  if (interviewState === 'in_progress') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-xl font-semibold mb-2 text-primary">Interviewer:</CardTitle>
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
              <Timer className="h-4 w-4 inline-block mr-1" />
              {formatTime(timeLeft)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground">{currentQuestion}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold mb-2 text-secondary-foreground">You (Transcribed):</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[80px]">
            <p className="text-lg text-muted-foreground">{transcript || 'Your answer will appear here...'}</p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleListen}
            disabled={isLoading} 
            className={`px-8 py-4 h-20 w-20 rounded-full text-white font-bold text-lg transition-all transform hover:scale-105 ${
              isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
            } ${isLoading ? 'bg-gray-500 cursor-not-allowed' : ''}`}
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isListening ? '...' : 'Talk')}
          </Button>
        </div>
        
        <p className="text-center text-muted-foreground text-sm">
          {isListening ? 'Listening... click again to stop.' : 'Press the button to give your answer.'}
        </p>
      </div>
    );
  }

  // 3. Generating Report State (Loading)
  if (interviewState === 'generating_report') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 flex flex-col items-center justify-center p-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-xl text-muted-foreground">Generating your report...</p>
      </div>
    );
  }

  // 4. Finished State (Final Report)
  if (interviewState === 'finished') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <ClipboardCheck className="h-6 w-6 mr-2 text-primary" />
              Interview Report
            </CardTitle>
            <CardDescription>Here's your performance breakdown.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This renders the Markdown from the AI */}
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{finalReport}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
        <Button onClick={handleRestart} className="w-full" size="lg">
          Take Another Interview
        </Button>
      </div>
    );
  }

  return null; // Should be unreachable
}