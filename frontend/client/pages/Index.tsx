import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { Property } from '@/components/PropertyCard';
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Star,
  TrendingUp,
  Shield,
  Users,
  Award,
  ArrowRight,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { listingsApi, listingEvents } from '@/services/api';
import { useEffect } from 'react';

const stats = [
  { label: "Properties Sold", value: "10,000+", icon: TrendingUp },
  { label: "Happy Clients", value: "25,000+", icon: Users },
  { label: "Years Experience", value: "15+", icon: Award },
  { label: "Cities Covered", value: "50+", icon: MapPin }
];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const listings = await listingsApi.getAllListings();
        setFeaturedProperties((listings as any).slice(0, 4));
        setError(null);
      } catch (err) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Prepend new listing to featured list in real time
  useEffect(() => {
    const handler = (e: any) => {
      const created = e.detail;
      setFeaturedProperties((prev) => [created as any, ...prev].slice(0, 4));
    };
    listingEvents.addEventListener('listing:created', handler as EventListener);
    return () => listingEvents.removeEventListener('listing:created', handler as EventListener);
  }, []);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Discover Premium
              <span className="text-primary block">Rental Properties</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Find exceptional rental properties in Kaduna and Abuja. Modern apartments, luxury homes,
              and premium spaces available for rent in Nigeria's finest locations.
            </p>

            {/* Simplified Search Form */}
            <Card className="max-w-3xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search in Kaduna, Abuja, or specific neighborhoods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button size="lg" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search Properties
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked properties just for you</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading properties...</span>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <div className="text-destructive mb-2">Error loading properties</div>
                <div className="text-muted-foreground mb-4">{error}</div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">No properties found</div>
              </div>
            ) : (
              featuredProperties.map((property) => (
                <Card
                  key={property.id}
                  className="group hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                  onClick={() => handlePropertyClick(property)}
                >
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={property.badge === 'New Listing' ? 'default' : 'secondary'}>
                        {property.badge}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
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
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Properties
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Rental?</h2>
          <p className="text-lg mb-8 opacity-90">
            Discover premium properties in Nigeria's most sought-after locations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="px-8">
              Browse All Listings
            </Button>
            <Button variant="outline" size="lg" className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              List Your Property
            </Button>
          </div>
        </div>
      </section>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}
