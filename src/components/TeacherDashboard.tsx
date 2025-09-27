import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  Plus,
  BarChart3,
  BookOpen,
  Edit,
  Trash2,
  Award,
  TrendingUp
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  school: string;
  coins: number;
  level: number;
  quiz_results?: any[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  class_level: string;
  difficulty_level: string;
  questions_count?: number;
}

interface TeacherDashboardProps {
  teacherData: any;
}

const TeacherDashboard = ({ teacherData }: TeacherDashboardProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuizDialog, setNewQuizDialog] = useState(false);
  const [newQuizData, setNewQuizData] = useState({
    title: "",
    description: "",
    subject_id: "",
    class_level: "",
    difficulty_level: "easy"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          *,
          quiz_results(score, coins_earned, completed_at)
        `)
        .eq('user_type', 'student');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch quizzes created by this teacher
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          *,
          subjects(name),
          questions(id)
        `)
        .eq('created_by', teacherData.id);

      if (quizzesError) throw quizzesError;
      const quizzesWithCounts = quizzesData?.map(quiz => ({
        ...quiz,
        subject_name: quiz.subjects?.name || 'Unknown',
        questions_count: quiz.questions?.length || 0
      })) || [];
      setQuizzes(quizzesWithCounts);

      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async () => {
    if (!newQuizData.title || !newQuizData.subject_id || !newQuizData.class_level) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .insert([{
          ...newQuizData,
          created_by: teacherData.id
        }]);

      if (error) throw error;

      toast.success("Quiz created successfully!");
      setNewQuizDialog(false);
      setNewQuizData({
        title: "",
        description: "",
        subject_id: "",
        class_level: "",
        difficulty_level: "easy"
      });
      fetchData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error("Failed to create quiz");
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast.success("Quiz deleted successfully!");
      fetchData();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalStudents = students.length;
  const totalQuizzes = quizzes.length;
  const avgScore = students.reduce((acc, student) => {
    const scores = student.quiz_results?.map(r => r.score) || [];
    const avgStudentScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return acc + avgStudentScore;
  }, 0) / (totalStudents || 1);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {teacherData.name}!</p>
        </div>
        <Dialog open={newQuizDialog} onOpenChange={setNewQuizDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  value={newQuizData.title}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quiz title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newQuizData.description}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter quiz description"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select onValueChange={(value) => setNewQuizData(prev => ({ ...prev, subject_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="class">Class Level</Label>
                <Select onValueChange={(value) => setNewQuizData(prev => ({ ...prev, class_level: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={newQuizData.difficulty_level}
                  onValueChange={(value) => setNewQuizData(prev => ({ ...prev, difficulty_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createQuiz} className="w-full">
                Create Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Created Quizzes</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{Math.round(avgScore)}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{students.filter(s => (s.coins || 0) > 100).length}</p>
              <p className="text-sm text-muted-foreground">Active Learners</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Student Performance</h3>
            <div className="space-y-4">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Class {student.class} • {student.school}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{student.coins || 0} coins</p>
                      <p className="text-sm text-muted-foreground">Level {student.level || 1}</p>
                    </div>
                    <Badge variant="secondary">
                      {student.quiz_results?.length || 0} quizzes
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">My Quizzes</h3>
            <div className="space-y-4">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{quiz.title}</h4>
                    <p className="text-sm text-muted-foreground">{quiz.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{quiz.subject_name}</Badge>
                      <Badge variant="outline">Class {quiz.class_level}</Badge>
                      <Badge>{quiz.difficulty_level}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {quiz.questions_count} questions
                    </span>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteQuiz(quiz.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Class Analytics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Top Performers</h4>
                <div className="space-y-2">
                  {students
                    .sort((a, b) => (b.coins || 0) - (a.coins || 0))
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{student.name}</span>
                        </div>
                        <span className="text-sm font-medium">{student.coins || 0} coins</span>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Subject Performance</h4>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {quizzes.filter(q => q.subject_name === subject.name).length} quizzes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;