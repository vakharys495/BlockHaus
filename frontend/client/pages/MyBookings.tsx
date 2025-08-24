import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Eye, 
  CreditCard,
  Home,
  Phone,
  Mail,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RenterBooking {
  id: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  ownerName: string;
  ownerAvatar?: string;
  ownerEmail: string;
  ownerPhone: string;
  requestDate: string;
  moveInDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'completed';
  rentAmount: string;
  totalAmount: string;
  message?: string;
  approvalDate?: string;
  paymentDeadline?: string;
}

import { bookingApi, paymentApi } from '@/services/api';

// Initial bookings state (will be replaced with API data)
const initialRenterBookings: RenterBooking[] = [];

export default function MyBookings() {
  const [bookings, setBookings] = useState<RenterBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; booking: RenterBooking | null }>({
    open: false,
    booking: null
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch user's bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, you would fetch user-specific bookings
        // For now, we'll use mock data
        setBookings(mockRenterBookings);
      } catch (err) {
        setError('Failed to load bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved - Pay Now</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handlePayment = async (booking: RenterBooking) => {
    try {
      setIsProcessingPayment(true);
      
      // Process payment via API
      await paymentApi.payRent({
        propertyId: booking.id, // In a real app, this would be the actual property ID
        amount: parseInt(booking.totalAmount)
      });
      
      // Update booking status to paid
      setBookings(bookings.map(b =>
        b.id === booking.id ? { ...b, status: 'paid' as const } : b
      ));
      setIsProcessingPayment(false);
      setPaymentModal({ open: false, booking: null });
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsProcessingPayment(false);
      // In a real app, you would show an error message to the user
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const stats = [
    { 
      label: "Total Applications", 
      value: bookings.length, 
      icon: Home,
      color: "text-blue-600"
    },
    { 
      label: "Pending", 
      value: bookings.filter(b => b.status === 'pending').length, 
      icon: Clock,
      color: "text-yellow-600"
    },
    { 
      label: "Approved", 
      value: bookings.filter(b => b.status === 'approved').length, 
      icon: Check,
      color: "text-green-600"
    },
    { 
      label: "Active Rentals", 
      value: bookings.filter(b => b.status === 'paid' || b.status === 'completed').length, 
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Booking Applications</h1>
          <p className="text-muted-foreground">
            Track your rental applications and manage payments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <Icon className={cn("w-8 h-8 mr-4", stat.color)} />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Your Rental Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications found</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? "You haven't submitted any rental applications yet."
                        : `No ${activeTab} applications at the moment.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredBookings.map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Property Image */}
                            <div className="lg:w-48 h-32 lg:h-auto">
                              <img 
                                src={booking.propertyImage} 
                                alt={booking.propertyTitle}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            
                            {/* Booking Details */}
                            <div className="flex-1 space-y-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{booking.propertyTitle}</h3>
                                  <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    <span>{booking.propertyLocation}</span>
                                  </div>
                                  <div className="text-lg font-bold text-primary mt-1">
                                    {booking.rentAmount}/month
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>

                              {/* Owner Information */}
                              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar>
                                  <AvatarImage src={booking.ownerAvatar} />
                                  <AvatarFallback>
                                    {booking.ownerName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-medium">Property Owner: {booking.ownerName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center space-x-4">
                                    <span className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {booking.ownerEmail}
                                    </span>
                                    <span className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {booking.ownerPhone}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="text-sm text-muted-foreground">Application Date</div>
                                  <div className="font-medium">{new Date(booking.requestDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Move-in Date</div>
                                  <div className="font-medium">{new Date(booking.moveInDate).toLocaleDateString()}</div>
                                </div>
                                {booking.paymentDeadline && (
                                  <div>
                                    <div className="text-sm text-muted-foreground">Payment Deadline</div>
                                    <div className="font-medium text-orange-600">{new Date(booking.paymentDeadline).toLocaleDateString()}</div>
                                  </div>
                                )}
                              </div>

                              {/* Message */}
                              {booking.message && (
                                <div className="p-4 bg-background border rounded-lg">
                                  <div className="text-sm text-muted-foreground mb-2">
                                    {booking.status === 'approved' ? 'Approval Message:' : 'Status Update:'}
                                  </div>
                                  <p className="text-sm">{booking.message}</p>
                                </div>
                              )}

                              {/* Payment Warning for Approved */}
                              {booking.status === 'approved' && booking.paymentDeadline && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-orange-800">Payment Required</div>
                                      <div className="text-sm text-orange-700">
                                        Your application has been approved! Please complete payment by{' '}
                                        <strong>{new Date(booking.paymentDeadline).toLocaleDateString()}</strong> to secure your rental.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'approved' && (
                                  <Button
                                    onClick={() => setPaymentModal({ open: true, booking })}
                                    className="flex items-center space-x-2"
                                  >
                                    <CreditCard className="w-4 h-4" />
                                    <span>Pay Now - {booking.totalAmount}</span>
                                  </Button>
                                )}
                                <Button variant="outline" className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>View Property</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal({ open, booking: null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Complete Payment</span>
              </DialogTitle>
            </DialogHeader>

            {paymentModal.booking && (
              <div className="space-y-6">
                {/* Property Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{paymentModal.booking.propertyTitle}</h3>
                  <p className="text-sm text-muted-foreground">{paymentModal.booking.propertyLocation}</p>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Monthly Rent</span>
                    <span className="font-semibold">{paymentModal.booking.rentAmount}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-bold text-primary">{paymentModal.booking.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">USDT Wallet Payment</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Payment will be processed securely through your connected StarkNet wallet.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => handlePayment(paymentModal.booking!)}
                    disabled={isProcessingPayment}
                    className="flex-1"
                  >
                    {isProcessingPayment ? 'Processing...' : `Pay ${paymentModal.booking.totalAmount}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPaymentModal({ open: false, booking: null })}
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Secure payment powered by StarkNet blockchain technology
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
