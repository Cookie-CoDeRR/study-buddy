import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, Copy, Check, User as UserIcon, BarChart3, Users, Menu, X, Loader2, Flame, Clock } from "lucide-react";
import StudyTimer from "@/components/StudyTimer";
import SubjectManager from "@/components/SubjectManager";
import StudyHistory from "@/components/StudyHistory";
import StreakDisplay from "@/components/StreakDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { calculateStreak } from "@/lib/streak";
import { getUserFriends, Friend, getFriendProfileDetails } from "@/lib/friends";

interface Subject {
  id: string;
  name: string;
  color: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friendDetails, setFriendDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
        setLoading(false);
      } else {
        setUser(currentUser);
        await fetchProfile(currentUser.uid);
        await loadFriends(currentUser.uid);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadFriends = async (userId: string) => {
    try {
      const userFriends = await getUserFriends(userId);
      setFriends(userFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleViewFriendProfile = async (friend: Friend) => {
    setSelectedFriend(friend);
    setLoadingDetails(true);
    try {
      const details = await getFriendProfileDetails(friend.friendUserId);
      setFriendDetails(details);
    } catch (error) {
      console.error('Error loading friend details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friend profile',
        variant: 'destructive',
      });
      setSelectedFriend(null);
    }
    setLoadingDetails(false);
  };

  const generateStudentCode = async (): Promise<string> => {
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

  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      console.log('Fetching profile for userId:', userId, 'exists:', docSnap.exists());
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        console.log('Profile found:', profileData);
        
        // If student_code is missing, generate one
        if (!profileData.student_code) {
          console.log('Student code missing, generating one...');
          const studentCode = await generateStudentCode();
          await setDoc(docRef, { ...profileData, student_code: studentCode }, { merge: true });
          profileData.student_code = studentCode;
        }
        
        setProfile(profileData);
      } else if (retries > 0) {
        console.log('Profile not found, retrying... attempts left:', retries);
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchProfile(userId, retries - 1);
      } else {
        console.warn('Profile not found after retries, creating default profile');
        const studentCode = await generateStudentCode();
        const defaultProfile = {
          user_id: userId,
          full_name: null,
          email: null,
          username: null,
          phone: null,
          student_code: studentCode,
          profile_picture_url: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
          current_streak: 0,
          longest_streak: 0,
          last_study_date: null,
          theme: 'system',
          daily_goal_minutes: 60,
          weekly_goal_minutes: 300,
          preferred_session_duration: 25,
          notifications_enabled: true,
          onboarding_completed: false,
        };
        await setDoc(docRef, defaultProfile);
        console.log('Default profile created:', defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
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

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            StudyTracker
          </h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {profile ? (
              <Card className="px-3 py-2 flex items-center gap-2 border-border/50 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Student Code</p>
                  <p className="font-mono font-semibold text-primary flex items-center gap-1">
                    {profile.student_code ? (
                      profile.student_code
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    )}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyStudentCode}
                  className="h-8 w-8"
                  disabled={!profile.student_code}
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </Card>
            ) : null}
            <Button
              variant="outline"
              onClick={() => navigate("/chat")}
              className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
            >
              <Users className="mr-2 h-4 w-4" />
              Groups
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/analytics")}
              className="border-border/50 hover:bg-primary/10 hover:border-primary/50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
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

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {profile ? (
                <Card className="px-3 py-2 flex items-center justify-between border-border/50 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Student Code</p>
                    <p className="font-mono font-semibold text-primary text-sm flex items-center gap-1">
                      {profile.student_code ? (
                        profile.student_code
                      ) : (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={copyStudentCode}
                    className="h-8 w-8"
                    disabled={!profile.student_code}
                  >
                    {codeCopied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </Card>
              ) : null}
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/chat");
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start border-border/50"
              >
                <Users className="mr-2 h-4 w-4" />
                Groups
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/analytics");
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start border-border/50"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigate("/profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start border-border/50"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start border-border/50 hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {profile && (
              <StreakDisplay 
                currentStreak={profile.current_streak || 0}
                longestStreak={profile.longest_streak || 0}
              />
            )}
            <StudyTimer
              userId={user.uid}
              subjectId={selectedSubject?.id}
              subjectName={selectedSubject?.name}
            />
            <StudyHistory userId={user.uid} />
          </div>

          <div className="space-y-6 md:space-y-8">
            <SubjectManager
              userId={user.uid}
              onSelectSubject={setSelectedSubject}
              selectedSubject={selectedSubject}
            />

            {/* Online Friends Section */}
            <Card className="p-5 border-border/50 bg-gradient-to-br from-card/50 to-card/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -mr-16 -mt-16" />
              
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Friends</h3>
                    <p className="text-xs text-muted-foreground">{friends.length} friend{friends.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Online
                  </Badge>
                </div>

                {friends.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground rounded-lg bg-secondary/50">
                    <p className="text-sm">No friends yet. Add friends using their student code in Groups section!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {friends.slice(0, 5).map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => handleViewFriendProfile(friend)}
                      >
                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                          <AvatarImage src={friend.friendProfilePicture} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                            {friend.friendName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{friend.friendName}</p>
                          <p className="text-xs text-muted-foreground">{friend.friendStudentCode}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    ))}
                    {friends.length > 5 && (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        +{friends.length - 5} more friend{friends.length - 5 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full rounded-lg border-primary/20 hover:bg-primary/5"
                  onClick={() => navigate("/chat")}
                >
                  Manage Friends
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Friend Profile Modal */}
      <Dialog open={!!selectedFriend} onOpenChange={(open) => !open && setSelectedFriend(null)}>
        <DialogContent className="w-full max-w-sm animate-in fade-in zoom-in-50 duration-500">
          <DialogHeader>
            <DialogTitle>Friend Profile</DialogTitle>
            <DialogDescription>
              View your friend's profile and stats
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : selectedFriend && friendDetails ? (
            <div className="space-y-4">
              {/* Profile Picture - Pop in with bounce */}
              <div className="flex justify-center animate-in zoom-in-50 bounce duration-700">
                <Avatar className="h-24 w-24 shadow-xl ring-4 ring-primary/20">
                  <AvatarImage src={friendDetails.profilePicture} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                    {friendDetails.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Student Code - Slide up with pop */}
              <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
                <h2 className="text-xl font-bold">{friendDetails.name}</h2>
                <p className="text-sm text-gray-500">@{friendDetails.studentCode}</p>
              </div>

              {/* Bio */}
              {friendDetails.bio && (
                <Card className="p-3 bg-gray-50 dark:bg-gray-800/50 animate-in fade-in scale-95 duration-500 delay-300">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {friendDetails.bio}
                  </p>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {/* Streak */}
                <Card className="p-3 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 animate-in fade-in zoom-in-50 duration-600 delay-400 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Streak
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {friendDetails.currentStreak}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {friendDetails.currentStreak === 1 ? 'day' : 'days'}
                  </p>
                </Card>

                {/* Today's Study Time */}
                <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 animate-in fade-in zoom-in-50 duration-600 delay-500 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Today
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {friendDetails.totalTodayMinutes}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    minutes
                  </p>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
