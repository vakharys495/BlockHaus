import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Property } from './PropertyCard';
import { 
  Check,
  Calendar,
  MapPin,
  Home,
  Shield,
  Clock
} from 'lucide-react';

interface RentNowModalProps {
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

export function RentNowModal({ property, isOpen, onClose }: RentNowModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false);
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

  const handleBookingSubmit = async () => {
    try {
      setIsSubmitting(true);
      const renterWalletAddress = localStorage.getItem('walletAddress') || '';
      const created = await bookingApi.bookProperty({
        propertyId: property.id,
        renterName: bookingForm.name,
        renterEmail: bookingForm.email,
        renterPhone: bookingForm.phone,
        renterWalletAddress,
        moveInDate: bookingForm.moveInDate,
        message: bookingForm.message,
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Close after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setShowBookingForm(false);
        onClose();
        setBookingForm({ name: '', email: '', phone: '', moveInDate: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting booking:', error);
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
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

  // Calculate fees (mock data)
  const monthlyRent = parseInt(property.price.replace(/[^\d]/g, ''));
  const total = monthlyRent;

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Rent This Property</DialogTitle>
        </DialogHeader>

        {!showBookingForm && !isSubmitted ? (
          <div className="space-y-6">
            {/* Property Summary */}
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    {property.badge && (
                      <Badge variant="secondary" className="text-xs">{property.badge}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Breakdown */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Monthly Rent</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{monthlyRent} USDT</div>
                  <p className="text-muted-foreground">per month</p>
                </div>
              </CardContent>
            </Card>

            {/* What's Included */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">24/7 Security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Water Supply</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Parking Space</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Maintenance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Backup Generator</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">WiFi Ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rental Terms */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Rental Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm">Minimum lease: 12 months</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-sm">Damage protection included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Move-in within 7 days</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-primary" />
                    <span className="text-sm">Fully furnished</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowBookingForm(true)}
                className="flex-1" 
                size="lg"
              >
                Book Now - {total} USDT
              </Button>
              <Button variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : showBookingForm && !isSubmitted ? (
          /* Booking Form */
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Complete Your Booking</h3>
              <p className="text-muted-foreground">
                Total payment required: <span className="font-bold text-primary">{total} USDT</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="moveInDate">Preferred Move-in Date *</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={bookingForm.moveInDate}
                  onChange={(e) => setBookingForm({...bookingForm, moveInDate: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Any special requirements or questions..."
                value={bookingForm.message}
                onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                rows={3}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                By clicking "Confirm Booking", you agree to our terms and conditions. 
                Payment will be processed securely via USDT wallet.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleBookingSubmit}
                disabled={isSubmitting || !bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.moveInDate}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? 'Processing...' : `Confirm Booking - ${total} USDT`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBookingForm(false)}
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Booking Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              Your rental application for <strong>{property.title}</strong> has been submitted.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">
                📧 Confirmation email sent to {bookingForm.email}
                <br />
                📱 Property owner will contact you within 24 hours
                <br />
                💰 Payment processing will begin upon approval
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This window will close automatically...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
