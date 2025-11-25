import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Coffee } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface StudyTimerProps {
  subjectId?: string;
  subjectName?: string;
  userId: string;
}

const StudyTimer = ({ subjectId, subjectName, userId }: StudyTimerProps) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setSessionStart(new Date());
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    if (!sessionStart || seconds === 0) return;

    const endTime = new Date();
    const durationMinutes = Math.floor(seconds / 60);

    try {
      await addDoc(collection(db, 'study_sessions'), {
        user_id: userId,
        subject_id: subjectId || null,
        start_time: sessionStart.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        session_type: isBreak ? "break" : "study",
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().getTime(),
      });

      toast({
        title: "Session saved!",
        description: `${isBreak ? "Break" : "Study"} session of ${durationMinutes} minutes recorded.`,
      });

      setSeconds(0);
      setIsRunning(false);
      setSessionStart(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleMode = () => {
    if (isRunning) {
      toast({
        title: "Stop the timer first",
        description: "Please stop the current session before switching modes.",
        variant: "destructive",
      });
      return;
    }
    setIsBreak(!isBreak);
    setSeconds(0);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-timer-bg to-card border-border/50 shadow-xl">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isBreak ? (
            <Coffee className="h-6 w-6 text-timer-accent" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-timer-text" />
          )}
          <h3 className="text-xl font-semibold text-foreground">
            {isBreak ? "Break Time" : subjectName || "Study Session"}
          </h3>
        </div>

        <div className="relative">
          <div className="text-7xl font-bold text-timer-text font-mono tracking-tight">
            {formatTime(seconds)}
          </div>
          {isRunning && (
            <div className="absolute -inset-4 bg-timer-text/5 rounded-2xl blur-xl animate-pulse" />
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={handlePause}
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary/5"
              >
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </Button>
              <Button
                onClick={handleStop}
                size="lg"
                variant="destructive"
                className="shadow-lg shadow-destructive/20"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop & Save
              </Button>
            </>
          )}
        </div>

        <Button
          onClick={toggleMode}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          Switch to {isBreak ? "Study" : "Break"} Mode
        </Button>
      </div>
    </Card>
  );
};

export default StudyTimer;
