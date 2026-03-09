import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranslatedText } from './TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sprout, Droplets, Bug, Scissors, CheckCircle2 } from 'lucide-react';

interface Task {
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
}

interface AITaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

const categoryIcons: Record<string, any> = {
  irrigation: Droplets,
  fertilization: Sprout,
  pest_control: Bug,
  harvesting: Scissors,
  general: CheckCircle2
};

const priorityColors: Record<string, string> = {
  high: 'destructive',
  medium: 'secondary',
  low: 'default'
};

export const AITaskList = ({ tasks, isLoading }: AITaskListProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sprout className="w-5 h-5 text-primary" />
        <TranslatedText text="Today's Recommendations" targetLanguage={language} />
      </h3>

      <div className="space-y-3">
        {tasks.map((task, idx) => {
          const Icon = categoryIcons[task.category] || CheckCircle2;
          
          return (
            <div 
              key={idx}
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary mt-1" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <TranslatedText
                      text={task.title}
                      targetLanguage={language}
                      className="font-medium"
                    />
                    <Badge variant={priorityColors[task.priority] as any}>
                      <TranslatedText text={task.priority} targetLanguage={language} />
                    </Badge>
                  </div>
                  <TranslatedText
                    text={task.description}
                    targetLanguage={language}
                    className="text-sm text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
