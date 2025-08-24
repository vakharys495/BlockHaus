import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  TrendingUp,
  Bell,
  Check,
  X,
  MessageCircle,
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { Property } from '@/components/PropertyCard';
import { cn } from '@/lib/utils';

import { listingsApi, listingEvents } from '@/services/api';
import { bookingApi } from '@/services/api';

// Initial user's listings state (will be replaced with API data)
const initialUserListings: Property[] = [];

interface NewListingForm {
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  description: string;
  propertyType: string;
  city: string;
  rentalDuration: 'monthly' | 'yearly';
  images: File[];
  imagePreviews: string[];
}

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

// Booking requests will be fetched from backend for the connected owner

export default function MyListings() {
  const navigate = useNavigate();
  const [isRegisteredOwner, setIsRegisteredOwner] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);
  const [listings, setListings] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('listings');
  const [newListing, setNewListing] = useState<NewListingForm>({
    title: '',
    location: '',
    price: '',
    beds: 1,
    baths: 1,
    area: '',
    description: '',
    propertyType: '',
    city: '',
    rentalDuration: 'monthly',
    images: [],
    imagePreviews: []
  });
  
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [balanceInput, setBalanceInput] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Fetch user's listings and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all listings from backend storage
        const fetchedListings = await listingsApi.getAllListings();
        setListings(fetchedListings as any);
        
        // Fetch booking requests for this owner (connected wallet)
        const ownerWalletAddress = localStorage.getItem('walletAddress') || '';
        if (ownerWalletAddress) {
          const ownerBookings = await bookingApi.listBookings({ ownerWalletAddress });
          const mapped = (ownerBookings as any[]).map((b) => ({
            id: b.id,
            propertyTitle: b.propertyTitle,
            propertyLocation: b.propertyLocation,
            propertyImage: b.propertyImage,
            tenantName: b.renterName,
            tenantEmail: b.renterEmail,
            tenantPhone: b.renterPhone,
            requestDate: b.requestDate,
            moveInDate: b.moveInDate,
            status: b.status,
            message: b.message,
            rentAmount: b.rentAmount,
          }));
          setBookings(mapped);
        } else {
          setBookings([]);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check if user is registered as an owner
    const checkOwnerRegistration = () => {
      const registrationStatus = localStorage.getItem('isRegisteredOwner');
      setIsRegisteredOwner(registrationStatus === 'true');
      setIsCheckingRegistration(false);
      
      // If registered, fetch data
      if (registrationStatus === 'true') {
        fetchData();
      }
    };

    // Simulate checking registration
    setTimeout(checkOwnerRegistration, 500);
  }, []);

  // Check if user is registered as an owner
  useEffect(() => {
    const checkOwnerRegistration = () => {
      const registrationStatus = localStorage.getItem('isRegisteredOwner');
      setIsRegisteredOwner(registrationStatus === 'true');
      setIsCheckingRegistration(false);
    };

    // Simulate checking registration
    setTimeout(checkOwnerRegistration, 500);
  }, []);

  // Real-time update across pages
  useEffect(() => {
    const handler = (e: any) => {
      const created = e.detail;
      setListings((prev) => [created as any, ...prev]);
    };
    listingEvents.addEventListener('listing:created', handler as EventListener);
    return () => listingEvents.removeEventListener('listing:created', handler as EventListener);
  }, []);

  // Poll owner bookings periodically to reflect new requests and status changes
  useEffect(() => {
    const ownerWalletAddress = localStorage.getItem('walletAddress') || '';
    if (!ownerWalletAddress) return;
    let stopped = false;
    const fetchOwnerBookings = async () => {
      try {
        const ownerBookings = await bookingApi.listBookings({ ownerWalletAddress });
        if (stopped) return;
        const mapped = (ownerBookings as any[]).map((b) => ({
          id: b.id,
          propertyTitle: b.propertyTitle,
          propertyLocation: b.propertyLocation,
          propertyImage: b.propertyImage,
          tenantName: b.renterName,
          tenantEmail: b.renterEmail,
          tenantPhone: b.renterPhone,
          requestDate: b.requestDate,
          moveInDate: b.moveInDate,
          status: b.status,
          message: b.message,
          rentAmount: b.rentAmount,
        }));
        setBookings(mapped);
      } catch {}
    };
    const id = setInterval(fetchOwnerBookings, 5000);
    fetchOwnerBookings();
    return () => { stopped = true; clearInterval(id); };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewListing(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        imagePreviews: [
          ...prev.imagePreviews,
          ...files.map(file => URL.createObjectURL(file))
        ]
      }));
    }
  };

  const removeImage = (index: number) => {
    setNewListing(prev => {
      const newImages = [...prev.images];
      const newPreviews = [...prev.imagePreviews];
      newImages.splice(index, 1);
      newPreviews.splice(index, 1);
      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews
      };
    });
  };

  const handleCreateListing = async () => {
    try {
      const form = new FormData();
      form.append('title', newListing.title);
      form.append('description', newListing.description);
      form.append('price', `${newListing.price} USDT/month`);
      form.append('location', newListing.location);
      form.append('beds', String(newListing.beds));
      form.append('baths', String(newListing.baths));
      form.append('area', newListing.area);
      form.append('propertyType', newListing.propertyType);
      form.append('city', newListing.city);
      form.append('rentalDuration', newListing.rentalDuration);
      const walletAddress = localStorage.getItem('walletAddress') || '';
      if (walletAddress) form.append('walletAddress', walletAddress);
      newListing.images.forEach((file) => form.append('images', file));

      const created = await listingsApi.createListing(form);
      setListings([created as any, ...listings]);
      setIsCreateDialogOpen(false);

      // Reset form
      setNewListing({
        title: '',
        location: '',
        price: '',
        beds: 1,
        baths: 1,
        area: '',
        description: '',
        propertyType: '',
        city: '',
        rentalDuration: 'monthly',
        images: [],
        imagePreviews: []
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      // In a real app, you would show an error message to the user
    }
  };

  const deleteListing = (id: number) => {
    setListings(listings.filter(listing => listing.id !== id));
  };

  const updateBookingStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const updated = await bookingApi.approveBooking(id as any, status === 'approved');
      setBookings(bookings.map(booking =>
        booking.id === id ? { ...booking, status: updated.status as any } : booking
      ));
    } catch (e) {
      console.error('Failed to update booking:', e);
    }
  };

  const openOwnerPayment = (booking: Booking) => {
    setPaymentModal({ open: true, booking });
    setBalanceInput('');
    setPaymentError(null);
  };

  const handleOwnerPayment = async () => {
    if (!paymentModal.booking) return;
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);
      const ownerWalletAddress = localStorage.getItem('walletAddress') || '';
      const updated = await bookingApi.payBooking(paymentModal.booking.id as any, ownerWalletAddress, Number(balanceInput || 0));
      setBookings((prev) => prev.map(b => b.id === updated.id ? { ...b, status: updated.status as any } : b));
      setPaymentModal({ open: false, booking: null });
      setIsProcessingPayment(false);
    } catch (e: any) {
      setPaymentError(e?.message || 'Payment failed');
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Paid</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusColor = (badge: string) => {
    switch (badge) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Rented':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const listingStats = [
    { label: "Total Listings", value: listings.length, icon: TrendingUp },
    { label: "Active", value: listings.filter(l => l.badge === 'Active').length, icon: Eye },
    { label: "Rented", value: listings.filter(l => l.badge === 'Rented').length, icon: Calendar }
  ];

  const bookingStats = [
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
    }
  ];

  // Show loading state while checking registration
  if (isCheckingRegistration) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Checking your registration status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show registration prompt if not registered as owner
  if (!isRegisteredOwner) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">Become a Property Owner</h1>
                <p className="text-muted-foreground mb-6">
                  To list and manage properties on BLOKHAUS, you need to register as a verified property owner.
                  This helps us maintain a safe and trustworthy platform for all users.
                </p>

                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold mb-3">What you'll need:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Valid identification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Contact information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Profile photo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Address verification</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => navigate('/owner-registration')}
                    size="lg"
                    className="flex-1"
                  >
                    Register as Owner
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    size="lg"
                  >
                    Go Back
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Registration is free and takes less than 5 minutes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Properties & Bookings</h1>
            <p className="text-muted-foreground">
              Manage your rental properties, listings, and booking requests
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create New Listing</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Property Listing</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Property Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Luxury Executive Villa"
                          value={newListing.title}
                          onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="price">Monthly Rent (USDT)</Label>
                        <Input
                          id="price"
                          placeholder="e.g., 750"
                          value={newListing.price}
                          onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Select value={newListing.city} onValueChange={(value) => setNewListing({...newListing, city: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="abuja">Abuja</SelectItem>
                            <SelectItem value="kaduna">Kaduna</SelectItem>
                            <SelectItem value="lagos">Lagos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Specific Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g., Maitama, Wuse II, GRA"
                          value={newListing.location}
                          onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select value={newListing.propertyType} onValueChange={(value) => setNewListing({...newListing, propertyType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="bungalow">Bungalow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="rentalDuration">Rental Duration</Label>
                        <Select value={newListing.rentalDuration} onValueChange={(value: 'monthly' | 'yearly') => setNewListing({...newListing, rentalDuration: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rental duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="beds">Bedrooms</Label>
                        <Select value={newListing.beds.toString()} onValueChange={(value) => setNewListing({...newListing, beds: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="baths">Bathrooms</Label>
                        <Select value={newListing.baths.toString()} onValueChange={(value) => setNewListing({...newListing, baths: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="area">Area (sq ft)</Label>
                        <Input
                          id="area"
                          placeholder="e.g., 2,400"
                          value={newListing.area}
                          onChange={(e) => setNewListing({...newListing, area: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Property Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your property, amenities, nearby attractions..."
                        value={newListing.description}
                        onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="images" className="space-y-4">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Upload Property Images</h3>
                        <p className="text-muted-foreground mb-4">
                          Add photos to showcase your property. First image will be the main photo.
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload">
                          <Button variant="outline" asChild>
                            <span>Choose Files</span>
                          </Button>
                        </Label>
                      </div>
                      
                      {/* Image Previews */}
                      {newListing.imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {newListing.imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateListing}
                    disabled={!newListing.title || !newListing.price || !newListing.location || newListing.images.length === 0}
                  >
                    Create Listing
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="listings" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>My Listings</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Booking Requests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {/* Listing Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {listingStats.map((stat, index) => {
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

            {/* Listings */}
            <div className="space-y-6">
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      You haven't created any listings yet
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-64 h-48 md:h-auto">
                        <img
                          src={listing.image}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold">{listing.title}</h3>
                              <Badge className={getStatusColor(listing.badge || '')}>
                                {listing.badge}
                              </Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{listing.location}</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">{listing.price}</div>
                          </div>

                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteListing(listing.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-muted-foreground">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>{listing.beds} beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span>{listing.baths} baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="w-4 h-4 mr-1" />
                            <span>{listing.area}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            {/* Booking Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {bookingStats.map((stat, index) => {
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
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No booking requests</h3>
                    <p className="text-muted-foreground">
                      You haven't received any booking requests yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                bookings.map((booking) => (
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
                            {booking.status === 'approved' && (
                              <Button
                                onClick={() => openOwnerPayment(booking)}
                                className="flex items-center space-x-2"
                              >
                                <Check className="w-4 h-4" />
                                <span>Pay on behalf</span>
                              </Button>
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
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Owner Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => { setPaymentModal({ open, booking: null }); setPaymentError(null); setBalanceInput(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment (Owner)</DialogTitle>
          </DialogHeader>
          {paymentModal.booking && (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-1">{paymentModal.booking.propertyTitle}</h3>
                <div className="text-sm text-muted-foreground">{paymentModal.booking.propertyLocation}</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Amount Due</span>
                  <span className="font-bold text-primary">{paymentModal.booking.rentAmount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Available balance (USDT):</span>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-32"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    placeholder="e.g. 1000"
                  />
                </div>
                {paymentError && (
                  <div className="text-sm text-red-600">{paymentError}</div>
                )}
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleOwnerPayment} disabled={isProcessingPayment} className="flex-1">
                  {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                </Button>
                <Button variant="outline" onClick={() => setPaymentModal({ open: false, booking: null })} disabled={isProcessingPayment}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
