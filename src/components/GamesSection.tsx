import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Gamepad2, 
  Brain, 
  Puzzle, 
  Type, 
  Calculator, 
  Microscope,
  ArrowLeft,
  Trophy,
  Star
} from "lucide-react";
import { toast } from "sonner";

interface Game {
  id: string;
  name: string;
  description: string;
  game_type: string;
  difficulty_level: string;
  class_level: string;
  game_data: any;
  subject_name?: string;
}

interface GamesSectionProps {
  onBack: () => void;
}

const GamesSection = ({ onBack }: GamesSectionProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          subjects(name)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const gamesWithSubjects = data.map(game => ({
        ...game,
        subject_name: game.subjects?.name || 'General'
      }));

      setGames(gamesWithSubjects);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'memory': return Brain;
      case 'puzzle': return Puzzle;
      case 'word': return Type;
      case 'math': return Calculator;
      case 'science': return Microscope;
      default: return Gamepad2;
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

  const playMemoryGame = (gameData: any) => {
    const cards = gameData.cards || [];
    let score = 0;
    
    // Simple memory game simulation
    cards.forEach((card: any) => {
      const userAnswer = prompt(`What is the definition of "${card.term}"?`);
      if (userAnswer && userAnswer.toLowerCase().includes(card.definition.toLowerCase().split(' ')[0])) {
        score += 10;
      }
    });
    
    setGameScore(score);
    toast.success(`Memory Game Complete! Score: ${score}`);
  };

  const playPuzzleGame = (gameData: any) => {
    const puzzles = gameData.puzzles || [];
    let score = 0;
    
    puzzles.forEach((puzzle: any) => {
      const userAnswer = prompt(puzzle.question);
      if (userAnswer === puzzle.answer) {
        score += 15;
      }
    });
    
    setGameScore(score);
    toast.success(`Puzzle Game Complete! Score: ${score}`);
  };

  const playWordGame = (gameData: any) => {
    const words = gameData.words || [];
    let score = 0;
    
    words.forEach((word: string) => {
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      const userAnswer = prompt(`Unscramble this word: ${scrambled}`);
      if (userAnswer?.toUpperCase() === word) {
        score += 20;
      }
    });
    
    setGameScore(score);
    toast.success(`Word Game Complete! Score: ${score}`);
  };

  const playGame = (game: Game) => {
    setSelectedGame(game);
    
    switch (game.game_type) {
      case 'memory':
        playMemoryGame(game.game_data);
        break;
      case 'puzzle':
        playPuzzleGame(game.game_data);
        break;
      case 'word':
        playWordGame(game.game_data);
        break;
      default:
        toast.info("This game is coming soon!");
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Educational Games</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const IconComponent = getGameIcon(game.game_type);
            return (
              <Card 
                key={game.id} 
                className="p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => playGame(game)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5`}>
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <Badge className={`${getDifficultyColor(game.difficulty_level)} text-white`}>
                    {game.difficulty_level}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{game.description}</p>
                
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {game.subject_name}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    Class {game.class_level}
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Game
                </Button>
              </Card>
            );
          })}
        </div>

        {games.length === 0 && (
          <Card className="p-8 text-center">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Games Available</h3>
            <p className="text-muted-foreground">
              Educational games will be available soon!
            </p>
          </Card>
        )}

        {selectedGame && gameScore > 0 && (
          <Card className="fixed bottom-4 right-4 p-6 max-w-sm bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h4 className="font-semibold">Game Completed!</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedGame.name}
            </p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-bold">Score: {gameScore}</span>
            </div>
            <Button 
              size="sm" 
              className="w-full mt-3"
              onClick={() => {
                setSelectedGame(null);
                setGameScore(0);
              }}
            >
              Close
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamesSection;