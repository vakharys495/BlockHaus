import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Calendar, 
  Check, 
  X, 
  Eye, 
  MessageCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: number;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  tenantName: string;
  tenantAvatar?: string;
  tenantEmail: string;
  tenantPhone: string;
  requestDate: string;
  moveInDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  message?: string;
  rentAmount: string;
}

const mockBookings: Booking[] = [
  {
    id: 1,
    propertyTitle: "Luxury Executive Villa",
    propertyLocation: "Maitama, Abuja",
    propertyImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    tenantName: "Adebayo Johnson",
    tenantEmail: "adebayo.j@email.com",
    tenantPhone: "+234 801 234 5678",
    requestDate: "2024-01-15",
    moveInDate: "2024-02-01",
    status: "pending",
    message: "Hello, I'm very interested in renting this beautiful villa. I work as a software engineer and can provide references. Looking forward to hearing from you.",
    rentAmount: "850 USDT/month"
  },
  {
    id: 2,
    propertyTitle: "Modern Apartment",
    propertyLocation: "Wuse II, Abuja",
    propertyImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    tenantName: "Fatima Ibrahim",
    tenantEmail: "fatima.ibrahim@email.com",
    tenantPhone: "+234 802 345 6789",
    requestDate: "2024-01-10",
    moveInDate: "2024-01-25",
    status: "approved",
    message: "I'm relocating to Abuja for work and this apartment looks perfect for my needs.",
    rentAmount: "650 USDT/month"
  },
  {
    id: 3,
    propertyTitle: "Executive Bungalow",
    propertyLocation: "Barnawa, Kaduna",
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    tenantName: "David Okafor",
    tenantEmail: "david.okafor@email.com",
    tenantPhone: "+234 803 456 7890",
    requestDate: "2024-01-08",
    moveInDate: "2024-01-20",
    status: "completed",
    message: "Thank you for approving my application. Looking forward to moving in!",
    rentAmount: "600 USDT/month"
  }
];

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [activeTab, setActiveTab] = useState<string>('all');

  const updateBookingStatus = (id: number, status: 'approved' | 'rejected') => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const stats = [
    { 
      label: "Total Requests", 
      value: bookings.length, 
      icon: Bell,
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
      label: "Completed", 
      value: bookings.filter(b => b.status === 'completed').length, 
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Requests</h1>
          <p className="text-muted-foreground">
            Manage rental applications and booking requests for your properties
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
              <Bell className="w-5 h-5" />
              <span>Recent Booking Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No booking requests</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? "You haven't received any booking requests yet."
                        : `No ${activeTab} booking requests at the moment.`
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
                                    {booking.rentAmount}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(booking.status)}
                                </div>
                              </div>

                              {/* Tenant Information */}
                              <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar>
                                  <AvatarImage src={booking.tenantAvatar} />
                                  <AvatarFallback>
                                    {booking.tenantName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-medium">{booking.tenantName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center space-x-4">
                                    <span className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {booking.tenantEmail}
                                    </span>
                                    <span className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {booking.tenantPhone}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                <div>
                                  <div className="text-sm text-muted-foreground">Request Date</div>
                                  <div className="font-medium">{new Date(booking.requestDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Preferred Move-in Date</div>
                                  <div className="font-medium">{new Date(booking.moveInDate).toLocaleDateString()}</div>
                                </div>
                              </div>

                              {/* Message */}
                              {booking.message && (
                                <div className="p-4 bg-background border rounded-lg">
                                  <div className="text-sm text-muted-foreground mb-2">Message from tenant:</div>
                                  <p className="text-sm">{booking.message}</p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => updateBookingStatus(booking.id, 'approved')}
                                      className="flex items-center space-x-2"
                                    >
                                      <Check className="w-4 h-4" />
                                      <span>Approve</span>
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                      className="flex items-center space-x-2"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Reject</span>
                                    </Button>
                                  </>
                                )}
                                <Button variant="outline" className="flex items-center space-x-2">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Message</span>
                                </Button>
                                <Button variant="outline" className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>View Details</span>
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
      </div>
    </div>
  );
}
