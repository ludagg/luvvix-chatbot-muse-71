
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Fingerprint, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { toast } from "@/hooks/use-toast";
import { useBiometrics } from "@/hooks/use-biometrics";
import { useAuth } from "@/hooks/useAuth"; // Assuming useAuth provides user and session

const BiometricSettings = () => {
  // Assuming useAuth provides:
  // user: { id: string, email: string, app_metadata?: { has_webauthn_credentials?: boolean } } | null
  // session: { access_token: string } | null
  // refreshUser: () => Promise<void>
  const { user, session, refreshUser } = useAuth(); 
  
  // Local loading state for the component, distinct from biometricsLoading in the hook
  const [isComponentLoading, setIsComponentLoading] = useState(false); 
  
  // biometricsEnabled is now primarily driven by the hook's isEnrolled state, which itself is derived from user data
  const { 
    isAvailable, 
    isEnrolled: hookIsEnrolled, // Renamed to avoid conflict with local state if any
    enrollBiometrics, 
    removeBiometrics,
    isLoading: biometricsLoading // Loading state from the hook
  } = useBiometrics({
    onSuccess: async () => {
      // refreshUser should be called by the hook after successful enroll/remove
      // if not, call it here. For now, assume hook handles it.
      // await refreshUser?.(); 
      // Toast messages are now more specific within the hook's methods
    },
    onError: (error) => {
      // Error toasts are handled by the hook
      console.error("BiometricSettings received error:", error.message);
    }
  });

  // This state reflects the actual enrollment status from the hook (which is from useAuth().user)
  const biometricsActuallyEnabled = hookIsEnrolled;

  const handleToggleBiometrics = async () => {
    if (!user || !session?.access_token) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to manage biometric settings."
      });
      return;
    }
    
    setIsComponentLoading(true); // Use component-specific loading state for UI feedback
    
    if (biometricsActuallyEnabled) {
      // Attempt to disable biometrics
      // The hook's removeBiometrics will show a "Coming Soon" toast.
      await removeBiometrics(user.id, session.access_token);
      // No need to setBiometricsEnabled(false) optimistically, as removeBiometrics is a stub
      // and the source of truth (hookIsEnrolled via user data) won't change yet.
    } else {
      // Attempt to enable biometrics
      const success = await enrollBiometrics(user.id, session.access_token);
      if (success) {
        // Enrollment was successful, hook's isEnrolled should update after user refresh
        // Toast is handled by the hook.
      } else {
        // Enrollment failed, toast is handled by the hook.
      }
    }
    
    setIsComponentLoading(false);
  };
  
  const overallLoading = biometricsLoading || isComponentLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="mr-2 h-6 w-6 text-primary" />
          Authentivix Biometric Authentication
        </CardTitle>
        <CardDescription>
          Enable secure login using your device's biometrics (e.g., fingerprint, facial recognition).
          This enhances security by requiring physical verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isAvailable && (
          <div className="p-4 border rounded-md bg-yellow-50 text-yellow-700 flex items-start">
            <AlertTriangle className="mr-3 h-6 w-6 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Biometrics Not Available</h4>
              <p className="text-sm">
                Your current browser or device does not support WebAuthn for biometric authentication,
                or it has not been detected. Please try a modern browser (like Chrome, Firefox, Safari, Edge)
                on a device with biometric capabilities (e.g., Touch ID, Face ID, Windows Hello).
              </p>
            </div>
          </div>
        )}

        {isAvailable && !user && (
           <div className="p-4 border rounded-md bg-blue-50 text-blue-700 flex items-start">
            <AlertTriangle className="mr-3 h-6 w-6 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-1">Please Log In</h4>
              <p className="text-sm">
                You need to be logged in to manage biometric authentication settings.
              </p>
            </div>
          </div>
        )}

        {isAvailable && user && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-md shadow-sm">
              <div className="space-y-1">
                <Label htmlFor="biometrics-switch" className="text-lg font-medium">
                  Enable Biometric Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  {biometricsActuallyEnabled 
                    ? "Biometric authentication is currently active for your account." 
                    : "Secure your account by enabling biometric login."}
                </p>
              </div>
              <Switch
                id="biometrics-switch"
                checked={biometricsActuallyEnabled}
                onCheckedChange={handleToggleBiometrics}
                disabled={overallLoading}
                aria-label="Toggle biometric authentication"
              />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-secondary/50">
                <h4 className="font-semibold mb-2 text-md">How It Works:</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                  <li>Your biometric data (fingerprint, face) never leaves your device.</li>
                  <li>The system uses secure cryptographic keys managed by your device.</li>
                  <li>Compatible with Touch ID, Face ID, Windows Hello, and Android biometrics.</li>
                  <li>Provides a fast and secure way to log in without passwords.</li>
                </ul>
              </div>
              
              {biometricsActuallyEnabled && (
                <Button 
                  variant="outline" 
                  onClick={handleToggleBiometrics} // This will call removeBiometrics
                  disabled={overallLoading} // Disable if any loading is happening
                                    // Also, explicitly disable because remove is a stub
                  title="Remove Biometric Authentication (Feature Coming Soon)"
                  className="w-full flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                >
                  {overallLoading && biometricsActuallyEnabled ? ( // Show loader only if trying to disable
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Fingerprint className="h-4 w-4" />
                  )}
                  Remove Biometric Authentication
                  <span className="text-xs text-red-500 ml-1">(Coming Soon)</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BiometricSettings;
