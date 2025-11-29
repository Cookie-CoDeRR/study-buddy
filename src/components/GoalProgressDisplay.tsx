import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Award } from 'lucide-react';
import { getUserGoalProgress, GoalProgress } from '@/lib/goals';

interface GoalProgressDisplayProps {
  userId: string;
}

export function GoalProgressDisplay({ userId }: GoalProgressDisplayProps) {
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoalProgress();
    // Refresh every 30 seconds
    const interval = setInterval(loadGoalProgress, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadGoalProgress = async () => {
    try {
      const progress = await getUserGoalProgress(userId);
      setGoalProgress(progress);
    } catch (error) {
      console.error('Error loading goal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-border/50 animate-pulse">
        <p className="text-muted-foreground">Loading goals...</p>
      </Card>
    );
  }

  if (goalProgress.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-border/50 text-center">
        <Target className="h-8 w-8 text-primary/50 mx-auto mb-2" />
        <p className="text-muted-foreground">No goals set yet. Create your first goal to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Weekly Goal Progress</h2>
      
      <div className="grid gap-4 animate-stagger">
        {goalProgress.map((gp) => (
          <Card
            key={gp.goal.id}
            className={`p-6 border-border/50 transition-smooth hover-lift ${
              gp.is_met
                ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20'
                : 'bg-gradient-to-br from-card/50 to-card/30'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {gp.goal.subject_name || 'Overall Study'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {gp.current_week_minutes} / {gp.goal.weekly_target_minutes} minutes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {gp.is_met ? (
                    <Award className="h-5 w-5 text-success animate-float" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  )}
                  <span className="text-2xl font-bold">{gp.weekly_progress_percent}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Progress
                  value={gp.weekly_progress_percent}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>This week</span>
                  <span>{gp.goal.daily_target_minutes}m daily goal</span>
                </div>
              </div>

              {gp.is_met && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-medium">
                  ✨ Goal achieved this week!
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
