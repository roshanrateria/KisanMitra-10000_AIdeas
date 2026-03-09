import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TranslatedText } from './TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus, IndianRupee } from 'lucide-react';
import { MarketPrice } from '@/lib/apis';

interface MarketPricesTableProps {
  prices: MarketPrice[];
}

export const MarketPricesTable = ({ prices }: MarketPricesTableProps) => {
  const { language } = useLanguage();

  const getTrendIcon = (price: number) => {
    const avgPrice = 2650;
    if (price > avgPrice + 200) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (price < avgPrice - 200) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getHighestPrice = () => {
    if (prices.length === 0) return null;
    return prices.reduce((max, p) => p.modalPrice > max.modalPrice ? p : max);
  };

  const getLowestPrice = () => {
    if (prices.length === 0) return null;
    return prices.reduce((min, p) => p.modalPrice < min.modalPrice ? p : min);
  };

  const highest = getHighestPrice();
  const lowest = getLowestPrice();

  if (prices.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-primary" />
          <TranslatedText text="Market Prices" targetLanguage={language} />
        </h3>
        <p className="text-muted-foreground text-center py-8">
          <TranslatedText text="No market data available" targetLanguage={language} />
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover-lift">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-primary" />
          <TranslatedText text="Market Prices" targetLanguage={language} />
        </h3>
        <div className="flex gap-4 text-sm">
          {highest && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">₹{highest.modalPrice}</span>
              <span className="text-xs text-muted-foreground">({highest.market})</span>
            </div>
          )}
          {lowest && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span className="font-semibold">₹{lowest.modalPrice}</span>
              <span className="text-xs text-muted-foreground">({lowest.market})</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">
                <TranslatedText text="Market" targetLanguage={language} />
              </TableHead>
              <TableHead className="font-bold">
                <TranslatedText text="Variety" targetLanguage={language} />
              </TableHead>
              <TableHead className="font-bold">
                <TranslatedText text="Grade" targetLanguage={language} />
              </TableHead>
              <TableHead className="text-right font-bold">
                <TranslatedText text="Min Price" targetLanguage={language} />
              </TableHead>
              <TableHead className="text-right font-bold">
                <TranslatedText text="Max Price" targetLanguage={language} />
              </TableHead>
              <TableHead className="text-right font-bold">
                <TranslatedText text="Modal Price" targetLanguage={language} />
              </TableHead>
              <TableHead className="text-center font-bold">
                <TranslatedText text="Trend" targetLanguage={language} />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((price, idx) => (
              <TableRow 
                key={idx}
                className={`transition-colors hover:bg-muted/30 ${
                  price.slNo === highest?.slNo ? 'bg-green-50 dark:bg-green-950/20' : 
                  price.slNo === lowest?.slNo ? 'bg-red-50 dark:bg-red-950/20' : ''
                }`}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{price.market}</div>
                    <div className="text-xs text-muted-foreground">{price.district}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {price.variety}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{price.grade}</span>
                </TableCell>
                <TableCell className="text-right font-mono">₹{price.minPrice.toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-right font-mono">₹{price.maxPrice.toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-right font-bold text-lg text-primary font-mono">
                  ₹{price.modalPrice.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-center">{getTrendIcon(price.modalPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <TranslatedText 
            text="Prices per quintal (100 kg) • Last updated:" 
            targetLanguage={language} 
          />
          <span className="font-medium">{prices[0]?.priceDate}</span>
        </div>
        <TranslatedText 
          text="Source: Agmarknet.gov.in" 
          targetLanguage={language} 
        />
      </div>
    </Card>
  );
};
