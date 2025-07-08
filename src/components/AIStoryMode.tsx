import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import { extractContactFromStory } from '@/utils/aiStoryAnalyzer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Brain, Sparkles, Plus, X } from 'lucide-react';

const AIStoryMode = () => {
  const [story, setStory] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addContact, loading } = useContacts();
  const { language, t } = useLanguage();

  const analyzeStory = async () => {
    if (!story.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const extracted = await extractContactFromStory(story);
      setExtractedData(extracted);
    } catch (error) {
      console.error('Error analyzing story:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveContact = async () => {
    if (!extractedData) return;
    
    await addContact({
      name: extractedData.name || 'Unknown',
      number: extractedData.number || '',
      story: extractedData.story,
      tags: extractedData.tags || []
    });
    
    setStory('');
    setExtractedData(null);
  };

  const updateField = (field: string, value: any) => {
    setExtractedData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (!extractedData.tags.includes(tag)) {
      updateField('tags', [...extractedData.tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', extractedData.tags.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg shadow-sm">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ${language === 'bn' ? 'font-bangla' : 'font-poppins'}`}>
              {t('aiStoryMode')}
            </h3>
            <p className={`text-xs text-gray-600 dark:text-gray-400 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
              {t('aiStoryDescription')}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="story" className={language === 'bn' ? 'font-bangla' : 'font-inter'}>
            {t('tellYourStory')}
          </Label>
          <Textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={t('storyPlaceholder')}
            rows={3}
            className={`resize-none ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
          />
        </div>
        
        <Button 
          onClick={analyzeStory}
          disabled={!story.trim() || isAnalyzing}
          className={`w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-3 w-3 mr-2 animate-spin" />
              {t('analyzing')}
            </>
          ) : (
            <>
              <Brain className="h-3 w-3 mr-2" />
              {t('analyzeStory')}
            </>
          )}
        </Button>
        
        {extractedData && (
          <div className="space-y-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <h4 className={`font-semibold text-gray-800 dark:text-gray-200 text-sm ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
              {t('extractedInfo')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="extracted-name" className={`text-xs ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
                  {t('name')}
                </Label>
                <Input
                  id="extracted-name"
                  value={extractedData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={t('contactName')}
                  className={`h-8 text-xs ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="extracted-number" className={`text-xs ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
                  {t('phoneNumber')}
                </Label>
                <Input
                  id="extracted-number"
                  value={extractedData.number}
                  onChange={(e) => updateField('number', e.target.value)}
                  placeholder={t('phoneNumber')}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className={`text-xs ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
                {t('autoTags')}
              </Label>
              <div className="flex flex-wrap gap-1">
                {extractedData.tags.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs px-1.5 py-0"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleSaveContact}
              disabled={loading || !extractedData.name || !extractedData.number}
              className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-8 text-xs ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
            >
              {loading ? t('saving') : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  {t('saveContact')}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStoryMode;