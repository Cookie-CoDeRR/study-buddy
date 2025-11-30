import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  Lightbulb,
  Users,
  TrendingUp,
  Clock,
  Trophy,
  CheckCircle,
  MessageSquare,
  Zap,
  BarChart3,
  Github,
  Heart,
  X,
} from "lucide-react";

const Website = () => {
  const navigate = useNavigate();
  const [showDonationModal, setShowDonationModal] = useState(false);

  const features = [
    {
      icon: Clock,
      title: "Pomodoro Timer",
      description: "Customizable study sessions with 15, 25, and 50-minute presets to maximize focus and productivity.",
    },
    {
      icon: TrendingUp,
      title: "Study Streaks",
      description: "Track your consistency with daily study streaks and maintain motivation through visual progress indicators.",
    },
    {
      icon: BookOpen,
      title: "Goal Tracking",
      description: "Set daily and weekly study goals per subject and track your progress with detailed analytics.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Visualize your study patterns with comprehensive charts and reports for continuous improvement.",
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join or create study groups with friends, collaborate in real-time, and share learning materials.",
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Compete with friends in study hours, earn achievements, and celebrate milestones together.",
    },
    {
      icon: MessageSquare,
      title: "Group Chat",
      description: "Discord-like group messaging with file sharing, voice notes, and real-time notifications.",
    },
    {
      icon: Zap,
      title: "Smart Insights",
      description: "Get personalized recommendations based on your study patterns and performance metrics.",
    },
  ];

  const testimonials = [
    {
      name: "Alex Student",
      role: "High School Sophomore",
      content: "StudyTracker completely changed how I approach studying. The leaderboard keeps me motivated!",
      image: "🎓",
    },
    {
      name: "Jordan Lee",
      role: "College Junior",
      content: "The study groups feature helped me connect with classmates and ace my exams this semester.",
      image: "📚",
    },
    {
      name: "Casey Morgan",
      role: "Test Prep Student",
      content: "Finally, a study app that actually gamifies learning. My consistency has improved dramatically.",
      image: "🌟",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyTracker
            </h1>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Study with Purpose, Grow with Community
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Elevate your learning experience with intelligent study tracking, collaborative study groups, and friendly competition that keeps you motivated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/20"
            >
              Start Free Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="pt-8 md:pt-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-3xl"></div>
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-8 md:p-16">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-background/50 backdrop-blur rounded-2xl p-6 border border-border/50">
                    <Trophy className="h-8 w-8 text-primary mb-4" />
                    <p className="text-2xl font-bold">1000+</p>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur rounded-2xl p-6 border border-border/50">
                    <TrendingUp className="h-8 w-8 text-accent mb-4" />
                    <p className="text-2xl font-bold">50k+</p>
                    <p className="text-sm text-muted-foreground">Study Hours Tracked</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur rounded-2xl p-6 border border-border/50">
                    <Users className="h-8 w-8 text-primary mb-4" />
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm text-muted-foreground">Study Groups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold">Powerful Features</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in your studies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-border/50 bg-background/50 backdrop-blur hover:bg-background/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
                >
                  <CardHeader>
                    <div className="mb-2 p-3 bg-primary/10 w-fit rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold">How It Works</h3>
            <p className="text-lg text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Sign Up",
                description: "Create your account with a unique username and get your student code instantly.",
              },
              {
                step: 2,
                title: "Start Studying",
                description: "Use the Pomodoro timer, track your goals, and log your study sessions.",
              },
              {
                step: 3,
                title: "Collaborate",
                description: "Join study groups, compete on leaderboards, and chat with classmates.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="absolute -left-4 -top-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <Card className="border-border/50 bg-background/50 backdrop-blur">
                  <CardHeader className="pt-8">
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold">What Students Say</h3>
            <p className="text-lg text-muted-foreground">Join thousands of successful learners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-border/50 bg-gradient-to-br from-background to-primary/5 backdrop-blur"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Creator */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h3 className="text-4xl font-bold">About Study Buddy</h3>
            <p className="text-lg text-muted-foreground">Learn about the mission behind this platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-background/50 backdrop-blur rounded-2xl p-8 border border-border/50">
                <h4 className="text-2xl font-bold mb-4">Created by</h4>
                <p className="text-lg font-semibold mb-2">Ritesh Jagdalee</p>
                <p className="text-muted-foreground mb-4">
                  Student at MIT ADT University, Loni Kalbhor
                </p>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Study Buddy was created with a vision to help students like you maximize their potential through intelligent study tracking and community support. Whether you're preparing for board exams, competitive tests, or college coursework, Study Buddy provides the tools and motivation you need.
                  </p>
                  <p>
                    The platform combines cutting-edge technology with psychology-backed study techniques like the Pomodoro method to help you build sustainable study habits, improve focus, and maintain consistency in your learning journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-accent/10">
                <CardHeader>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    🎯 <strong>Empower students</strong> to concentrate deeply and study effectively through intelligent time management and community engagement.
                  </p>
                  <p className="text-muted-foreground">
                    🤝 <strong>Foster collaboration</strong> by creating a friendly competitive environment where students support each other's growth.
                  </p>
                  <p className="text-muted-foreground">
                    📈 <strong>Track progress</strong> with comprehensive analytics that reveal your learning patterns and help optimize your study strategy.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-gradient-to-br from-accent/10 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Support & Contribute
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Love Study Buddy? You can support development through donations or contribute to the project!</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowDonationModal(true)}
                      className="w-full bg-red-500 hover:bg-red-600 gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Donate via Fampay
                    </Button>
                    <p className="text-xs text-muted-foreground">💻 <strong>GitHub:</strong> Contribute code and features on GitHub</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold">We're Looking for Contributors! 🚀</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us build the next generation of study tools and make a difference in students' lives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-background hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-2 p-3 bg-primary/20 w-fit rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Frontend Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Help us build beautiful and responsive user interfaces using React, TypeScript, and modern web technologies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-accent/10 to-background hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-2 p-3 bg-accent/20 w-fit rounded-lg">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Backend Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Optimize APIs, improve database performance, and implement new features that power Study Buddy's backend.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-gradient-to-br from-yellow-500/10 to-background hover:shadow-lg transition-all">
              <CardHeader>
                <div className="mb-2 p-3 bg-yellow-500/20 w-fit rounded-lg">
                  <Lightbulb className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle>Product & Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contribute UI/UX designs, product ideas, and help shape the future direction of Study Buddy.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-30 rounded-3xl"></div>
              <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-8 md:p-12 space-y-6">
                <h4 className="text-2xl font-bold">Ready to Contribute?</h4>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join our community of developers and help us make learning better for everyone. No experience is too small!
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 px-8 py-6 gap-2"
                    onClick={() => window.open("https://github.com/Cookie-CoDeRR/study-buddy", "_blank")}
                  >
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold text-lg">Study Buddy</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate platform for students to track progress, collaborate, and achieve their academic goals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Study Timer</li>
                <li>Goal Tracking</li>
                <li>Study Groups</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/Cookie-CoDeRR/study-buddy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Cookie-CoDeRR/study-buddy/issues" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                    Report Issues
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Cookie-CoDeRR/study-buddy/discussions" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                    Discussions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Created by Ritesh Jagdalee</li>
                <li>MIT ADT University</li>
                <li>Loni Kalbhor</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground space-y-2">
            <p>&copy; 2024 Study Buddy. All rights reserved.</p>
            <p>Made with ❤️ for students who dare to dream</p>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent className="w-full max-w-md animate-in fade-in zoom-in-50 duration-500">
          <DialogHeader>
            <DialogTitle>Support Study Buddy</DialogTitle>
            <DialogDescription>
              Your donation helps us continue building better tools for students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-lg border-4 border-yellow-300">
                <img
                  src="/fampay-qr.svg"
                  alt="Fampay QR Code"
                  className="w-56 h-auto"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-primary/10 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Fampay ID:</p>
              <div className="flex items-center justify-center gap-2 bg-background rounded p-2">
                <code className="text-sm font-mono font-semibold">9309407084@fam</code>
                <button
                  onClick={() => navigator.clipboard.writeText("9309407084@fam")}
                  className="p-1 hover:bg-primary/10 rounded transition"
                  title="Copy to clipboard"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                ✅ <strong>100% of donations</strong> go directly to improving Study Buddy
              </p>
              <p>
                ✅ Support development of <strong>new features and improvements</strong>
              </p>
              <p>
                ✅ Every rupee helps us serve more students
              </p>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDonationModal(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Website;
