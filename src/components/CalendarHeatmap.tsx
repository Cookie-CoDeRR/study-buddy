import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface CalendarHeatmapProps {
  userId: string;
}

interface DayData {
  date: string;
  minutes: number;
  sessions: number;
}

export function CalendarHeatmap({ userId }: CalendarHeatmapProps) {
  const [dayData, setDayData] = useState<Map<string, DayData>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthData();
  }, [userId]);

  const loadMonthData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get first and last day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);

      const sessionsRef = collection(db, 'study_sessions');
      const q = query(
        sessionsRef,
        where('user_id', '==', userId),
        where('session_type', '==', 'study')
      );

      const snapshot = await getDocs(q);
      const data = new Map<string, DayData>();

      snapshot.forEach((doc) => {
        const sessionData = doc.data();
        const sessionDate = sessionData.date; // Format: YYYY-MM-DD

        if (data.has(sessionDate)) {
          const existing = data.get(sessionDate)!;
          existing.minutes += sessionData.duration_minutes || 0;
          existing.sessions += 1;
        } else {
          data.set(sessionDate, {
            date: sessionDate,
            minutes: sessionData.duration_minutes || 0,
            sessions: 1,
          });
        }
      });

      setDayData(data);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
    setLoading(false);
  };

  const getHeatmapColor = (minutes: number): string => {
    if (minutes >= 240) return 'bg-red-700 dark:bg-red-800';
    if (minutes >= 180) return 'bg-red-600 dark:bg-red-700';
    if (minutes >= 120) return 'bg-orange-500 dark:bg-orange-600';
    if (minutes >= 60) return 'bg-yellow-400 dark:bg-yellow-500';
    if (minutes > 0) return 'bg-blue-400 dark:bg-blue-500';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);

  const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar grid
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay.getDay(); i++) {
    calendarDays.push(null);
  }

  // Add all days in month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  // Add empty cells for days after month ends
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const totalMinutes = Array.from(dayData.values()).reduce((sum, day) => sum + day.minutes, 0);
  const avgMinutesPerDay = dayData.size > 0 ? Math.round(totalMinutes / dayData.size) : 0;

  return (
    <Card className="p-4 w-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{monthName}</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${dayData.size} days tracked`}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const dateStr = date.toISOString().split('T')[0];
              const data = dayData.get(dateStr);
              const minutes = data?.minutes || 0;
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();

              return (
                <div
                  key={dateStr}
                  className="relative group"
                  title={`${dateStr}: ${minutes}m (${data?.sessions || 0} sessions)`}
                >
                  <div
                    className={`
                      aspect-square rounded-md flex items-center justify-center text-xs font-medium
                      transition-all cursor-pointer hover:scale-110
                      ${getHeatmapColor(minutes)}
                      ${isToday ? 'ring-2 ring-offset-1 ring-blue-500' : ''}
                      ${minutes > 0 ? 'text-white dark:text-white' : 'text-gray-600 dark:text-gray-400'}
                    `}
                  >
                    {date.getDate()}
                  </div>

                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                    {minutes}m ({data?.sessions || 0} sessions)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {dayData.size}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Days Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalMinutes}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgMinutesPerDay}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Per Day</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-blue-400 dark:bg-blue-500" />
            <div className="w-3 h-3 rounded bg-yellow-400 dark:bg-yellow-500" />
            <div className="w-3 h-3 rounded bg-orange-500 dark:bg-orange-600" />
            <div className="w-3 h-3 rounded bg-red-600 dark:bg-red-700" />
            <div className="w-3 h-3 rounded bg-red-700 dark:bg-red-800" />
          </div>
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}
