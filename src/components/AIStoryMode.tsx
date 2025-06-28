
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import { extractContactFromStory } from '@/utils/aiStoryAnalyzer';
import { Brain, Sparkles, Plus, X } from 'lucide-react';

const AIStoryMode = () => {
  const [story, setStory] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addContact, loading } = useContacts();

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
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Story Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tell your story, AI will extract contact info</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="story">Your Story</Label>
          <Textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="আজ CNG ড্রাইভার করিমের সাথে দেখা হলো। তার নাম্বার 01712345678। খুব ভালো মানুষ, পরে কাজে লাগতে পারে..."
            rows={4}
            className="resize-none"
          />
        </div>
        
        <Button 
          onClick={analyzeStory}
          disabled={!story.trim() || isAnalyzing}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Story...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Extract Contact Info
            </>
          )}
        </Button>
        
        {extractedData && (
          <div className="space-y-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Extracted Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="extracted-name">Name</Label>
                <Input
                  id="extracted-name"
                  value={extractedData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extracted-number">Phone Number</Label>
                <Input
                  id="extracted-number"
                  value={extractedData.number}
                  onChange={(e) => updateField('number', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Auto-detected Tags</Label>
              <div className="flex flex-wrap gap-2">
                {extractedData.tags.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button
              onClick={handleSaveContact}
              disabled={loading || !extractedData.name || !extractedData.number}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? 'Saving...' : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Contact
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
