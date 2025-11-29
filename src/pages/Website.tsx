import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const Website = () => {
  const navigate = useNavigate();

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
              Study Smarter, Not Harder
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Track your progress, join study groups, compete on leaderboards, and achieve your academic goals with StudyTracker.
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

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-3xl opacity-30 rounded-3xl"></div>
            <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-12 md:p-16 text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Study Habits?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join StudyTracker today and start tracking your progress, competing with friends, and achieving your academic goals.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/20"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">StudyTracker</h4>
              <p className="text-sm text-muted-foreground">
                The ultimate platform for students to track progress and achieve their academic goals.
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
                <li>Blog</li>
                <li>Help Center</li>
                <li>Community</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 StudyTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Website;
