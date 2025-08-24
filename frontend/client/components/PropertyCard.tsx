import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Camera,
  Eye,
  Calendar,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  image: string;
  images?: string[];
  badge?: string;
  featured?: boolean;
  type?: 'sale' | 'rent';
  yearBuilt?: number;
  parking?: number;
  rating?: number;
  reviews?: number;
  rentalDuration?: 'monthly' | 'yearly';
  agent?: {
    name: string;
    image: string;
    phone: string;
  };
}

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  onPropertyClick?: (property: Property) => void;
}

export function PropertyCard({
  property,
  variant = 'default',
  className,
  onPropertyClick
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = property.images || [property.image];

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn("group hover:shadow-md transition-shadow cursor-pointer", className)}
        onClick={() => onPropertyClick?.(property)}
      >
        <div className="flex">
          <div className="relative w-32 h-24 flex-shrink-0">
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
            {property.badge && (
              <Badge variant="secondary" className="absolute top-1 left-1 text-xs">
                {property.badge}
              </Badge>
            )}
          </div>
          <CardContent className="flex-1 p-3">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                {property.title}
              </h4>
              <div className="text-sm font-semibold text-primary">{property.price}</div>
            </div>
            <div className="flex items-center text-muted-foreground text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Bed className="w-3 h-3 mr-1" />
                  <span>{property.beds}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="w-3 h-3 mr-1" />
                  <span>{property.baths}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
                className="h-6 w-6 p-0"
              >
                <Heart className={cn("w-3 h-3", isFavorited && "fill-red-500 text-red-500")} />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card
        className={cn("group hover:shadow-lg transition-shadow cursor-pointer", className)}
        onClick={() => onPropertyClick?.(property)}
      >
        <div className="relative">
          <img 
            src={images[currentImageIndex]} 
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ←
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                →
              </button>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Badges and Actions */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {property.badge && (
              <Badge variant={property.badge === 'New Listing' ? 'default' : 'secondary'}>
                {property.badge}
              </Badge>
            )}
            {property.featured && (
              <Badge variant="outline" className="bg-luxury text-luxury-foreground">
                Featured
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className="bg-white/80 hover:bg-white"
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
            </Button>
            {images.length > 1 && (
              <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                {images.length}
              </div>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
            <div className="text-xl font-bold text-primary">{property.price}</div>
          </div>
          
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.beds} beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.baths} baths</span>
              </div>
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.area}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(property.yearBuilt || property.parking) && (
            <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
              {property.yearBuilt && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Built {property.yearBuilt}</span>
                </div>
              )}
              {property.parking && (
                <span>{property.parking} parking</span>
              )}
            </div>
          )}

          {/* Rating */}
          {property.rating && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">{property.rating}</span>
              </div>
              {property.reviews && (
                <span className="text-xs text-muted-foreground">({property.reviews} reviews)</span>
              )}
            </div>
          )}

          {/* Agent Info */}
          {property.agent && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <img 
                  src={property.agent.image} 
                  alt={property.agent.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">{property.agent.name}</div>
                  <div className="text-xs text-muted-foreground">{property.agent.phone}</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPropertyClick?.(property);
              }}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm">
              Schedule Tour
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn("group hover:shadow-lg transition-shadow overflow-hidden cursor-pointer", className)}
      onClick={() => onPropertyClick?.(property)}
    >
      <div className="relative">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            {property.badge && (
              <Badge variant={property.badge === 'New Listing' ? 'default' : 'secondary'}>
                {property.badge}
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              className="bg-white/80 hover:bg-white"
            >
              <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
            </Button>
            {images.length > 1 && (
              <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                <Camera className="w-3 h-3 mr-1" />
                {images.length}
              </div>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="text-xl font-bold text-primary">{property.price}</div>
          </div>
          
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.beds}</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.baths}</span>
              </div>
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                <span>{property.area}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
