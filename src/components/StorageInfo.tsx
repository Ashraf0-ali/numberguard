
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getStorageSize, cleanupStorage } from '@/utils/storageUtils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { HardDrive, Trash2 } from 'lucide-react';

const StorageInfo = () => {
  const [storageSize, setStorageSize] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const updateStorageSize = () => {
      setStorageSize(getStorageSize());
    };
    
    updateStorageSize();
    const interval = setInterval(updateStorageSize, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    if (user) {
      cleanupStorage(user.uid);
      setStorageSize(getStorageSize());
      toast({
        title: "Storage Cleaned",
        description: "Old data has been removed to free up space",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Storage Used: {storageSize} KB
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCleanup}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Clean
        </Button>
      </div>
    </Card>
  );
};

export default StorageInfo;
