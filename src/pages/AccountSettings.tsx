
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Shield, Bell, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import BiometricSettings from "@/components/settings/BiometricSettings";

const AccountSettings = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Account Settings | LuvviX ID";
    
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/auth?return_to=/settings');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-lg text-gray-600">Loading your account settings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="text-gray-500 mt-1">Manage your LuvviX ID settings and preferences</p>
            </div>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8 grid grid-cols-4 gap-4 bg-transparent">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <User className="mr-2 h-4 w-4" /> 
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Shield className="mr-2 h-4 w-4" /> 
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Bell className="mr-2 h-4 w-4" /> 
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Globe className="mr-2 h-4 w-4" /> 
                  Preferences
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your profile information and manage how others see you on LuvviX services
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            defaultValue={profile?.full_name || ''} 
                            placeholder="Your full name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            defaultValue={profile?.username || ''} 
                            placeholder="Your username" 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email"
                          defaultValue={user?.email || ''} 
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">
                          Your email address is verified and cannot be changed
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save Changes</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                      <CardDescription>
                        Upload a profile picture to personalize your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profile?.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col gap-3">
                          <Button variant="outline">Upload New Picture</Button>
                          <Button variant="ghost" className="text-red-500">Remove Picture</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-6">
                  {/* Password Change Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to improve your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input id="confirmNewPassword" type="password" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Update Password</Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Biometric Authentication Card */}
                  <BiometricSettings />
                  
                  {/* Two-Factor Authentication Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-factor authentication is not enabled yet.</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Add an extra layer of security by requiring a verification code in addition to your password.
                          </p>
                        </div>
                        <Button variant="outline">Set Up</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Connected Applications Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Connected Applications</CardTitle>
                      <CardDescription>
                        Manage which applications have access to your LuvviX ID
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded">
                          <p className="text-sm text-gray-500">No applications are currently connected to your account.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications from LuvviX services
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-sm text-gray-500">Coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Language & Regional Settings</CardTitle>
                    <CardDescription>
                      Manage your language preferences and regional settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-sm text-gray-500">Coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12">
              <Separator className="my-6" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;
