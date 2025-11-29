import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 animate-slide-up">
      <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700/50 hover-lift md-elevate transition-smooth">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-5 w-5 text-orange-500 animate-float" />
          <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
        </div>
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 animate-streak-pop">{currentStreak}</p>
        <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700/50 hover-lift md-elevate transition-smooth">
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-5 w-5 text-yellow-500 animate-float" style={{ animationDelay: '0.5s' }} />
          <span className="text-sm font-medium text-muted-foreground">Longest Streak</span>
        </div>
        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 animate-streak-pop">{longestStreak}</p>
        <p className="text-xs text-muted-foreground mt-1">all time record</p>
      </Card>
    </div>
  );
};

export default StreakDisplay;
