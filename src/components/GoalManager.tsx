import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveGoal, deleteGoal, fetchUserGoals, Goal } from '@/lib/goals';

interface GoalManagerProps {
  userId: string;
  subjectId?: string | null;
  subjectName?: string | null;
  onGoalSaved?: () => void;
}

export function GoalManager({ userId, subjectId, subjectName, onGoalSaved }: GoalManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [dailyTarget, setDailyTarget] = useState('60');
  const [weeklyTarget, setWeeklyTarget] = useState('300');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, [userId, subjectId]);

  const loadGoals = async () => {
    try {
      const userGoals = await fetchUserGoals(userId);
      setGoals(userGoals);

      // Pre-fill if editing a subject-specific goal
      if (subjectId) {
        const subjectGoal = userGoals.find((g) => g.subject_id === subjectId);
        if (subjectGoal) {
          setDailyTarget(subjectGoal.daily_target_minutes.toString());
          setWeeklyTarget(subjectGoal.weekly_target_minutes.toString());
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyTarget || !weeklyTarget) {
      toast({
        title: 'Invalid input',
        description: 'Please enter valid goal values',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await saveGoal(
        userId,
        subjectId || null,
        subjectName || null,
        parseInt(dailyTarget),
        parseInt(weeklyTarget)
      );

      toast({
        title: 'Success!',
        description: `Goal saved for ${subjectName || 'overall'} study`,
      });

      await loadGoals();
      onGoalSaved?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setLoading(true);
    try {
      await deleteGoal(goalId);
      toast({
        title: 'Goal deleted',
        description: 'Your goal has been removed',
      });
      await loadGoals();
      onGoalSaved?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border/50 shadow-xl hover-lift md-elevate transition-smooth animate-slide-up">
        <h3 className="text-lg font-semibold mb-4">
          {subjectName ? `Goals for ${subjectName}` : 'Study Goals'}
        </h3>

        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily">Daily Target (minutes)</Label>
              <Input
                id="daily"
                type="number"
                placeholder="60"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
                min="5"
                step="5"
                className="border-border/50"
              />
              <p className="text-xs text-muted-foreground">Min study time per day</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly">Weekly Target (minutes)</Label>
              <Input
                id="weekly"
                type="number"
                placeholder="300"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                min="30"
                step="30"
                className="border-border/50"
              />
              <p className="text-xs text-muted-foreground">Total study time per week</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 transition-smooth hover:scale-105 active:scale-95"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Set Goal'}
          </Button>
        </form>
      </Card>

      {/* Display all goals if viewing overall */}
      {!subjectId && goals.length > 0 && (
        <Card className="p-6 border-border/50 shadow-xl">
          <h3 className="text-lg font-semibold mb-4">Your Goals</h3>
          <div className="space-y-3 animate-stagger">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-smooth hover-lift"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {goal.subject_name || 'Overall Study Goal'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {goal.daily_target_minutes}m daily / {goal.weekly_target_minutes}m weekly
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setDailyTarget(goal.daily_target_minutes.toString());
                      setWeeklyTarget(goal.weekly_target_minutes.toString());
                      setIsEditing(true);
                    }}
                    className="hover:bg-primary/10 hover:text-primary transition-smooth"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="hover:bg-destructive/10 hover:text-destructive transition-smooth"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
