
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Upload, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVideoVerification } from "@/hooks/useVideoVerification";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const { wallet, connectWallet, disconnectWallet, genuineScore } = useVideoVerification();

  return (
    <div className="fixed bottom-0 md:top-0 md:bottom-auto left-0 right-0 bg-instagram-secondary border-t md:border-b border-instagram-border z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-instagram-primary" />
          <span className="font-bold text-lg hidden md:inline">Web3Socail</span>
        </Link>

        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="flex gap-8">
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm", 
                    location.pathname === "/" ? "text-instagram-primary" : "text-instagram-fg/70 hover:text-instagram-fg"
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs md:text-sm">Feed</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/upload">
                <NavigationMenuLink 
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm", 
                    location.pathname === "/upload" ? "text-instagram-primary" : "text-instagram-fg/70 hover:text-instagram-fg"
                  )}
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs md:text-sm">Upload</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/profile">
                <NavigationMenuLink 
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-1 md:gap-2 text-sm", 
                    location.pathname.includes("/profile") ? "text-instagram-primary" : "text-instagram-fg/70 hover:text-instagram-fg"
                  )}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs md:text-sm">Profile</span>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {wallet ? (
            <div className="flex gap-2 items-center">
              <div className="hidden md:block">
                <Button variant="outline" size="sm" className="border-instagram-border text-xs md:text-sm">
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                  {genuineScore !== null && (
                    <span className="ml-2 bg-instagram-primary/20 text-instagram-primary text-xs py-1 px-2 rounded-full">
                      {genuineScore}
                    </span>
                  )}
                </Button>
              </div>
              
              <Button 
                onClick={disconnectWallet} 
                variant="ghost" 
                size="icon"
                className="text-instagram-fg/70 hover:text-instagram-accent"
                title="Disconnect Wallet"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} size="sm" className="hidden md:flex">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
