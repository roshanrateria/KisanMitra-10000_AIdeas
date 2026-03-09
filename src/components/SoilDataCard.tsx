import { Card } from '@/components/ui/card';
import { TranslatedText } from './TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { TestTube, Droplets, Layers } from 'lucide-react';

interface SoilDataCardProps {
  soilData: any;
  isLoading: boolean;
}

export const SoilDataCard = ({ soilData, isLoading }: SoilDataCardProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </Card>
    );
  }

  if (!soilData) {
    return (
      <Card className="p-6">
        <TranslatedText text="Soil data unavailable" targetLanguage={language} />
      </Card>
    );
  }

  // Extract relevant soil properties from SoilGrids API response
  const layers = soilData.properties?.layers || [];
  const ph = layers.find((l: any) => l.name === 'phh2o')?.depths?.[0]?.values?.mean;
  const nitrogen = layers.find((l: any) => l.name === 'nitrogen')?.depths?.[0]?.values?.mean;
  const clay = layers.find((l: any) => l.name === 'clay')?.depths?.[0]?.values?.mean;
  const sand = layers.find((l: any) => l.name === 'sand')?.depths?.[0]?.values?.mean;

  const getSoilType = () => {
    if (!clay || !sand) return 'Unknown';
    if (clay > 400) return 'Clay';
    if (sand > 600) return 'Sandy';
    if (clay > 250 && sand > 400) return 'Sandy Loam';
    return 'Loam';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TestTube className="w-5 h-5 text-primary" />
        <TranslatedText text="Soil Analysis" targetLanguage={language} />
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-muted-foreground">
              <TranslatedText text="Soil Type" targetLanguage={language} />
            </span>
          </div>
          <p className="text-xl font-bold">{getSoilType()}</p>
        </div>

        {ph && (
          <div className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">
                <TranslatedText text="pH Level" targetLanguage={language} />
              </span>
            </div>
            <p className="text-xl font-bold">{(ph / 10).toFixed(1)}</p>
          </div>
        )}

        {nitrogen && (
          <div className="bg-background/50 p-4 rounded-lg">
            <span className="text-sm text-muted-foreground">
              <TranslatedText text="Nitrogen" targetLanguage={language} />
            </span>
            <p className="text-lg font-bold">{nitrogen} cg/kg</p>
          </div>
        )}

        {clay && sand && (
          <div className="bg-background/50 p-4 rounded-lg">
            <span className="text-sm text-muted-foreground">
              <TranslatedText text="Composition" targetLanguage={language} />
            </span>
            <p className="text-sm">
              Clay: {(clay / 10).toFixed(0)}% | Sand: {(sand / 10).toFixed(0)}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
