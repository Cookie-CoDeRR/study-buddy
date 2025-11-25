import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { db } from "@/integrations/firebase/client";
import { collection, query, where, limit, getDocs, onSnapshot } from "firebase/firestore";
import { Coffee, BookOpen, Clock, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Session {
  id: string;
  start_time: string;
  duration_minutes: number;
  session_type: string;
  subject_id: string | null;
  subject_name?: string;
  subject_color?: string;
}

interface StudyHistoryProps {
  userId: string;
}

const StudyHistory = ({ userId }: StudyHistoryProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ totalStudy: 0, totalBreak: 0, todayStudy: 0 });

  useEffect(() => {
    if (!userId) return;

    // Set up real-time listener
    const q = query(
      collection(db, 'study_sessions'),
      where('user_id', '==', userId),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData: Session[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionsData.push({
          id: doc.id,
          start_time: data.start_time,
          duration_minutes: data.duration_minutes,
          session_type: data.session_type,
          subject_id: data.subject_id,
        });
      });
      
      // Sort by start_time descending in JavaScript
      sessionsData.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      
      // Keep only last 10
      const limitedSessions = sessionsData.slice(0, 10);
      setSessions(limitedSessions);
      calculateStats(limitedSessions);
    });

    return () => unsubscribe();
  }, [userId]);

  const calculateStats = (sessionsData: Session[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    const totalStudy = sessionsData
      .filter((s) => s.session_type === "study")
      .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    
    const totalBreak = sessionsData
      .filter((s) => s.session_type === "break")
      .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    
    const todayStudy = sessionsData
      .filter((s) => s.session_type === "study" && s.start_time.split('T')[0] === today)
      .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    setStats({ totalStudy, totalBreak, todayStudy });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-primary">{stats.todayStudy} min</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-xl">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Study</p>
              <p className="text-2xl font-bold text-accent">{stats.totalStudy} min</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-timer-accent/10 to-timer-accent/5 border-timer-accent/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-timer-accent/20 rounded-xl">
              <Coffee className="h-5 w-5 text-timer-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Breaks</p>
              <p className="text-2xl font-bold text-timer-accent">{stats.totalBreak} min</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border/50">
        <Accordion type="single" collapsible defaultValue="sessions" className="w-full">
          <AccordionItem value="sessions" className="border-0">
            <AccordionTrigger className="hover:no-underline px-0 py-0 mb-4">
              <h3 className="text-lg font-semibold">Recent Sessions</h3>
            </AccordionTrigger>
            <AccordionContent className="px-0 pb-0">
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sessions yet. Start studying!</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {session.session_type === "break" ? (
                          <Coffee className="h-5 w-5 text-timer-accent" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <p className="font-medium">
                            {session.subject_name || (session.session_type === "break" ? "Break" : "Study")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.start_time), "MMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{session.duration_minutes} min</p>
                        {session.subject_color && (
                          <div
                            className="w-3 h-3 rounded-full ml-auto mt-1"
                            style={{ backgroundColor: session.subject_color }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default StudyHistory;
