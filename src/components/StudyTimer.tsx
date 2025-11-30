import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Square, Coffee } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { updateStreakForNewSession } from "@/lib/streak";
import { format } from "date-fns";

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
  const [presetDurationMinutes, setPresetDurationMinutes] = useState<number | null>(null);
  const { toast } = useToast();

  const POMODORO_PRESETS = [
    { label: 'Quick Session', minutes: 15, isStudy: true },
    { label: 'Pomodoro', minutes: 25, isStudy: true },
    { label: 'Deep Focus', minutes: 50, isStudy: true },
    { label: 'Short Break', minutes: 5, isStudy: false },
    { label: 'Long Break', minutes: 15, isStudy: false },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          // If we have a preset duration, countdown from it; otherwise count up
          if (presetDurationMinutes) {
            const presetSeconds = presetDurationMinutes * 60;
            // Count down
            if (prev <= 0) {
              setIsRunning(false);
              toast({
                title: "Time's up!",
                description: `Your ${isBreak ? "break" : "study"} session is complete!`,
              });
              return 0;
            }
            return prev - 1;
          } else {
            // Count up (for manual timer)
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, presetDurationMinutes, isBreak, toast]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage for circular indicator
  const getProgressPercentage = () => {
    if (presetDurationMinutes) {
      const presetSeconds = presetDurationMinutes * 60;
      return Math.max(0, (seconds / presetSeconds) * 100);
    }
    return 0;
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
    // Calculate actual elapsed time: if we had a preset, subtract remaining time from it
    let durationMinutes: number;
    if (presetDurationMinutes) {
      const presetSeconds = presetDurationMinutes * 60;
      const elapsedSeconds = presetSeconds - seconds;
      durationMinutes = Math.floor(elapsedSeconds / 60);
    } else {
      // For manual timer, use actual elapsed time
      durationMinutes = Math.floor(seconds / 60);
    }
    
    const todayDate = format(new Date(), 'yyyy-MM-dd');

    try {
      // Only update streak if it's a study session (not a break)
      if (!isBreak) {
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        const currentProfile = profileSnap.data();

        if (currentProfile) {
          const updatedStreak = updateStreakForNewSession(
            {
              current_streak: currentProfile.current_streak || 0,
              longest_streak: currentProfile.longest_streak || 0,
              last_study_date: currentProfile.last_study_date || null,
            },
            todayDate
          );

          await setDoc(profileRef, updatedStreak, { merge: true });
        }
      }

      await addDoc(collection(db, 'study_sessions'), {
        user_id: userId,
        subject_id: subjectId || null,
        start_time: sessionStart.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        session_type: isBreak ? "break" : "study",
        date: todayDate,
        created_at: new Date().getTime(),
      });

      toast({
        title: "Session saved!",
        description: `${isBreak ? "Break" : "Study"} session of ${durationMinutes} minutes recorded.`,
      });

      setSeconds(0);
      setIsRunning(false);
      setSessionStart(null);
      setPresetDurationMinutes(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleMode = () => {
    setIsRunning(false);
    setIsBreak(!isBreak);
    setSeconds(0);
    setSessionStart(null);
    setPresetDurationMinutes(null);
  };

  const applyPreset = (minutes: number, isStudy: boolean) => {
    // If already running, stop the current session first
    if (isRunning) {
      setSeconds(0);
      setIsRunning(false);
      setSessionStart(null);
      setPresetDurationMinutes(null);
    }
    
    // Set the new preset time and start immediately
    setSeconds(minutes * 60);
    setIsBreak(!isStudy);
    setSessionStart(new Date());
    setPresetDurationMinutes(minutes);
    setIsRunning(true);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-timer-bg to-card border-border/50 shadow-xl hover-lift md-elevate transition-smooth animate-slide-up">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isBreak ? (
            <Coffee className="h-6 w-6 text-timer-accent animate-float" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-timer-text animate-pulse-glow" />
          )}
          <h3 className="text-xl font-semibold text-foreground transition-smooth">
            {isBreak ? "Break Time" : subjectName || "Study Session"}
          </h3>
        </div>

        <div className="relative flex items-center justify-center py-12">
          {/* Circular Progress Indicator */}
          {presetDurationMinutes ? (
            <div className="relative w-80 h-96 flex items-center justify-center">
              <svg 
                className="absolute w-full h-full" 
                viewBox="0 0 200 280"
                style={{ 
                  transform: 'rotate(-45deg)',
                }}
              >
                {/* Background arc (270 degrees, centered) */}
                <path
                  d="M 100 20 A 80 80 0 1 1 20 100"
                  fill="none"
                  stroke={isBreak ? '#22c55e20' : '#3b82f620'}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Progress arc with wavy effect */}
                <path
                  d="M 100 20 A 80 80 0 1 1 20 100"
                  fill="none"
                  stroke={isBreak ? '#22c55e' : '#3b82f6'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="wave-animate transition-all duration-1000"
                  style={{
                    strokeDasharray: `${628.32 * (getProgressPercentage() / 100)} 628.32`,
                    filter: 'drop-shadow(0 0 6px ' + (isBreak ? '#22c55e80' : '#3b82f680') + ')',
                  }}
                />
              </svg>

              {/* Center content */}
              <div className="relative text-center z-10">
                <div className={`text-6xl font-bold font-mono tracking-tight transition-smooth ${
                  isBreak ? 'text-green-500' : 'text-timer-text'
                }`}>
                  {formatTime(seconds)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                  {presetDurationMinutes}m {isBreak ? 'Break' : 'Session'}
                </p>
              </div>
            </div>
          ) : (
            /* Standard timer display when no preset */
            <div className="relative py-12">
              <div className={`text-7xl font-bold font-mono tracking-tight transition-smooth ${
                isBreak ? 'text-green-500' : 'text-timer-text'
              }`}>
                {formatTime(seconds)}
              </div>
              {isRunning && (
                <div className={`absolute -inset-4 rounded-2xl blur-xl animate-pulse ${
                  isBreak ? 'bg-green-500/5' : 'bg-timer-text/5'
                }`} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          {!isRunning ? (
            <Button
              type="button"
              onClick={handleStart}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-smooth hover:scale-105 active:scale-95"
            >
              <Play className="mr-2 h-5 w-5" />
              Start
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={handlePause}
                size="lg"
                variant="outline"
                className="border-primary/20 hover:bg-primary/5"
              >
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </Button>
              <Button
                type="button"
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
          type="button"
          onClick={toggleMode}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground transition-smooth hover-glow"
        >
          Switch to {isBreak ? "Study" : "Break"} Mode
        </Button>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Pomodoro Presets</p>
          <div className="grid grid-cols-2 gap-2 animate-stagger">
            {POMODORO_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.minutes, preset.isStudy)}
                disabled={isRunning}
                variant={
                  seconds === preset.minutes * 60 && isBreak === !preset.isStudy
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                className="text-xs transition-smooth hover:scale-105 active:scale-95"
              >
                {preset.label}
                <span className="ml-1">({preset.minutes}m)</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudyTimer;
