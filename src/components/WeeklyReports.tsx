import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getDailyStats, getWeeklyComparison, getSubjectAnalytics, DailyStats, WeeklyComparison, SubjectStat } from '@/lib/analytics';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface WeeklyReportsProps {
  userId: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export function WeeklyReports({ userId }: WeeklyReportsProps) {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [userId]);

  const loadReports = async () => {
    try {
      const [daily, comparison, subjects] = await Promise.all([
        getDailyStats(userId, 7),
        getWeeklyComparison(userId),
        getSubjectAnalytics(userId),
      ]);
      setDailyStats(daily);
      setWeeklyComparison(comparison);
      setSubjectStats(subjects);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border/50 animate-pulse">
        <p className="text-muted-foreground">Loading reports...</p>
      </Card>
    );
  }

  // Transform data for pie chart
  const pieData = subjectStats.map((s) => ({
    name: s.subjectName,
    value: s.totalMinutes,
  }));

  // Transform data for bar chart with date labels
  const barData = dailyStats.map((d) => {
    const date = new Date(d.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayName,
      Study: d.studyMinutes,
      Break: d.breakMinutes,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Weekly Reports</h2>

      {/* Weekly Comparison */}
      {weeklyComparison && (
        <Card className="p-6 border-border/50 hover-lift transition-smooth animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Week-over-Week Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">This Week</p>
              <p className="text-3xl font-bold text-primary">{weeklyComparison.currentWeekMinutes}</p>
              <p className="text-xs text-muted-foreground">minutes studied</p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Last Week</p>
              <p className="text-3xl font-bold text-accent">{weeklyComparison.previousWeekMinutes}</p>
              <p className="text-xs text-muted-foreground">minutes studied</p>
            </div>

            <div className={`p-4 rounded-lg border ${
              weeklyComparison.trend === 'up' 
                ? 'bg-success/10 border-success/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">Change</p>
              <div className="flex items-center gap-2">
                {weeklyComparison.trend === 'up' ? (
                  <TrendingUp className="h-6 w-6 text-success" />
                ) : weeklyComparison.trend === 'down' ? (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                ) : (
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                )}
                <div>
                  <p className="text-2xl font-bold">
                    {weeklyComparison.percentageChange > 0 ? '+' : ''}
                    {weeklyComparison.percentageChange}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Study Chart */}
      {barData.length > 0 && (
        <Card className="p-6 border-border/50 hover-lift transition-smooth animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Daily Study Time (Last 7 Days)</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(128, 128, 128, 0.5)" />
                <YAxis stroke="rgba(128, 128, 128, 0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${value}m`}
                />
                <Legend />
                <Bar dataKey="Study" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Break" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Subject Breakdown */}
      {pieData.length > 0 && (
        <Card className="p-6 border-border/50 hover-lift transition-smooth animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Study Time by Subject</h3>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}m`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2">
              {subjectStats.map((stat, index) => (
                <div key={stat.subjectId} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-smooth">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{stat.subjectName}</span>
                  </div>
                  <span className="text-sm font-bold">{stat.totalMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
