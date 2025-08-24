import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PropertyCard, Property } from './PropertyCard';
import { 
  Grid, 
  List, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  error?: string;
  className?: string;
  showFilters?: boolean;
  showSorting?: boolean;
  showViewToggle?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onPropertyClick?: (property: Property) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'beds' | 'area';

export function PropertyGrid({
  properties,
  loading = false,
  error,
  className,
  showFilters = true,
  showSorting = true,
  showViewToggle = true,
  onLoadMore,
  hasMore = false,
  onPropertyClick
}: PropertyGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Sort properties based on selected option
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace(/[$,]/g, '')) - parseFloat(b.price.replace(/[$,]/g, ''));
      case 'price-high':
        return parseFloat(b.price.replace(/[$,]/g, '')) - parseFloat(a.price.replace(/[$,]/g, ''));
      case 'beds':
        return b.beds - a.beds;
      case 'area':
        return parseFloat(b.area.replace(/[^\d]/g, '')) - parseFloat(a.area.replace(/[^\d]/g, ''));
      case 'newest':
      default:
        return b.id - a.id; // Assuming higher ID = newer
    }
  });

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground mb-4">
          Something went wrong while loading properties
        </div>
        <div className="text-sm text-destructive">{error}</div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {properties.length} Properties Found
          </h2>
          <p className="text-muted-foreground">
            Showing {Math.min(properties.length, 20)} of {properties.length} results
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {showSorting && (
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="beds">Most Bedrooms</SelectItem>
                <SelectItem value="area">Largest Area</SelectItem>
              </SelectContent>
            </Select>
          )}

          {showFilters && (
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showFilterPanel && "rotate-180"
              )} />
            </Button>
          )}

          {showViewToggle && (
            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-muted/50 rounded-lg p-6 border">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Bedroom</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Bathroom</SelectItem>
                <SelectItem value="2">2+ Bathrooms</SelectItem>
                <SelectItem value="3">3+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-500k">$0 - $500k</SelectItem>
                <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                <SelectItem value="2m+">$2M+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && properties.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading properties...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            No properties found matching your criteria
          </div>
          <Button variant="outline">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Properties Grid/List */}
      {properties.length > 0 && (
        <>
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1 max-w-4xl mx-auto"
          )}>
            {sortedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant={viewMode === 'list' ? 'detailed' : 'default'}
                onPropertyClick={onPropertyClick}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button 
                variant="outline" 
                size="lg"
                onClick={onLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Properties'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
