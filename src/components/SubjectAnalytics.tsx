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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Subject Analytics</h2>
      
      <div className="grid gap-4 animate-stagger">
        {subjects.map((subject, index) => (
          <Card
            key={subject.subjectId}
            className="p-6 border-border/50 hover-lift transition-smooth animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: subject.subjectColor }}
                />
                <div>
                  <h3 className="font-semibold">{subject.subjectName}</h3>
                  <p className="text-sm text-muted-foreground">{subject.sessionCount} sessions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{subject.totalMinutes}</p>
                <p className="text-xs text-muted-foreground">total minutes</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Avg Session</p>
                </div>
                <p className="text-lg font-bold text-primary">{subject.averageSessionDuration}m</p>
              </div>

              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-accent" />
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <p className="text-lg font-bold text-accent">{subject.sessionCount}</p>
              </div>

              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-success" />
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                </div>
                <p className="text-lg font-bold text-success">
                  {(subject.totalMinutes / 60).toFixed(1)}h
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
