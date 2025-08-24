import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Property } from './PropertyCard';
import { RentNowModal } from './RentNowModal';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Wifi, 
  Car, 
  Shield, 
  Zap,
  Droplets,
  Home,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  moveInDate: string;
  message: string;
}

import { bookingApi } from '@/services/api';

export function PropertyDetailModal({ property, isOpen, onClose }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!property) return null;

  // Mock property images - in real app, these would come from property.images
  const images = property.images || [
    property.image,
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop"
  ];

  // Mock property features and description
  const features = [
    { icon: Wifi, label: 'High-Speed WiFi' },
    { icon: Car, label: 'Parking Space' },
    { icon: Shield, label: '24/7 Security' },
    { icon: Zap, label: 'Backup Generator' },
    { icon: Droplets, label: 'Water Supply' },
    { icon: Home, label: 'Fully Furnished' }
  ];

  const description = `This beautiful ${property.title.toLowerCase()} is located in the heart of ${property.location}. The property features modern amenities and is perfect for families or professionals looking for a comfortable living space in a prime location.

Key Features:
• Spacious rooms with natural lighting
• Modern kitchen with appliances
• Secure parking space
• 24/7 security and power backup
• Close to shopping centers and schools
• Easy access to public transportation

The property is well-maintained and ready for immediate occupancy. All utilities are included in the rent, and the neighborhood is known for its safety and convenience.`;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBookingSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Submit booking via API
      if (property) {
        await bookingApi.bookProperty({
          propertyId: property.id,
          durationMonths: 1 // Default to 1 month for now
        });
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setShowBookingForm(false);
        onClose();
        
        // Reset form
        setBookingForm({
          name: '',
          email: '',
          phone: '',
          moveInDate: '',
          message: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setIsSubmitting(false);
      // In a real app, you would show an error message to the user
    }
  };

  const resetAndClose = () => {
    setCurrentImageIndex(0);
    setShowBookingForm(false);
    setIsSubmitted(false);
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      moveInDate: '',
      message: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold">{property.title}</DialogTitle>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{property.price}</div>
              {property.badge && (
                <Badge variant="secondary" className="mt-1">{property.badge}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={images[currentImageIndex]} 
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Bedrooms</span>
                    </div>
                    <span className="font-medium">{property.beds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Bathrooms</span>
                    </div>
                    <span className="font-medium">{property.baths}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Area</span>
                    </div>
                    <span className="font-medium">{property.area}</span>
                  </div>
                  {property.yearBuilt && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>Built</span>
                      </div>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Amenities & Features</h3>
                <div className="space-y-2">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-primary" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <>
                    <Button
                      onClick={() => setShowRentModal(true)}
                      className="w-full"
                      size="lg"
                    >
                      Rent Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      Schedule Tour
                    </Button>
                    <Button variant="outline" className="w-full">
                      Contact Owner
                    </Button>
                  </>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">About This Property</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>

          {/* Booking Form */}
          {showBookingForm && (
            <Card className="border-primary/20">
              <CardContent className="p-6">
                {!isSubmitted ? (
                  <>
                    <h3 className="font-semibold mb-4">Book This Property</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone number"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
                        <Input
                          id="moveInDate"
                          type="date"
                          value={bookingForm.moveInDate}
                          onChange={(e) => setBookingForm({...bookingForm, moveInDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="message">Additional Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell the property owner about yourself and why you're interested in this property..."
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <Button 
                        onClick={handleBookingSubmit}
                        disabled={isSubmitting || !bookingForm.name || !bookingForm.email || !bookingForm.phone}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowBookingForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Booking Request Sent!</h3>
                    <p className="text-muted-foreground">
                      Your booking request has been sent to the property owner. 
                      They will review and respond within 24 hours.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>

      {/* Rent Now Modal */}
      <RentNowModal
        property={property}
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
      />
    </Dialog>
  );
}
