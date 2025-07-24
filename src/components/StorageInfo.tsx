
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calculateStorageSize } from '@/utils/storageCompression';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HardDrive, Settings } from 'lucide-react';
import StorageDebugger from './StorageDebugger';

const StorageInfo = () => {
  const [storageSize, setStorageSize] = useState(0);
  const [showDebugger, setShowDebugger] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const updateStorageSize = () => {
      const { totalKB } = calculateStorageSize();
      setStorageSize(totalKB);
    };
    
    updateStorageSize();
    const interval = setInterval(updateStorageSize, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const isHeavy = storageSize > 50;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className={`h-4 w-4 ${isHeavy ? 'text-red-500' : 'text-gray-500'}`} />
            <span className={`text-sm ${isHeavy ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              Storage: {storageSize.toFixed(2)} KB {isHeavy && '(Heavy!)'}
            </span>
          </div>
          <div className="flex gap-2">
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
