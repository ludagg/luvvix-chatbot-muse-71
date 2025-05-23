
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Fingerprint } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useBiometrics } from "@/hooks/use-biometrics";
import { useAuth } from "@/hooks/useAuth";

const BiometricSettings = () => {
  const { user, hasBiometrics } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  const { 
    isAvailable, 
    enrollBiometrics, 
    removeBiometrics,
    isLoading: biometricsLoading 
  } = useBiometrics({
    onSuccess: () => {
      setIsLoading(false);
      setBiometricsEnabled(true);
      toast({
        title: "Success",
        description: biometricsEnabled 
          ? "Biometric authentication disabled" 
          : "Biometric authentication enabled"
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  });
  
  // Check if biometrics are enabled for this user
  useEffect(() => {
    setBiometricsEnabled(hasBiometrics);
  }, [hasBiometrics]);
  
  const handleToggleBiometrics = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to manage biometrics"
      });
      return;
    }
    
    setIsLoading(true);
    
    if (biometricsEnabled) {
      // Disable biometrics
      await removeBiometrics(user.id);
      setBiometricsEnabled(false);
    } else {
      // Enable biometrics
      const success = await enrollBiometrics(user.id);
      setBiometricsEnabled(success);
    }
    
    setIsLoading(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="mr-2 h-6 w-6" />
          Authentivix Biometric Authentication
        </CardTitle>
        <CardDescription>
          Enable secure login using your fingerprint or facial recognition
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAvailable ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="biometrics">Enable biometric authentication</Label>
                <p className="text-sm text-gray-500">
                  {biometricsEnabled 
                    ? "Your account is protected with biometric authentication" 
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              <Switch
                id="biometrics"
                checked={biometricsEnabled}
                onCheckedChange={handleToggleBiometrics}
                disabled={isLoading || biometricsLoading}
              />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded bg-gray-50">
                <h4 className="font-medium mb-2">How it works</h4>
                <ul className="space-y-1 text-sm list-disc pl-5">
                  <li>Biometric data never leaves your device</li>
                  <li>Use your fingerprint or face to securely log in</li>
                  <li>Available on supported browsers and devices</li>
                  <li>Works with Touch ID, Face ID and Windows Hello</li>
                </ul>
              </div>
              
              {biometricsEnabled && (
                <Button 
                  variant="outline" 
                  onClick={handleToggleBiometrics}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                  Remove biometric authentication
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded bg-yellow-50 text-yellow-800">
            <h4 className="font-medium mb-2">Not available on this device</h4>
            <p className="text-sm">
              Your browser or device doesn't support biometric authentication. 
              Please try using a modern browser on a device with biometric capabilities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BiometricSettings;
