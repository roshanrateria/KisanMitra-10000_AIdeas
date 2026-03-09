import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslatedText } from '@/components/TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { WeatherCard } from '@/components/WeatherCard';
import { AITaskList } from '@/components/AITaskList';
import { AIChatbot } from '@/components/AIChatbot';
import { KisanVoiceBot } from '@/components/KisanVoiceBot';
import { FieldMap } from '@/components/FieldMap';
import { FinancialDashboard } from '@/components/FinancialDashboard';
import { MarketPricesTable } from '@/components/MarketPricesTable';
import { SoilDataCard } from '@/components/SoilDataCard';
import { Onboarding } from '@/components/Onboarding';
import { CropHealthMonitor } from '@/components/CropHealthMonitor';
import { CropHealthVideoAnalysis } from '@/components/CropHealthVideoAnalysis';
import { IrrigationScheduler } from '@/components/IrrigationScheduler';
import { HarvestPredictor } from '@/components/HarvestPredictor';
import { WeatherAlerts } from '@/components/WeatherAlerts';
import { SatelliteImagery } from '@/components/SatelliteImagery';
import { getUserData, initializeUserData, saveUserData, UserData, Field, FinancialRecord } from '@/lib/storage';
import { getWeather, getSoilData, getMarketPrices, WeatherData } from '@/lib/apis';
import { getAITaskRecommendations, predictYield } from '@/lib/gemini';
import { Sprout, LogOut, TrendingUp, Scan, History, BarChart3, Image as ImageIcon, X, WifiOff, Loader2, Bot, ShieldCheck } from 'lucide-react';
import { RemediationAgent } from '@/components/agents/RemediationAgent';
import { SalesAgent } from '@/components/agents/SalesAgent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { DigitalLedger } from '@/components/DigitalLedger';
import { ImageUploadComponent } from '@/components/disease-detection/ImageUploadComponent';
import { DetectionResultCard } from '@/components/disease-detection/DetectionResultCard';
import { DetectionImageWithBoundingBoxes } from '@/components/disease-detection/DetectionImageWithBoundingBoxes';
import { DetectionHistoryList } from '@/components/disease-detection/DetectionHistoryList';
import { AnalyticsDashboard } from '@/components/disease-detection/AnalyticsDashboard';
import {
  saveDetection,
  getDetectionHistory,
  deleteDetection,
  clearAllDetections
} from '@/lib/disease-detection/storage';
import { DetectionResult } from '@/lib/disease-detection/types';
import { detectDiseases } from '@/lib/disease-detection/api';
import { getDiseaseTreatment } from '@/lib/gemini';
import { translateText } from '@/lib/bhashini';
import { getCurrentLocation } from '@/lib/geolocation';

type DiseaseTabValue = 'detect' | 'results' | 'history' | 'analytics';

