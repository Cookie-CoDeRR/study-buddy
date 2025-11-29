import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getDailyStats, getWeeklyComparison, getSubjectAnalytics, DailyStats, WeeklyComparison, SubjectStat } from '@/lib/analytics';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, BarChart3, Zap } from 'lucide-react';

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
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Weekly Reports</h2>
          <p className="text-sm text-muted-foreground">Detailed study insights & trends</p>
        </div>
      </div>

      {/* Weekly Comparison */}
      {weeklyComparison && (
        <Card className="relative overflow-hidden p-6 border-border/50 hover-lift transition-all duration-300 hover:shadow-lg animate-slide-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-20 -mt-20" />
          
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 relative z-10">
            <TrendingUp className="h-5 w-5 text-primary" />
            Week-over-Week Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 transition-transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">This Week</p>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{weeklyComparison.currentWeekMinutes}m</p>
              <p className="text-xs text-muted-foreground">minutes studied</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-900/30 dark:to-purple-900/10 rounded-xl border border-purple-200/50 dark:border-purple-800/30 transition-transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Last Week</p>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{weeklyComparison.previousWeekMinutes}m</p>
              <p className="text-xs text-muted-foreground">minutes studied</p>
            </div>

            <div className={`p-5 rounded-xl border transition-all transition-transform hover:scale-105 ${
              weeklyComparison.trend === 'up' 
                ? 'bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-900/30 dark:to-green-900/10 border-green-200/50 dark:border-green-800/30' 
                : weeklyComparison.trend === 'down'
                ? 'bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-900/30 dark:to-red-900/10 border-red-200/50 dark:border-red-800/30'
                : 'bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-gray-900/30 dark:to-gray-900/10 border-gray-200/50 dark:border-gray-800/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${
                  weeklyComparison.trend === 'up'
                    ? 'bg-green-500/20'
                    : weeklyComparison.trend === 'down'
                    ? 'bg-red-500/20'
                    : 'bg-gray-500/20'
                }`}>
                  {weeklyComparison.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : weeklyComparison.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground">Change</p>
              </div>
              <p className={`text-3xl font-bold mb-1 ${
                weeklyComparison.trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : weeklyComparison.trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {weeklyComparison.percentageChange > 0 ? '+' : ''}
                {weeklyComparison.percentageChange}%
              </p>
              <p className="text-xs text-muted-foreground">{weeklyComparison.trend === 'up' ? 'Keep it up!' : weeklyComparison.trend === 'down' ? 'Try harder!' : 'Stay consistent'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Study Chart */}
      {barData.length > 0 && (
        <Card className="relative overflow-hidden p-6 border-border/50 hover-lift transition-all duration-300 hover:shadow-lg animate-slide-up">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-full -ml-16 -mt-16" />
          
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 relative z-10">
            <BarChart3 className="h-5 w-5 text-primary" />
            Daily Study Time (Last 7 Days)
          </h3>
          <div className="w-full h-80 relative z-10">
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
        <Card className="relative overflow-hidden p-6 border-border/50 hover-lift transition-all duration-300 hover:shadow-lg animate-slide-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-20 -mt-20" />
          
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 relative z-10">
            <Zap className="h-5 w-5 text-primary" />
            Study Time by Subject
          </h3>
          <div className="flex flex-col lg:flex-row gap-8 relative z-10">
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
                <div key={stat.subjectId} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all transform hover:scale-105">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{stat.subjectName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{stat.totalMinutes}m</span>
                    <p className="text-xs text-muted-foreground">{(stat.totalMinutes / 60).toFixed(1)}h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
