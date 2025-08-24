import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube
} from 'lucide-react';

export function Footer() {
  const footerLinks = {
    'Properties': [
      { name: 'All Listings', href: '/listings' },
      { name: 'Abuja Properties', href: '/listings?city=abuja' },
      { name: 'Kaduna Properties', href: '/listings?city=kaduna' },
      { name: 'Lagos Properties', href: '/listings?city=lagos' },
    ],
    'For Owners': [
      { name: 'List Your Property', href: '/my-listings' },
      { name: 'Manage Bookings', href: '/bookings' },
      { name: 'Pricing Guide', href: '/pricing-guide' },
      { name: 'Owner Resources', href: '/owner-resources' },
    ],
    'Support': [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'USDT Payments', href: '/usdt-guide' },
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
    ],
    'Company': [
      { name: 'About BLOKHAUS', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F7a326735e02a43758cbd7b7bac9a79eb%2Fab7a15cb0f6e4a959ce2fdb52be4b959?format=webp&width=800"
                alt="BLOKHAUS"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-foreground">BLOKHAUS</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Discover premium rental properties in Nigeria's major cities. Modern, secure, and
              affordable housing solutions with transparent USDT pricing.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm">+234 (0) 800 BLOKHAUS</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm">hello@blokhaus.ng</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Nigeria • Abuja • Kaduna • Lagos</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-foreground mb-2">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest property listings and market updates delivered to your inbox.
            </p>
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter your email" 
                className="flex-1"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 BLOKHAUS. All rights reserved. |
            <Link to="/privacy" className="hover:text-foreground ml-1">Privacy Policy</Link> |
            <Link to="/terms" className="hover:text-foreground ml-1">Terms of Service</Link>
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
