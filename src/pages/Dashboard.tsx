
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bot, 
  Cloud, 
  Mail, 
  FileText, 
  Languages, 
  Search,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApps: 6,
    activeUsers: 1247,
    totalMessages: 3429,
    uptime: 99.9
  });

  const apps = [
    {
      name: "LuvviX AI Studio",
      description: "Créez et gérez vos agents IA",
      icon: Bot,
      route: "/ai-studio",
      color: "from-purple-600 to-indigo-600",
      status: "Actif",
      users: 324,
      badge: "Populaire"
    },
    {
      name: "LuvviX Cloud",
      description: "Stockage cloud unifié",
      icon: Cloud,
      route: "/cloud",
      color: "from-cyan-600 to-blue-600",
      status: "Actif",
      users: 567,
      badge: "Nouveau"
    },
    {
      name: "LuvviX Mail",
      description: "Messagerie intelligente",
      icon: Mail,
      route: "/mail",
      color: "from-emerald-600 to-teal-600",
      status: "Actif",
      users: 189,
      badge: "Beta"
    },
    {
      name: "LuvviX Forms",
      description: "Formulaires intelligents",
      icon: FileText,
      route: "/forms",
      color: "from-pink-600 to-rose-600",
      status: "Actif",
      users: 78
    },
    {
      name: "LuvviX Translate",
      description: "Traduction multilingue",
      icon: Languages,
      route: "/translate",
      color: "from-orange-600 to-amber-600",
      status: "Actif",
      users: 234
    },
    {
      name: "LuvviX Explore",
      description: "Moteur de recherche IA",
      icon: Search,
      route: "/explore",
      color: "from-violet-600 to-purple-600",
      status: "Actif",
      users: 445
    }
  ];

  const recentActivities = [
    { action: "Création d'un nouvel agent IA", time: "Il y a 2 minutes", app: "AI Studio" },
    { action: "Synchronisation cloud terminée", time: "Il y a 15 minutes", app: "Cloud" },
    { action: "Nouveau formulaire créé", time: "Il y a 1 heure", app: "Forms" },
    { action: "Traduction de document", time: "Il y a 2 heures", app: "Translate" }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, [user]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xl">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Bonjour, {userProfile?.first_name || user?.email?.split('@')[0]} !
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gérez votre écosystème LuvviX depuis votre tableau de bord
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="hidden md:flex">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Applications</p>
                    <p className="text-3xl font-bold">{stats.totalApps}</p>
                  </div>
                  <Bot className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100">Utilisateurs actifs</p>
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Messages</p>
                    <p className="text-3xl font-bold">{stats.totalMessages}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Uptime</p>
                    <p className="text-3xl font-bold">{stats.uptime}%</p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-2"
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                  Vos Applications
                </CardTitle>
                <CardDescription>
                  Accédez rapidement à tous vos outils LuvviX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apps.map((app, index) => (
                    <motion.div
                      key={app.name}
                      variants={fadeIn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
                        onClick={() => navigate(app.route)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${app.color} flex items-center justify-center`}>
                              <app.icon className="w-6 h-6 text-white" />
                            </div>
                            {app.badge && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                {app.badge}
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                            {app.name}
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            {app.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-xs text-gray-500">
                                {app.users} utilisateurs
                              </span>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-500">{app.status}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {activity.app}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/ai-studio/create")}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Créer un agent IA
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/forms")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nouveau formulaire
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/cloud")}
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Synchroniser cloud
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
