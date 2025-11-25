import { useEffect, useState } from "react";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Copy, Check } from "lucide-react";
import { ProfilePictureUploader } from "@/components/ProfilePictureUploader";
import { uploadProfilePicture, deleteProfilePicture } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/auth");
      } else {
        setUser(currentUser);
        await fetchProfile(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const docRef = doc(db, 'profiles', user.uid);
      
      // Use setDoc with merge to create if doesn't exist, or update if it does
      await setDoc(docRef, {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      }, { merge: true });

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });

      await fetchProfile(user.uid);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const url = await uploadProfilePicture(user.uid, file);

    // Save the URL to the profile
    const docRef = doc(db, 'profiles', user.uid);
    await setDoc(docRef, {
      profile_picture_url: url,
    }, { merge: true });

    return url;
  };

  const handleProfilePictureDelete = async () => {
    if (!user || !profile?.profile_picture_url) return;

    await deleteProfilePicture(user.uid, profile.profile_picture_url);

    // Remove the URL from the profile
    const docRef = doc(db, 'profiles', user.uid);
    await setDoc(docRef, {
      profile_picture_url: null,
    }, { merge: true });

    await fetchProfile(user.uid);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <nav className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Update your personal information
            </p>
          </div>

          <ProfilePictureUploader
            userId={user.uid}
            currentImage={profile?.profile_picture_url}
            fullName={fullName || user.email}
            onUpload={handleProfilePictureUpload}
            onDelete={handleProfilePictureDelete}
          />

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle>Student Code</CardTitle>
              <CardDescription>
                Your unique identifier for the StudyTracker system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Your Code</p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {profile?.student_code || "Loading..."}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyStudentCode}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  {codeCopied ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +1)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
