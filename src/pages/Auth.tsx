import { useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Lightbulb } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateStudentCode = async (): Promise<string> => {
    // Generate a unique student code
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
      code = 'STU' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('student_code', '==', code));
      const querySnapshot = await getDocs(q);
      isUnique = querySnapshot.empty;
    }
    
    return code;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Generate unique student code
        const studentCode = await generateStudentCode();

        // Create comprehensive profile document in Firestore with defaults
        await setDoc(doc(db, 'profiles', user.uid), {
          user_id: user.uid,
          full_name: fullName || null,
          email: email,
          username: null, // Username can be set later in profile
          phone: null,
          student_code: studentCode,
          profile_picture_url: null,
          
          // Study streak tracking
          current_streak: 0,
          longest_streak: 0,
          last_study_date: null,
          
          // Goals and settings
          daily_goal_minutes: 60,
          weekly_goal_minutes: 300,
          preferred_session_duration: 25, // Pomodoro default
          
          // Preferences
          theme: 'system', // 'light', 'dark', 'system'
          notifications_enabled: true,
          
          // Metadata
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          onboarding_completed: false,
        });

        console.log('Profile auto-generated for user:', user.uid, 'with student code:', studentCode);

        toast({
          title: "Account created!",
          description: `Welcome, ${fullName || 'User'}! Your student code: ${studentCode}`,
        });
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        await signInWithEmailAndPassword(auth, email, password);

        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="p-3 bg-accent/10 rounded-xl">
              <Lightbulb className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyTracker
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isSignUp ? "Create your account and get your unique student code" : "Sign in to track your progress"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="border-border/50"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-border/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
