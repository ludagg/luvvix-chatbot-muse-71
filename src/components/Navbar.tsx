
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center font-semibold">
            <span className="text-3xl font-bold bg-gradient-to-r from-luvvix-purple to-luvvix-teal inline-block text-transparent bg-clip-text">
              LuvviX
            </span>
          </Link>

          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={cn(
                    "bg-transparent",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                  )}
                >
                  Produits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/ai-studio" className="block">
                          LuvviX AI
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/medecine" className="block">
                          LuvviX Medic
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/streammix" className="block">
                          LuvviX StreamMix
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/cloud" className="block">
                          LuvviX Cloud
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/auth" className="block">
                          LuvviX ID
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/ecosystem" className="block">
                          Écosystème
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/ecosystem">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-primary/10 hover:text-primary"
                  )}>
                    Écosystème
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/blog">
                  <NavigationMenuLink className={cn(
                    "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                    isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200',
                    "hover:bg-primary/10 hover:text-primary"
                  )}>
                    Blog
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center space-x-2">
            <ModeToggle />
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mr-2">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>Tableau de bord</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/ai-studio/dashboard")}>AI Studio</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>Se déconnecter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {location.pathname !== "/auth" && (
                  <Link to="/auth">
                    <span className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
                      isScrolled ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}>
                      Se connecter
                    </span>
                  </Link>
                )}
              </>
            )}

            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className={cn(
                  "h-6 w-6",
                  isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white dark:text-gray-200'
                )} />
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-64">
                <div className="grid gap-4 py-4">
                  <Link to="/ai-studio">LuvviX AI</Link>
                  <Link to="/medecine">LuvviX Medic</Link>
                  <Link to="/streammix">LuvviX StreamMix</Link>
                  <Link to="/cloud">LuvviX Cloud</Link>
                  <Link to="/auth">LuvviX ID</Link>
                  <Link to="/ecosystem">Écosystème</Link>
                  <Link to="/blog">Blog</Link>
                  <Link to="/auth">Se connecter</Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
