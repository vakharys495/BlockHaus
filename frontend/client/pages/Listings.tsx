import { useState, useEffect } from 'react';
import { PropertyGrid } from '@/components/PropertyGrid';
import { Property } from '@/components/PropertyCard';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  MapPin,
  Filter,
  Home,
  Banknote,
  Bed
} from 'lucide-react';
import { listingsApi, listingEvents } from '@/services/api';

export default function Listings() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [bedroomFilter, setBedroomFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedListings = await listingsApi.getAllListings();
        setProperties(fetchedListings as any);
        setFilteredProperties(fetchedListings as any);
      } catch (err) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Listen for new listings and prepend to list for real-time updates
  useEffect(() => {
    const handler = (e: any) => {
      const created = e.detail;
      setProperties((prev) => [created as any, ...prev]);
      setFilteredProperties((prev) => [created as any, ...prev]);
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

  // Filter properties based on search criteria
  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter && priceFilter !== 'all') {
      filtered = filtered.filter(property => {
        const price = parseInt(property.price.replace(/[^\d]/g, ''));
        switch (priceFilter) {
          case '500-700':
            return price >= 500 && price <= 700;
          case '700-900':
            return price >= 700 && price <= 900;
          case '900+':
            return price >= 900;
          default:
            return true;
        }
      });
    }

    // Bedroom filter
    if (bedroomFilter && bedroomFilter !== 'all') {
      const bedrooms = parseInt(bedroomFilter);
      filtered = filtered.filter(property => property.beds >= bedrooms);
    }

    // Duration filter
    if (durationFilter && durationFilter !== 'all') {
      filtered = filtered.filter(property => property.rentalDuration === durationFilter);
    }

    setFilteredProperties(filtered);
  }, [searchQuery, locationFilter, priceFilter, bedroomFilter, durationFilter, properties]);

  const stats = [
    { label: "Total Properties", value: properties.length, icon: Home },
    { label: "Avg. Rent (USDT)", value: "725", icon: Banknote },
    { label: "Available Now", value: properties.filter(p => p.badge === "Available Now").length, icon: Bed }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Property Listings</h1>
          <p className="text-muted-foreground">
            Discover premium rental properties in Nigeria's major cities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <Icon className="w-8 h-8 text-primary mr-4" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Search & Filter Properties</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search properties, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <Select
                value={locationFilter || "all"}
                onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="abuja">Abuja</SelectItem>
                  <SelectItem value="kaduna">Kaduna</SelectItem>
                  <SelectItem value="lagos">Lagos</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select
                value={priceFilter || "all"}
                onValueChange={(value) => setPriceFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="500-700">500-700 USDT</SelectItem>
                  <SelectItem value="700-900">700-900 USDT</SelectItem>
                  <SelectItem value="900+">900+ USDT</SelectItem>
                </SelectContent>
              </Select>

              {/* Bedroom Filter */}
              <Select
                value={bedroomFilter || "all"}
                onValueChange={(value) => setBedroomFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Bedrooms</SelectItem>
                  <SelectItem value="1">1+ Bedroom</SelectItem>
                  <SelectItem value="2">2+ Bedrooms</SelectItem>
                  <SelectItem value="3">3+ Bedrooms</SelectItem>
                  <SelectItem value="4">4+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>

              {/* Duration Filter */}
              <Select
                value={durationFilter || "all"}
                onValueChange={(value) => setDurationFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Duration</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchQuery || (locationFilter && locationFilter !== 'all') || (priceFilter && priceFilter !== 'all') || (bedroomFilter && bedroomFilter !== 'all') || (durationFilter && durationFilter !== 'all')) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Search: {searchQuery}</span>
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {locationFilter && locationFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Location: {locationFilter}</span>
                    <button onClick={() => setLocationFilter('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {priceFilter && priceFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Price: {priceFilter} USDT</span>
                    <button onClick={() => setPriceFilter('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {bedroomFilter && bedroomFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Bedrooms: {bedroomFilter}+</span>
                    <button onClick={() => setBedroomFilter('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {durationFilter && durationFilter !== 'all' && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>Duration: {durationFilter}</span>
                    <button onClick={() => setDurationFilter('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('');
                    setPriceFilter('');
                    setBedroomFilter('');
                    setDurationFilter('');
                  }}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Grid */}
        <PropertyGrid
          properties={filteredProperties}
          loading={loading}
          showFilters={false}
          showSorting={true}
          showViewToggle={true}
          onPropertyClick={handlePropertyClick}
        />

        {/* Property Detail Modal */}
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      </div>
    </div>
  );
}
