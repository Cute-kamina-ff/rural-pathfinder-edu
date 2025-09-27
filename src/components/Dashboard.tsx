import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/ui/footer";
import { toast } from "sonner";
import { getUserStats, updateUserStats } from "@/lib/userStats";
import { 
  BookOpen, 
  Cpu, 
  Cog, 
  Calculator, 
  Star, 
  Coins,
  Trophy,
  User,
  LogOut,
  Target
} from "lucide-react";

interface DashboardProps {
  userProfile: any;
  onSubjectSelect: (subject: string) => void;
  onShowGames: () => void;
  onShowReading: () => void;
  onLogout: () => void;
}

const Dashboard = ({ userProfile, onSubjectSelect, onShowGames, onShowReading, onLogout }: DashboardProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  // Language translations
  const translations = {
    english: {
      welcome: "Welcome back",
      readyForAdventure: "Ready for your next learning adventure?",
      monitorProgress: "Monitor your students' progress",
      chooseSubject: "Choose Your Subject",
      subjectOverview: "Subject Overview",
      coins: "Coins",
      badges: "Badges",
      level: "Level",
      dayStreak: "Day Streak",
      learningProgress: "Your Learning Progress",
      overallProgress: "Overall Progress",
      keepGoing: "Keep going! You're doing great!",
      toNextLevel: "to next level",
      quickActions: "Quick Actions",
      manageStudents: "Manage Students",
      viewTopPerformers: "View Top Performers",
      resolveDoubts: "Resolve Doubts",
      mcqs: "MCQs",
      manage: "Manage",
      interactive: "Interactive",
      logout: "Logout"
    },
    hindi: {
      welcome: "वापसी पर स्वागत है",
      readyForAdventure: "अपने अगले सीखने के रोमांच के लिए तैयार हैं?",
      monitorProgress: "अपने छात्रों की प्रगति देखें",
      chooseSubject: "अपना विषय चुनें",
      subjectOverview: "विषय अवलोकन",
      coins: "सिक्के",
      badges: "बैज",
      level: "स्तर",
      dayStreak: "दिन की लकीर",
      learningProgress: "आपकी सीखने की प्रगति",
      overallProgress: "कुल प्रगति",
      keepGoing: "चलते रहो! आप बहुत अच्छा कर रहे हैं!",
      toNextLevel: "अगले स्तर तक",
      quickActions: "त्वरित कार्य",
      manageStudents: "छात्रों का प्रबंधन",
      viewTopPerformers: "शीर्ष प्रदर्शनकर्ता देखें",
      resolveDoubts: "संदेह दूर करें",
      mcqs: "MCQs",
      manage: "प्रबंधन",
      interactive: "इंटरेक्टिव",
      logout: "लॉगआउट"
    },
    odia: {
      welcome: "ଫେରାଇ ସ୍ୱାଗତ",
      readyForAdventure: "ଆପଣଙ୍କର ପରବର୍ତ୍ତୀ ଶିକ୍ଷା ଦୁଃସାହସିକ କାର୍ଯ୍ୟ ପାଇଁ ପ୍ରସ୍ତୁତ?",
      monitorProgress: "ଆପଣଙ୍କ ଛାତ୍ରମାନଙ୍କର ଅଗ୍ରଗତି ମନିଟର କରନ୍ତୁ",
      chooseSubject: "ଆପଣଙ୍କର ବିଷୟ ବାଛନ୍ତୁ",
      subjectOverview: "ବିଷୟ ସମୀକ୍ଷା",
      coins: "ମୁଦ୍ରା",
      badges: "ବ୍ୟାଜ୍",
      level: "ସ୍ତର",
      dayStreak: "ଦିନର ଧାରା",
      learningProgress: "ଆପଣଙ୍କର ଶିକ୍ଷା ଅଗ୍ରଗତି",
      overallProgress: "ସାମଗ୍ରିକ ଅଗ୍ରଗତି",
      keepGoing: "ଚାଲିଥାଅ! ଆପଣ ବହୁତ ଭଲ କରୁଛନ୍ତି!",
      toNextLevel: "ପରବର୍ତ୍ତୀ ସ୍ତର ପର୍ଯ୍ୟନ୍ତ",
      quickActions: "ଦ୍ରୁତ କାର୍ଯ୍ୟ",
      manageStudents: "ଛାତ୍ର ପରିଚାଳନା",
      viewTopPerformers: "ଶୀର୍ଷ ପ୍ରଦର୍ଶନକାରୀ ଦେଖନ୍ତୁ",
      resolveDoubts: "ସନ୍ଦେହ ସମାଧାନ",
      mcqs: "MCQs",
      manage: "ପରିଚାଳନା",
      interactive: "ଇଣ୍ଟରାକ୍ଟିଭ୍",
      logout: "ଲଗଆଉଟ୍"
    }
  };

  const t = translations[selectedLanguage as keyof typeof translations];

  // Teacher quick actions handlers
  const handleManageStudents = () => {
    toast.success(`${t.manageStudents} - Feature coming soon!`);
  };

  const handleViewTopPerformers = () => {
    toast.success(`${t.viewTopPerformers} - Feature coming soon!`);
  };

  const handleResolveDoubts = () => {
    toast.success(`${t.resolveDoubts} - Feature coming soon!`);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    toast.success(`Language switched to ${language === 'english' ? 'English' : language === 'hindi' ? 'हिंदी' : 'ଓଡ଼ିଆ'}`);
  };

  const subjects = [
    {
      id: 'Basic Science',
      name: 'Basic Science',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'Physics, Chemistry, Biology'
    },
    {
      id: 'Technology',
      name: 'Technology',
      icon: Cpu,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'Computer Science, Digital Skills'
    },
    {
      id: 'Engineering',
      name: 'Engineering',
      icon: Cog,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      description: 'Problem Solving, Design Thinking'
    },
    {
      id: 'Mathematics',
      name: 'Mathematics',
      icon: Calculator,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      description: 'Algebra, Geometry, Statistics'
    }
  ];


  // Initialize and update user stats
  const [studentStats, setStudentStats] = useState({
    coins: 0,
    badges: 0,
    level: 0,
    streak: 0,
    progress: 0
  });

  useEffect(() => {
    // Update stats on component mount and when user data changes
    const stats = getUserStats();
    const updatedStats = updateUserStats({}); // This will handle daily streak
    
    const fetchStats = async () => {
      if (!userProfile?.id) return;
      
      // Use Supabase to fetch user stats
      const coins = userProfile.coins || 0;
      const badges = userProfile.badges || 0;
      const level = userProfile.level || 1;
      const streak = userProfile.streak || 0;
      const progress = Math.min(100, coins / 10);
      
      setStudentStats({ coins, badges, level, streak, progress });
    };
    
    fetchStats();
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t.welcome}, {userProfile?.name}! 
            </h1>
            <p className="text-muted-foreground">
              {userProfile?.user_type === 'student' ? t.readyForAdventure : t.monitorProgress}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="english">🇬🇧 English</option>
              <option value="hindi">🇮🇳 हिंदी</option>
              <option value="odia">🏳 ଓଡ଼ିଆ</option>
            </select>
            
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>

        {userProfile?.user_type === 'student' && (
          <>
            {/* Student Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="bg-gradient-to-br from-yellow-400/10 to-yellow-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{studentStats.coins}</div>
                <div className="text-sm text-muted-foreground">{t.coins}</div>
              </Card>

              <Card className="p-4 text-center">
                <div className="bg-gradient-to-br from-purple-400/10 to-purple-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{studentStats.badges}</div>
                <div className="text-sm text-muted-foreground">{t.badges}</div>
              </Card>

              <Card className="p-4 text-center">
                <div className="bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{studentStats.level}</div>
                <div className="text-sm text-muted-foreground">{t.level}</div>
              </Card>

              <Card className="p-4 text-center">
                <div className="bg-gradient-to-br from-green-400/10 to-green-500/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">{studentStats.streak}</div>
                <div className="text-sm text-muted-foreground">{t.dayStreak}</div>
              </Card>
            </div>

            {/* Progress Card */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">{t.learningProgress}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{t.overallProgress}</span>
                  <span>{studentStats.progress}%</span>
                </div>
                <Progress value={studentStats.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t.keepGoing}</span>
                  <span>{100 - studentStats.progress}% {t.toNextLevel}</span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {userProfile?.user_type === 'student' ? t.chooseSubject : t.subjectOverview}
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject) => {
              const IconComponent = subject.icon;
              return (
                <Card 
                  key={subject.id}
                  className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group"
                  onClick={() => onSubjectSelect(subject.id)}
                >
                  <div className={`${subject.color} rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-center mb-2">{subject.name}</h3>
                  <p className="text-muted-foreground text-center text-sm mb-4">
                    {subject.description}
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {userProfile?.user_type === 'student' ? `10 ${t.mcqs}` : t.manage}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {t.interactive}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Games and Reading Buttons for Students */}
        {userProfile?.user_type === 'student' && (
          <div className="mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card 
                className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer bg-gradient-to-br from-green-500/10 to-green-600/10"
                onClick={onShowGames}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 rounded-2xl w-16 h-16 flex items-center justify-center">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Educational Games</h3>
                    <p className="text-muted-foreground text-sm">
                      Play fun games while learning
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card 
                className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer bg-gradient-to-br from-blue-500/10 to-blue-600/10"
                onClick={onShowReading}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 rounded-2xl w-16 h-16 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Reading Library</h3>
                    <p className="text-muted-foreground text-sm">
                      Explore stories and articles
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Activity or Teacher Actions */}
        {userProfile?.user_type === 'teacher' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.quickActions}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5"
                onClick={handleManageStudents}
              >
                <User className="w-6 h-6" />
                <span>{t.manageStudents}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5"
                onClick={handleViewTopPerformers}
              >
                <Trophy className="w-6 h-6" />
                <span>{t.viewTopPerformers}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5"
                onClick={handleResolveDoubts}
              >
                <BookOpen className="w-6 h-6" />
                <span>{t.resolveDoubts}</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;