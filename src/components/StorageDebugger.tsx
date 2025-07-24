
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateStorageSize, clearAllAppData } from '@/utils/storageCompression';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HardDrive, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

const StorageDebugger = () => {
  const [storageInfo, setStorageInfo] = useState<{ totalKB: number, breakdown: Record<string, number> }>({ totalKB: 0, breakdown: {} });
  const [isClearing, setIsClearing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const updateStorageInfo = () => {
    setStorageInfo(calculateStorageSize());
  };

  useEffect(() => {
    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Are you sure? This will delete ALL your contacts and app data!')) {
      return;
    }
    
    setIsClearing(true);
    try {
      const clearedCount = clearAllAppData();
      updateStorageInfo();
      
      toast({
        title: "Storage Cleared",
        description: `Removed ${clearedCount} storage items. Please refresh the app.`,
      });
      
      // Force page reload after clearing
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error clearing storage:', error);
      toast({
        title: "Error",
        description: "Failed to clear storage",
        variant: "destructive",
      });
    }
    setIsClearing(false);
  };

  const isStorageHeavy = storageInfo.totalKB > 100; // More than 100KB is heavy for contacts

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStorageHeavy && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Storage usage is unusually high for contact data. Consider clearing and resyncing.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Total Storage:</strong> {storageInfo.totalKB.toFixed(2)} KB
          </div>
          <div>
            <strong>Status:</strong> 
            <span className={isStorageHeavy ? 'text-red-600 ml-1' : 'text-green-600 ml-1'}>
              {isStorageHeavy ? 'Heavy' : 'Normal'}
            </span>
          </div>
        </div>

        {Object.keys(storageInfo.breakdown).length > 0 && (
          <div className="space-y-2">
            <strong>Breakdown:</strong>
            {Object.entries(storageInfo.breakdown).map(([key, size]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="truncate">{key.replace('numberguard_', '')}</span>
                <span>{size.toFixed(2)} KB</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateStorageInfo}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAll}
            disabled={isClearing}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2">
          <p>• Normal contact storage should be under 50KB</p>
          <p>• High usage may indicate cache/sync issues</p>
          <p>• Clear data will remove all contacts and require re-login</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageDebugger;
