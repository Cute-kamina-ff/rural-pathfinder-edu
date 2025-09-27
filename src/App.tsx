import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import WelcomePage from "./components/WelcomePage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./components/Dashboard";
import QuizPage from "./components/QuizPage";
import GamesSection from "./components/GamesSection";
import ReadingSection from "./components/ReadingSection";
import TeacherDashboard from "./components/TeacherDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppState = 'welcome' | 'login' | 'register' | 'dashboard' | 'quiz' | 'games' | 'reading' | 'teacher-dashboard';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentState, setCurrentState] = useState<AppState>('welcome');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (profile) {
              setUserProfile(profile);
              setCurrentState(profile.user_type === 'teacher' ? 'teacher-dashboard' : 'dashboard');
            }
          }, 0);
        } else {
          setUserProfile(null);
          setCurrentState('welcome');
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    setCurrentState('login');
  };

  const handleShowRegister = () => {
    setCurrentState('register');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentState('quiz');
  };

  const handleShowGames = () => {
    setCurrentState('games');
  };

  const handleShowReading = () => {
    setCurrentState('reading');
  };

  const handleQuizComplete = async (score: number, coins: number, badge: string) => {
    if (userProfile?.id) {
      try {
        // Save quiz result to Supabase
        const { error } = await supabase
          .from('quiz_results')
          .insert([{
            student_id: userProfile.id,
            quiz_id: selectedSubject, // This should be proper quiz ID
            score,
            total_points: 100, // This should be calculated properly
            coins_earned: coins,
            badge,
          }]);

        if (error) throw error;

        // Update user coins
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ coins: (userProfile.coins || 0) + coins })
          .eq('id', userProfile.id);

        if (updateError) throw updateError;

        // Update local profile
        setUserProfile(prev => ({ ...prev, coins: (prev.coins || 0) + coins }));
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleBackToDashboard = () => {
    setCurrentState(userProfile?.user_type === 'teacher' ? 'teacher-dashboard' : 'dashboard');
  };

  const handleBackToWelcome = () => {
    setCurrentState('welcome');
  };

  const renderCurrentState = () => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentState) {
      case 'welcome':
        return <WelcomePage onGetStarted={handleGetStarted} onRegister={handleShowRegister} />;
      case 'login':
        return <LoginPage onBack={handleBackToWelcome} />;
      case 'register':
        return <RegisterPage onBack={handleBackToWelcome} />;
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile}
            onSubjectSelect={handleSubjectSelect}
            onShowGames={handleShowGames}
            onShowReading={handleShowReading}
            onLogout={handleLogout}
          />
        );
      case 'teacher-dashboard':
        return <TeacherDashboard teacherData={userProfile} />;
      case 'quiz':
        return (
          <QuizPage
            userId={userProfile?.id}
            subject={selectedSubject}
            userClass={userProfile?.class || '6'}
            onBack={handleBackToDashboard}
            onComplete={handleQuizComplete}
          />
        );
      case 'games':
        return <GamesSection onBack={handleBackToDashboard} />;
      case 'reading':
        return <ReadingSection onBack={handleBackToDashboard} />;
      default:
        return <WelcomePage onGetStarted={handleGetStarted} onRegister={handleShowRegister} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={renderCurrentState()} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
