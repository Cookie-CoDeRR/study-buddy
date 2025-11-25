import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Copy, Check, User as UserIcon } from "lucide-react";
import StudyTimer from "@/components/StudyTimer";
import SubjectManager from "@/components/SubjectManager";
import StudyHistory from "@/components/StudyHistory";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  color: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        } else {
          fetchProfile(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const copyStudentCode = () => {
    if (profile?.student_code) {
      navigator.clipboard.writeText(profile.student_code);
      setCodeCopied(true);
      toast({
        title: "Code copied!",
        description: "Your student code has been copied to clipboard.",
      });
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StudyTracker
          </h1>
          <div className="flex items-center gap-3">
            {profile && (
              <Card className="px-4 py-2 flex items-center gap-2 border-border/50">
                <div>
                  <p className="text-sm text-muted-foreground">Student Code</p>
                  <p className="font-mono font-semibold text-primary">{profile.student_code}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyStudentCode}
                  className="h-8 w-8"
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </Card>
            )}
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StudyTimer
              userId={user.id}
              subjectId={selectedSubject?.id}
              subjectName={selectedSubject?.name}
            />
            <StudyHistory userId={user.id} />
          </div>

          <div className="space-y-8">
            <SubjectManager
              userId={user.id}
              onSelectSubject={setSelectedSubject}
              selectedSubject={selectedSubject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
