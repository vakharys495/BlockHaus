import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { WalletConnect } from './WalletConnect';
import {
  Menu,
  X,
  Home,
  List,
  Plus,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Listings', href: '/listings', icon: List },
    { name: 'My Listings', href: '/my-listings', icon: Plus },
    { name: 'My Bookings', href: '/my-bookings', icon: Calendar },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => window.location.href = '/'}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F7a326735e02a43758cbd7b7bac9a79eb%2Fab7a15cb0f6e4a959ce2fdb52be4b959?format=webp&width=800"
              alt="BLOKHAUS"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-foreground">BLOKHAUS</span>
          </Link>

          {/* Centered Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-12 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-lg"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Connection */}
            <WalletConnect />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>


        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="py-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
