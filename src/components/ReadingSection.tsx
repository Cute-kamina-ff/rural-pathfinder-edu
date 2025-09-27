import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  FileText,
  Lightbulb,
  Microscope,
  BookHeart
} from "lucide-react";
import { toast } from "sonner";

interface ReadingMaterial {
  id: string;
  title: string;
  content: string;
  material_type: string;
  difficulty_level: string;
  class_level: string;
  estimated_time: number;
  subject_name?: string;
}

interface ReadingSectionProps {
  onBack: () => void;
}

const ReadingSection = ({ onBack }: ReadingSectionProps) => {
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<ReadingMaterial | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadingMaterials();
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      // Simulate reading progress
      const interval = setInterval(() => {
        setReadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            toast.success("Reading completed! 🎉");
            return 100;
          }
          return prev + 2;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [selectedMaterial]);

  const fetchReadingMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('reading_materials')
        .select(`
          *,
          subjects(name)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const materialsWithSubjects = data.map(material => ({
        ...material,
        subject_name: material.subjects?.name || 'General'
      }));

      setMaterials(materialsWithSubjects);
    } catch (error) {
      console.error('Error fetching reading materials:', error);
      toast.error("Failed to load reading materials");
    } finally {
      setLoading(false);
    }
  };

  const getMaterialIcon = (materialType: string) => {
    switch (materialType) {
      case 'story': return BookHeart;
      case 'article': return FileText;
      case 'lesson': return BookOpen;
      case 'experiment': return Microscope;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const startReading = (material: ReadingMaterial) => {
    setSelectedMaterial(material);
    setReadingProgress(0);
  };

  const closeReading = () => {
    setSelectedMaterial(null);
    setReadingProgress(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedMaterial) {
    const IconComponent = getMaterialIcon(selectedMaterial.material_type);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={closeReading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedMaterial.estimated_time} min read
              </span>
            </div>
          </div>

          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <IconComponent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {selectedMaterial.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{selectedMaterial.subject_name}</Badge>
                  <Badge className={`${getDifficultyColor(selectedMaterial.difficulty_level)} text-white`}>
                    {selectedMaterial.difficulty_level}
                  </Badge>
                  <Badge variant="outline">Class {selectedMaterial.class_level}</Badge>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reading Progress</span>
                <span className="text-sm text-muted-foreground">{readingProgress}%</span>
              </div>
              <Progress value={readingProgress} className="h-2" />
            </div>

            <div className="prose max-w-none">
              <div className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                {selectedMaterial.content}
              </div>
            </div>

            {readingProgress >= 100 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Great Job!</h4>
                </div>
                <p className="text-green-700 text-sm">
                  You've completed this reading material. Keep exploring to learn more!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Reading Library</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => {
            const IconComponent = getMaterialIcon(material.material_type);
            return (
              <Card 
                key={material.id} 
                className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => startReading(material)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <Badge className={`${getDifficultyColor(material.difficulty_level)} text-white`}>
                    {material.difficulty_level}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{material.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {material.content.substring(0, 150)}...
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {material.subject_name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {material.estimated_time} min
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Reading
                </Button>
              </Card>
            );
          })}
        </div>

        {materials.length === 0 && (
          <Card className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Reading Materials Available</h3>
            <p className="text-muted-foreground">
              Reading materials will be available soon!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReadingSection;