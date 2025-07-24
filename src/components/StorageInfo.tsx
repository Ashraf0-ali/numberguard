
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getStorageSize, cleanupStorage } from '@/utils/storageUtils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HardDrive, Trash2, Settings } from 'lucide-react';
import StorageDebugger from './StorageDebugger';

const StorageInfo = () => {
  const [storageSize, setStorageSize] = useState(0);
  const [showDebugger, setShowDebugger] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const updateStorageSize = () => {
      setStorageSize(getStorageSize());
    };
    
    updateStorageSize();
    const interval = setInterval(updateStorageSize, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    if (user) {
      cleanupStorage(user.uid);
      setStorageSize(getStorageSize());
      toast({
        title: "Storage Cleaned",
        description: "Old cache data has been removed",
      });
    }
  };

  const isHeavy = storageSize > 50; // More than 50KB is considered heavy

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className={`h-4 w-4 ${isHeavy ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-sm ${isHeavy ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              Storage: {storageSize} KB {isHeavy && '(Heavy!)'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clean
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugger(!showDebugger)}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Debug
            </Button>
          </div>
        </div>
        
        {isHeavy && (
          <div className="mt-2 text-xs text-red-600">
            ⚠️ Storage usage is high. Consider using the debugger to investigate.
          </div>
        )}
      </Card>
      
      {showDebugger && <StorageDebugger />}
    </div>
  );
};

export default StorageInfo;