// Integrated Disease Detection Component
export function DiseaseDetectionIntegrated({ onDetection }: { onDetection?: (result: DetectionResult) => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();

  const [activeTab, setActiveTab] = useState<DiseaseTabValue>('detect');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'uploading' | 'analyzing' | 'rendering'>('uploading');
  const [showEstimatedTime, setShowEstimatedTime] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [highlightedPrediction, setHighlightedPrediction] = useState<number | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([]);
  const [treatmentRecommendations, setTreatmentRecommendations] = useState<string | null>(null);
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  // Store latest detection for agent integration
  const latestDetectionRef = useRef<DetectionResult | null>(null);
  const [originalTreatmentRecommendations, setOriginalTreatmentRecommendations] = useState<string | null>(null);

  const detectionCache = useMemo(() => new Map<string, DetectionResult>(), []);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('diseaseDetectionActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const savedTab = sessionStorage.getItem('diseaseDetectionActiveTab') as DiseaseTabValue;
    if (savedTab && ['detect', 'results', 'history', 'analytics'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const retranslateTreatment = async () => {
      if (!originalTreatmentRecommendations) return;
      if (language === 'en') {
        setTreatmentRecommendations(originalTreatmentRecommendations);
        return;
      }
      try {
        const translated = await translateText(originalTreatmentRecommendations, 'en', language);
        setTreatmentRecommendations(translated);
      } catch (error) {
        console.error('Failed to re-translate treatment recommendations:', error);
        setTreatmentRecommendations(originalTreatmentRecommendations);
      }
    };
    retranslateTreatment();
  }, [language, originalTreatmentRecommendations]);

  const loadHistory = () => {
    const history = getDetectionHistory();
    setDetectionHistory(history);
  };

  const handleImageSelect = async (file: File) => {
    setCurrentDetection(null);
    await handleAnalyze(file);
  };

  const handleAnalyze = async (file: File) => {
    if (!isOnline) {
      const titleText = language !== 'en'
        ? await translateText('No Internet Connection', 'en', language).catch(() => 'No Internet Connection')
        : 'No Internet Connection';
      const descText = language !== 'en'
        ? await translateText('Disease detection requires an internet connection. Please check your connection and try again.', 'en', language).catch(() => 'Disease detection requires an internet connection. Please check your connection and try again.')
        : 'Disease detection requires an internet connection. Please check your connection and try again.';
      toast({ title: titleText, description: descText, variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    setProcessingStep('uploading');
    setShowEstimatedTime(false);

    const estimatedTimeTimer = setTimeout(() => setShowEstimatedTime(true), 5000);

    try {
      const location = await getCurrentLocation();
      setProcessingStep('analyzing');
      const result = await detectDiseases(file, location || undefined);
      setProcessingStep('rendering');

      saveDetection(result);

      const reader = new FileReader();
      reader.onload = () => {
        const imageHash = btoa(reader.result as string).substring(0, 50);
        detectionCache.set(imageHash, result);
      };
      reader.readAsDataURL(file);

      setCurrentDetection(result);
      if (onDetection) onDetection(result);
      loadHistory();
      setActiveTab('results');

      const titleText = language !== 'en'
        ? await translateText('Analysis Complete', 'en', language).catch(() => 'Analysis Complete')
        : 'Analysis Complete';
      const descriptionBase = result.count > 0
        ? `Detected ${result.count} disease${result.count > 1 ? 's' : ''} in the image.`
        : 'No diseases detected. Your crops appear healthy!';
      const descText = language !== 'en'
        ? await translateText(descriptionBase, 'en', language).catch(() => descriptionBase)
        : descriptionBase;

      toast({ title: titleText, description: descText });
    } catch (error) {
      console.error('Detection failed:', error);
      const titleText = language !== 'en'
        ? await translateText('Analysis Failed', 'en', language).catch(() => 'Analysis Failed')
        : 'Analysis Failed';
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to analyze image. Please check your connection and try again.';
      const descText = language !== 'en'
        ? await translateText(errorMessage, 'en', language).catch(() => errorMessage)
        : errorMessage;
      toast({ title: titleText, description: descText, variant: 'destructive' });
    } finally {
      clearTimeout(estimatedTimeTimer);
      setIsProcessing(false);
      setShowEstimatedTime(false);
    }
  };

  const handleSelectDetection = (detection: DetectionResult) => {
    setCurrentDetection(detection);
    setHighlightedPrediction(null);
    setTreatmentRecommendations(null);
    setActiveTab('results');
  };

  const handleDeleteDetection = async (id: string) => {
    deleteDetection(id);
    loadHistory();
    if (currentDetection?.id === id) {
      setCurrentDetection(null);
    }
    const titleText = language !== 'en'
      ? await translateText('Detection Deleted', 'en', language).catch(() => 'Detection Deleted')
      : 'Detection Deleted';
    const descText = language !== 'en'
      ? await translateText('The detection has been removed from your history.', 'en', language).catch(() => 'The detection has been removed from your history.')
      : 'The detection has been removed from your history.';
    toast({ title: titleText, description: descText });
  };

  const handleClearAllHistory = async () => {
    clearAllDetections();
    loadHistory();
    setCurrentDetection(null);
    const titleText = language !== 'en'
      ? await translateText('History Cleared', 'en', language).catch(() => 'History Cleared')
      : 'History Cleared';
    const descText = language !== 'en'
      ? await translateText('All detection history has been removed.', 'en', language).catch(() => 'All detection history has been removed.')
      : 'All detection history has been removed.';
    toast({ title: titleText, description: descText });
  };

  const handleRequestTreatment = async () => {
    if (!currentDetection || currentDetection.count === 0) return;

    setIsLoadingTreatment(true);
    try {
      const diseases = currentDetection.predictions.map(pred => pred.class_name);
      const confidences = currentDetection.predictions.map(pred => pred.confidence);
      const cropType = 'General Crop';

      const recommendations = await getDiseaseTreatment(diseases, confidences, cropType, currentDetection.location);
      setOriginalTreatmentRecommendations(recommendations);

      let translatedRecommendations = recommendations;
      if (language !== 'en') {
        try {
          translatedRecommendations = await translateText(recommendations, 'en', language);
        } catch (error) {
          console.error('Translation failed, using English:', error);
          translatedRecommendations = recommendations;
        }
      }

      setTreatmentRecommendations(translatedRecommendations);

      const titleText = language !== 'en'
        ? await translateText('Treatment Recommendations Ready', 'en', language).catch(() => 'Treatment Recommendations Ready')
        : 'Treatment Recommendations Ready';
      const descText = language !== 'en'
        ? await translateText('Organic treatment advice has been generated for the detected diseases.', 'en', language).catch(() => 'Organic treatment advice has been generated for the detected diseases.')
        : 'Organic treatment advice has been generated for the detected diseases.';
      toast({ title: titleText, description: descText });
    } catch (error) {
      console.error('Failed to get treatment recommendations:', error);
      const fallbackTreatments = currentDetection.predictions.map(pred => {
        return `**${pred.class_name}**:\n- Apply neem oil spray (30ml neem oil + 10ml liquid soap in 1 liter water)\n- Spray early morning or evening, covering both sides of leaves\n- Repeat every 7-10 days\n- Remove and destroy severely infected plant parts\n- Improve air circulation around plants`;
      }).join('\n\n');
      const fallbackMessage = `Here are some general organic treatment recommendations:\n\n${fallbackTreatments}\n\n**General Prevention**:\n- Apply organic compost to strengthen plant immunity\n- Use Trichoderma-enriched compost for disease suppression\n- Maintain proper spacing for air circulation\n- Avoid overhead watering to reduce leaf wetness\n- Practice crop rotation\n\nPlease consult with a local agricultural expert for specific guidance.`;

      setOriginalTreatmentRecommendations(fallbackMessage);
      let translatedFallback = fallbackMessage;
      if (language !== 'en') {
        try {
          translatedFallback = await translateText(fallbackMessage, 'en', language);
        } catch {
          console.error('Fallback translation failed, using English');
          translatedFallback = fallbackMessage;
        }
      }
      setTreatmentRecommendations(translatedFallback);

      const titleText = language !== 'en'
        ? await translateText('Using Fallback Recommendations', 'en', language).catch(() => 'Using Fallback Recommendations')
        : 'Using Fallback Recommendations';
      const descText = language !== 'en'
        ? await translateText('Unable to connect to AI service. Showing general organic treatment advice.', 'en', language).catch(() => 'Unable to connect to AI service. Showing general organic treatment advice.')
        : 'Unable to connect to AI service. Showing general organic treatment advice.';
      toast({ title: titleText, description: descText, variant: 'default' });
    } finally {
      setIsLoadingTreatment(false);
    }
  };

  const handleNewDetection = () => {
    setCurrentDetection(null);
    setHighlightedPrediction(null);
    setTreatmentRecommendations(null);
    setShowChatbot(false);
    setActiveTab('detect');
  };

  const handleAskChatbot = () => setShowChatbot(true);
  const handleCloseChatbot = () => setShowChatbot(false);

  return (
    <>
      {!isOnline && (
        <Alert variant="destructive" className="mb-4">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>
            <TranslatedText text="No Internet Connection" targetLanguage={language} />
          </AlertTitle>
          <AlertDescription>
            <TranslatedText
              text="You are currently offline. Disease detection requires an internet connection. You can still view your cached history."
              targetLanguage={language}
            />
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
            <Scan className="h-7 w-7 text-primary" />
            <TranslatedText text="AI Disease Detection" targetLanguage={language} />
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            <TranslatedText
              text="Upload crop images to detect diseases using AI-powered analysis"
              targetLanguage={language}
            />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DiseaseTabValue)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="detect" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  <TranslatedText text="Detect" targetLanguage={language} />
                </span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2" disabled={!currentDetection}>
                <Scan className="h-4 w-4" />
                <span className="hidden sm:inline">
                  <TranslatedText text="Results" targetLanguage={language} />
                </span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">
                  <TranslatedText text="History" targetLanguage={language} />
                </span>
                {detectionHistory.length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {detectionHistory.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  <TranslatedText text="Analytics" targetLanguage={language} />
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detect" className="space-y-6">
              <ImageUploadComponent
                onImageSelect={handleImageSelect}
                isProcessing={isProcessing || !isOnline}
              />

              {isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="relative inline-block">
                      <Loader2 className="h-16 w-16 animate-spin text-primary" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold">
                        {processingStep === 'uploading' && <TranslatedText text="Uploading Image..." targetLanguage={language} />}
                        {processingStep === 'analyzing' && <TranslatedText text="Analyzing Image..." targetLanguage={language} />}
                        {processingStep === 'rendering' && <TranslatedText text="Preparing Results..." targetLanguage={language} />}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {processingStep === 'uploading' && <TranslatedText text="Sending image to AI service" targetLanguage={language} />}
                          {processingStep === 'analyzing' && <TranslatedText text="AI is detecting diseases in your crop" targetLanguage={language} />}
                          {processingStep === 'rendering' && <TranslatedText text="Finalizing detection results" targetLanguage={language} />}
                        </p>
                        {showEstimatedTime && (
                          <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TranslatedText text="This is taking longer than usual. Estimated time: 10-15 seconds" targetLanguage={language} />
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${processingStep === 'uploading' ? 'bg-primary animate-pulse' : 'bg-primary'
                        }`} />
                      <div className={`h-1 w-8 rounded-full transition-colors duration-300 ${processingStep === 'analyzing' || processingStep === 'rendering' ? 'bg-primary' : 'bg-muted'
                        }`} />
                      <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${processingStep === 'analyzing' ? 'bg-primary animate-pulse' : processingStep === 'rendering' ? 'bg-primary' : 'bg-muted'
                        }`} />
                      <div className={`h-1 w-8 rounded-full transition-colors duration-300 ${processingStep === 'rendering' ? 'bg-primary' : 'bg-muted'
                        }`} />
                      <div className={`h-2 w-2 rounded-full transition-colors duration-300 ${processingStep === 'rendering' ? 'bg-primary animate-pulse' : 'bg-muted'
                        }`} />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {currentDetection ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        <TranslatedText text="Analyzed Image" targetLanguage={language} />
                      </h3>
                      <Button variant="outline" size="sm" onClick={handleNewDetection}>
                        <TranslatedText text="New Detection" targetLanguage={language} />
                      </Button>
                    </div>
                    <DetectionImageWithBoundingBoxes
                      imageUrl={currentDetection.imageUrl}
                      predictions={currentDetection.predictions}
                      highlightedIndex={highlightedPrediction}
                      onPredictionHover={setHighlightedPrediction}
                    />
                  </div>
                  <DetectionResultCard
                    result={currentDetection}
                    onRequestTreatment={handleRequestTreatment}
                    onAskChatbot={handleAskChatbot}
                    showLocation={true}
                    treatmentRecommendations={treatmentRecommendations}
                    isLoadingTreatment={isLoadingTreatment}
                    language={language}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Scan className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    <TranslatedText text="No Detection Results" targetLanguage={language} />
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mb-4">
                    <TranslatedText
                      text="Upload an image in the Detect tab to see analysis results here."
                      targetLanguage={language}
                    />
                  </p>
                  <Button onClick={() => setActiveTab('detect')}>
                    <TranslatedText text="Go to Detect" targetLanguage={language} />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <DetectionHistoryList
                detections={detectionHistory}
                onSelectDetection={handleSelectDetection}
                onDeleteDetection={handleDeleteDetection}
                onClearAll={handleClearAllHistory}
                language={language}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard detections={detectionHistory} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showChatbot && currentDetection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">
                  <TranslatedText text="Ask About Detected Diseases" targetLanguage={language} />
                </h3>
                <p className="text-sm text-muted-foreground">
                  <TranslatedText
                    text={`Discussing: ${currentDetection.predictions.map(p => p.class_name).join(', ')}`}
                    targetLanguage={language}
                  />
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseChatbot}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIChatbot
                diseaseContext={{
                  diseases: currentDetection.predictions.map(p => p.class_name),
                  confidences: currentDetection.predictions.map(p => p.confidence),
                  location: currentDetection.location,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const Dashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth0();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [soilData, setSoilData] = useState<any>(null);
  const [aiTasks, setAiTasks] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);
  const [projectedYield, setProjectedYield] = useState<number>(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [latestDetection, setLatestDetection] = useState<DetectionResult | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      let data = getUserData(user.sub!);

      if (!data) {
        data = initializeUserData(user.sub!, user.name || 'Farmer', language);
      }

      // Check if onboarding is needed - ONLY show if user has no fields at all
      if (data.fields.length === 0) {
        setShowOnboarding(true);
        setUserData(data);
        return;
      }

      setUserData(data);

      // Fetch weather and soil data based on field location or user location
      if (data.fields.length > 0) {
        const field = data.fields[0];
        const centerLat = field.coordinates.reduce((sum, coord) => sum + coord[0], 0) / field.coordinates.length;
        const centerLon = field.coordinates.reduce((sum, coord) => sum + coord[1], 0) / field.coordinates.length;

        const weatherData = await getWeather(centerLat, centerLon);
        setWeather(weatherData);

        const soilDataResult = await getSoilData(centerLat, centerLon);
        setSoilData(soilDataResult);

        // Get AI recommendations with enhanced context
        const tasks = await getAITaskRecommendations(data, soilDataResult, weatherData);
        setAiTasks(tasks);

        setIsLoadingData(false);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const weatherData = await getWeather(position.coords.latitude, position.coords.longitude);
          setWeather(weatherData);

          const soilDataResult = await getSoilData(position.coords.latitude, position.coords.longitude);
          setSoilData(soilDataResult);

          const tasks = await getAITaskRecommendations(data, soilDataResult, weatherData);
          setAiTasks(tasks);

          setIsLoadingData(false);
        }, () => {
          setIsLoadingData(false);
        });
      } else {
        setIsLoadingData(false);
      }

      // Get market prices
      const cropName = data.fields.length > 0 ? data.fields[0].crop : 'Wheat';
      const prices = await getMarketPrices(cropName);
      setMarketPrices(prices);

      // Calculate projected yield
      if (data.fields.length > 0) {
        const yield_ = await predictYield(data.fields[0], {});
        setProjectedYield(yield_);
      }
    };

    loadUserData();
  }, [user, language]);

  const handleFieldAdd = async (field: Field) => {
    if (!userData) return;

    const updatedData = { ...userData, fields: [...userData.fields, field] };
    saveUserData(updatedData);
    setUserData(updatedData);

    // Fetch soil data for the new field
    const centerLat = field.coordinates.reduce((sum, coord) => sum + coord[0], 0) / field.coordinates.length;
    const centerLon = field.coordinates.reduce((sum, coord) => sum + coord[1], 0) / field.coordinates.length;

    const soilDataResult = await getSoilData(centerLat, centerLon);
    setSoilData(soilDataResult);

    toast({
      title: 'Field Added',
      description: `${field.name} has been added successfully`
    });
  };

  const handleOnboardingComplete = async (fieldData: Field) => {
    if (!user) return;

    const data = getUserData(user.sub!);
    if (!data) return;

    const updatedData = { ...data, fields: [...data.fields, fieldData] };
    saveUserData(updatedData);
    setUserData(updatedData);

    setShowOnboarding(false);

    // Fetch data for the new field
    const centerLat = fieldData.coordinates.reduce((sum, coord) => sum + coord[0], 0) / fieldData.coordinates.length;
    const centerLon = fieldData.coordinates.reduce((sum, coord) => sum + coord[1], 0) / fieldData.coordinates.length;

    const weatherData = await getWeather(centerLat, centerLon);
    setWeather(weatherData);

    const soilDataResult = await getSoilData(centerLat, centerLon);
    setSoilData(soilDataResult);

    const tasks = await getAITaskRecommendations(updatedData, soilDataResult, weatherData);
    setAiTasks(tasks);

    setIsLoadingData(false);
  };

  const handleFinancialRecordAdd = (record: Omit<FinancialRecord, 'id'>) => {
    if (!userData) return;

    const newRecord = { ...record, id: Date.now().toString() };
    const updatedData = {
      ...userData,
      financialRecords: [...userData.financialRecords, newRecord]
    };
    saveUserData(updatedData);
    setUserData(updatedData);

    toast({
      title: 'Record Added',
      description: 'Financial record has been saved'
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <TranslatedText text="Loading..." targetLanguage={language} />
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <TranslatedText text="Loading..." targetLanguage={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 shadow-elevated backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-primary rounded-xl shadow-glow">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">KisanMitra</h1>
                <p className="text-sm text-muted-foreground">
                  <TranslatedText text="Welcome" targetLanguage={language} />, {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button
                variant="outline"
                className="hover-lift border-border/50"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <TranslatedText text="Logout" targetLanguage={language} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-9 w-full max-w-6xl mx-auto gap-1">
            <TabsTrigger value="overview">
              <TranslatedText text="Overview" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="ledger">
              <ShieldCheck className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                <TranslatedText text="Ledger" targetLanguage={language} />
              </span>
              <span className="sm:hidden">
                <TranslatedText text="Ledger" targetLanguage={language} />
              </span>
            </TabsTrigger>
            <TabsTrigger value="disease">
              <Scan className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                <TranslatedText text="Disease Detection" targetLanguage={language} />
              </span>
              <span className="sm:hidden">
                <TranslatedText text="Disease" targetLanguage={language} />
              </span>
            </TabsTrigger>
            <TabsTrigger value="irrigation">
              <TranslatedText text="Irrigation" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="fields">
              <TranslatedText text="Fields" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="market">
              <TranslatedText text="Market" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="finance">
              <TranslatedText text="Finance" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="ai">
              <TranslatedText text="AI Assistant" targetLanguage={language} />
            </TabsTrigger>
            <TabsTrigger value="sales" className="relative">
              <Bot className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                <TranslatedText text="Sales" targetLanguage={language} />
              </span>
              <span className="sm:hidden">
                <TranslatedText text="Sales" targetLanguage={language} />
              </span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <WeatherCard weather={weather} isLoading={isLoadingData} />

              <SoilDataCard soilData={soilData} isLoading={isLoadingData} />

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <TranslatedText text="Projected Yield" targetLanguage={language} />
                    </p>
                    <p className="text-3xl font-bold">{projectedYield.toFixed(1)} tons</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <TranslatedText text="For current season" targetLanguage={language} />
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
              </Card>
            </div>

            {/* Weather Alerts */}
            {weather && <WeatherAlerts weather={weather} />}

            {/* Harvest Prediction */}
            {userData.fields.length > 0 && (
              <HarvestPredictor
                cropType={userData.fields[0].crop}
                plantingDate={new Date()}
                fieldArea={userData.fields[0].area}
                weather={weather}
                soilData={soilData}
              />
            )}

            <AITaskList tasks={aiTasks} isLoading={isLoadingData} />

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                <TranslatedText text="Quick Stats" targetLanguage={language} />
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">{userData.fields.length}</p>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText text="Fields" targetLanguage={language} />
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {userData.fields.reduce((sum, f) => sum + f.area, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText text="Total Acres" targetLanguage={language} />
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">{aiTasks.length}</p>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText text="Active Tasks" targetLanguage={language} />
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">{userData.financialRecords.length}</p>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText text="Transactions" targetLanguage={language} />
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Crop Health Tab */}
          {/* Digital Ledger Tab */}
          <TabsContent value="ledger">
            <DigitalLedger />
          </TabsContent>

          {/* Disease Detection Tab */}
          <TabsContent value="disease" className="space-y-6">
            <DiseaseDetectionIntegrated onDetection={setLatestDetection} />
          </TabsContent>

          {/* Irrigation Tab */}
          <TabsContent value="irrigation" className="space-y-6">
            {userData.fields.length > 0 ? (
              userData.fields.map((field) => (
                <IrrigationScheduler
                  key={field.id}
                  cropType={field.crop}
                  soilType={field.soilType}
                  weather={weather}
                  fieldArea={field.area}
                />
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  <TranslatedText text="Add a field to view irrigation schedule" targetLanguage={language} />
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            <FieldMap fields={userData.fields} onFieldAdd={handleFieldAdd} />

            {userData.fields.length > 0 && userData.fields.map((field) => (
              <SatelliteImagery
                key={field.id}
                coordinates={field.coordinates}
                fieldName={field.name}
              />
            ))}
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market">
            <MarketPricesTable prices={marketPrices} />
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance">
            <FinancialDashboard
              records={userData.financialRecords}
              onAddRecord={handleFinancialRecordAdd}
              projectedYield={projectedYield}
              marketPrice={marketPrices.length > 0 ? marketPrices.reduce((sum, p) => sum + p.modalPrice, 0) / marketPrices.length : 2700}
              fieldArea={userData.fields.reduce((sum, f) => sum + f.area, 0)}
            />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai">
            <KisanVoiceBot />
          </TabsContent>

          {/* Sales Tab — ONDC Agentic AI */}
          <TabsContent value="sales" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <SalesAgent
                defaultCrop={userData.fields.length > 0 ? userData.fields[0].crop : ''}
                marketPrices={marketPrices}
                location={userData.fields.length > 0 ? {
                  lat: userData.fields[0].coordinates[0][0],
                  lng: userData.fields[0].coordinates[0][1],
                } : undefined}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
