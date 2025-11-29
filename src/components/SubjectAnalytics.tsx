import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, Zap } from 'lucide-react';
import { getSubjectAnalytics, SubjectStat } from '@/lib/analytics';

interface SubjectAnalyticsProps {
  userId: string;
}

export function SubjectAnalytics({ userId }: SubjectAnalyticsProps) {
  const [subjects, setSubjects] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      const stats = await getSubjectAnalytics(userId);
      setSubjects(stats);
    } catch (error) {
      console.error('Error loading subject analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border/50 animate-pulse">
        <p className="text-muted-foreground">Loading analytics...</p>
      </Card>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="p-6 text-center border-border/50">
        <BookOpen className="h-8 w-8 text-primary/50 mx-auto mb-2" />
        <p className="text-muted-foreground">No study sessions yet. Start studying to see analytics!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Subject Analytics</h2>
          <p className="text-sm text-muted-foreground">Study breakdown by subject</p>
        </div>
      </div>
      
      <div className="grid gap-4 animate-stagger">
        {subjects.map((subject, index) => (
          <Card
            key={subject.subjectId}
            className="relative overflow-hidden p-6 border-border/50 hover-lift transition-all duration-300 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Color accent bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: subject.subjectColor }}
            />
            
            <div className="ml-2 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: subject.subjectColor + '20', borderLeft: `3px solid ${subject.subjectColor}` }}
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{subject.subjectName}</h3>
                    <p className="text-xs text-muted-foreground">📚 {subject.sessionCount} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{subject.totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">minutes</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs font-medium text-muted-foreground">Avg</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{subject.averageSessionDuration}m</p>
                  <p className="text-xs text-muted-foreground mt-1">per session</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-lg border border-purple-200/50 dark:border-purple-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs font-medium text-muted-foreground">Total</p>
                  </div>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{subject.sessionCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">sessions</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-900/10 rounded-lg border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium text-muted-foreground">Hours</p>
                  </div>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(subject.totalMinutes / 60).toFixed(1)}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">total</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
