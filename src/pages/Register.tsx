import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, GraduationCap, Mail, Lock, School, Calendar, IdCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import eduQuestLogo from "@/assets/EduQuest Icon.png";

interface RegisterPageProps {
  onBack: () => void;
}

const RegisterPage = ({ onBack }: RegisterPageProps) => {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    school: "",
    class: "",
    dob: "",
    subjects: "",
    experience: ""
  });
  const [loading, setLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState("");

  const generateUniqueId = (name: string, dob: string) => {
    if (!name || !dob) return "";
    const dobParts = dob.split('-');
    const dayMonth = dobParts[2] + dobParts[1]; // DDMM format
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${name.split(' ')[0]}@${dayMonth}@${randomChars}`;
  };

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    if ((field === 'name' || field === 'dob') && userType === 'student') {
      const newId = generateUniqueId(newData.name, newData.dob);
      setUniqueId(newId);
    }
    setFormData(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create profile
        const profileData = {
          user_id: authData.user.id,
          name: formData.name,
          email: formData.email,
          user_type: userType,
          school: formData.school,
          unique_id: userType === 'student' ? uniqueId : `TEACHER_${Date.now()}`,
          ...(userType === 'student' ? {
            class: formData.class,
            dob: formData.dob
          } : {
            subjects: formData.subjects || 'General',
            experience: formData.experience || '0 years'
          })
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) {
          throw profileError;
        }

        toast.success(`Registration successful! Your ID: ${profileData.unique_id}. Please save this ID for reference.`);
        
        // Auto sign out to prevent immediate login without email confirmation
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-background/95 backdrop-blur">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 p-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-8">
            <img 
              src={eduQuestLogo} 
              alt="EduQuest Logo" 
              className="w-16 h-16 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-primary mb-2">Join EduQuest!</h2>
            <p className="text-muted-foreground">Create your account to start learning</p>
          </div>

          {/* User Type Selection */}
          <Tabs value={userType} onValueChange={(value) => setUserType(value as 'student' | 'teacher')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Teacher
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a secure password"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <Label htmlFor="school" className="flex items-center gap-2 mb-2">
                <School className="w-4 h-4" />
                School Name
              </Label>
              <Input
                id="school"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                placeholder="Enter your school name"
                required
              />
            </div>

            {userType === 'student' && (
              <>
                <div>
                  <Label htmlFor="class" className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Class
                  </Label>
                  <Select onValueChange={(value) => handleInputChange('class', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your class" />
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
                  <Label htmlFor="dob" className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {userType === 'teacher' && (
              <>
                <div>
                  <Label htmlFor="subjects" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Teaching Subjects
                  </Label>
                  <Input
                    id="subjects"
                    value={formData.subjects}
                    onChange={(e) => handleInputChange('subjects', e.target.value)}
                    placeholder="e.g., Mathematics, Science"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Teaching Experience
                  </Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                    required
                  />
                </div>
              </>
            )}

            {uniqueId && userType === 'student' && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <Label className="text-sm font-medium text-primary flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Generated ID: <span className="font-mono">{uniqueId}</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Please save this ID for future reference
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;