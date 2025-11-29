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
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Analytics & Reports
                </h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="goals" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6 animate-fade-in">
            <div className="space-y-6">
              {user && <GoalProgressDisplay userId={user.uid} />}
              <div className="mt-8">
                <GoalManager userId={user.uid} />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            {user && <SubjectAnalytics userId={user.uid} />}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 animate-fade-in">
            {user && <WeeklyReports userId={user.uid} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
