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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Weekly Goals</h2>
          <p className="text-sm text-muted-foreground">Track your study targets</p>
        </div>
      </div>
      
      <div className="grid gap-4 animate-stagger">
        {goalProgress.map((gp, index) => (
          <Card
            key={gp.goal.id}
            className={`relative overflow-hidden p-6 border-border/50 transition-all duration-300 hover:shadow-lg hover-lift ${
              gp.is_met
                ? 'bg-gradient-to-br from-success/15 via-success/5 to-card/30 border-success/30'
                : 'bg-gradient-to-br from-primary/10 via-card to-card/50 border-primary/20'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-16 -mt-16" />
            
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {gp.goal.subject_name || 'Overall Study'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {gp.current_week_minutes} / {gp.goal.weekly_target_minutes} minutes
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    {gp.is_met ? (
                      <Award className="h-5 w-5 text-success animate-float" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <span className={`text-3xl font-bold ${
                    gp.is_met ? 'text-success' : 'text-primary'
                  }`}>
                    {gp.weekly_progress_percent}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Progress
                  value={gp.weekly_progress_percent}
                  className="h-3 bg-secondary"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>📅 This week</span>
                  <span>⏱️ {gp.goal.daily_target_minutes}m daily</span>
                </div>
              </div>

              {gp.is_met && (
                <div className="p-3 bg-gradient-to-r from-success/20 to-success/10 border border-success/30 rounded-lg text-success text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  Goal achieved! Keep the momentum going!
                </div>
              )}
              
              {!gp.is_met && gp.weekly_progress_percent > 50 && (
                <div className="p-3 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-lg text-primary text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  Great progress! {gp.goal.weekly_target_minutes - gp.current_week_minutes}m to go
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
