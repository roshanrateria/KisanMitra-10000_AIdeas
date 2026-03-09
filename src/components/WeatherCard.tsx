import { Card } from '@/components/ui/card';
import { Cloud, Droplets, Wind, Eye } from 'lucide-react';
import { TranslatedText } from './TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { WeatherData } from '@/lib/apis';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

export const WeatherCard = ({ weather, isLoading }: WeatherCardProps) => {
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-32 bg-muted rounded" />
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="p-6">
        <TranslatedText text="Weather data unavailable" targetLanguage={language} />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div>
          <TranslatedText 
            text="Current Weather" 
            targetLanguage={language}
            className="text-sm text-muted-foreground font-medium"
          />
          <div className="text-4xl font-bold mt-2">{Math.round(weather.main.temp)}°C</div>
          <div className="text-sm text-muted-foreground">
            Feels like {Math.round(weather.main.feels_like)}°C
          </div>
          <TranslatedText
            text={weather.weather[0].description}
            targetLanguage={language}
            className="text-sm capitalize mt-1 font-medium"
          />
        </div>
        <img 
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt="weather icon"
          className="w-20 h-20"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-sky-200">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div className="text-sm">
            <div className="font-bold text-lg">{weather.main.humidity}%</div>
            <TranslatedText text="Humidity" targetLanguage={language} className="text-xs text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-gray-500" />
          <div className="text-sm">
            <div className="font-bold text-lg">{weather.wind.speed} m/s</div>
            <TranslatedText text="Wind" targetLanguage={language} className="text-xs text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <div className="text-sm">
            <div className="font-bold text-lg">{weather.main.pressure} hPa</div>
            <TranslatedText text="Pressure" targetLanguage={language} className="text-xs text-muted-foreground" />
          </div>
        </div>
      </div>
      
      {weather.name && (
        <div className="mt-4 pt-4 border-t border-sky-200 text-xs text-muted-foreground flex items-center gap-1">
          <TranslatedText text="Location:" targetLanguage={language} />
          <span className="font-medium">{weather.name}</span>
        </div>
      )}
    </Card>
  );
};
