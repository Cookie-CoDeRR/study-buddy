import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, BookOpen, TrendingUp } from "lucide-react";
import { GoalProgressDisplay } from "@/components/GoalProgressDisplay";
import { SubjectAnalytics } from "@/components/SubjectAnalytics";
import { WeeklyReports } from "@/components/WeeklyReports";
import { GoalManager } from "@/components/GoalManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Analytics = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        setLoading(false);
      } else {
        setUser(currentUser);
        await fetchProfile(currentUser.uid);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Enhanced Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border/50">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Analytics
                  </h1>
                  <p className="text-xs text-muted-foreground">Track your study progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="goals" className="w-full space-y-8">
          <div className="bg-gradient-to-r from-card to-card/50 border border-border/50 rounded-xl p-1 sticky top-[70px] z-30 shadow-sm">
            <TabsList className="grid w-full grid-cols-3 bg-transparent">
              <TabsTrigger value="goals" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Subject</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-8 animate-fade-in">
            <div className="space-y-8">
              {user && <GoalProgressDisplay userId={user.uid} />}
              <div className="mt-4">
                {user && <GoalManager userId={user.uid} />}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8 animate-fade-in">
            {user && <SubjectAnalytics userId={user.uid} />}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-8 animate-fade-in">
            {user && <WeeklyReports userId={user.uid} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
