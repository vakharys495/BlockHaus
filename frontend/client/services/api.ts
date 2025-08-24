// API service for Blokhaus backend integration
const API_BASE_URL = 'http://localhost:3001/api';

interface Property {
  id: number;
  owner: string;
  tenant: string;
  rentPerMonth: number;
  isBooked: boolean;
  description: string;
  // Additional frontend properties
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

interface Booking {
  id: number;
  propertyId: number;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyImage?: string;
  ownerWalletAddress?: string;
  renterName?: string;
  renterEmail?: string;
  renterPhone?: string;
  renterWalletAddress?: string;
  requestDate?: string;
  moveInDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'completed';
  message?: string;
  rentAmount?: string;
  totalAmount?: string;
  approvalDate?: string | null;
  paymentDeadline?: string | null;
}

interface Payment {
  propertyId: number;
  amount: number;
  transactionHash: string;
}

// Property API functions
export const propertyApi = {
  // Get all properties
  getAllProperties: async (): Promise<Property[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties`);
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
      }
      const properties = await response.json();
      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get property by ID
  getPropertyById: async (id: number): Promise<Property> => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch property: ${response.statusText}`);
      }
      const property = await response.json();
      return property;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  // List a new property
  listProperty: async (propertyData: {
    rentPerMonth: number;
    description: string;
  }): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to list property: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error listing property:', error);
      throw error;
    }
  },
};

// Listings API functions (file-backed storage with image upload)
export interface Listing {
  id: number;
  title: string;
  description?: string;
  price: string; // e.g., "750 USDT/month"
  location: string;
  beds?: number;
  baths?: number;
  area?: string;
  propertyType?: string;
  city?: string;
  rentalDuration?: 'monthly' | 'yearly';
  image: string; // main image URL
  images?: string[]; // additional image URLs
  walletAddress?: string;
  badge?: string;
  type?: 'sale' | 'rent';
  createdAt?: string;
}

export const listingEvents = new EventTarget();

export const listingsApi = {
  // Get all listings
  getAllListings: async (): Promise<Listing[]> => {
    const res = await fetch(`${API_BASE_URL}/listings`);
    if (!res.ok) throw new Error(`Failed to fetch listings: ${res.statusText}`);
    return res.json();
  },

  // Get listing by ID
  getListingById: async (id: number): Promise<Listing> => {
    const res = await fetch(`${API_BASE_URL}/listings/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch listing: ${res.statusText}`);
    return res.json();
  },

  // Create listing with images
  createListing: async (form: FormData): Promise<Listing> => {
    const res = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(`Failed to create listing: ${res.statusText}`);
    const listing = await res.json();
    // Broadcast creation for real-time UI updates across pages
    try {
      listingEvents.dispatchEvent(new CustomEvent('listing:created', { detail: listing }));
    } catch {}
    return listing;
  },
};

// Booking API functions (v2 with persistence and status updates)
export const bookingApi = {
  // Create booking
  bookProperty: async (bookingData: {
    propertyId: number;
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    renterWalletAddress?: string;
    moveInDate: string;
    message?: string;
  }): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/bookings_v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) throw new Error(`Failed to book property: ${response.statusText}`);
    return response.json();
  },

  // List bookings by owner or renter
  listBookings: async (params?: { ownerWalletAddress?: string; renterWalletAddress?: string }): Promise<Booking[]> => {
    const url = new URL(`${API_BASE_URL}/bookings_v2`);
    if (params?.ownerWalletAddress) url.searchParams.set('ownerWalletAddress', params.ownerWalletAddress);
    if (params?.renterWalletAddress) url.searchParams.set('renterWalletAddress', params.renterWalletAddress);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.statusText}`);
    return res.json();
  },

  // Approve or reject booking (owner)
  approveBooking: async (id: number, approved: boolean): Promise<Booking> => {
    const res = await fetch(`${API_BASE_URL}/bookings_v2/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error(`Failed to update booking: ${res.statusText}`);
    return res.json();
  },

  // Pay booking (backend checks on-chain balance for payerWalletAddress)
  payBooking: async (id: number, payerWalletAddress: string): Promise<Booking> => {
    const res = await fetch(`${API_BASE_URL}/bookings_v2/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payerWalletAddress }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }
    return res.json();
  },
};

// Payment API functions
export const paymentApi = {
  // Pay rent for a property
  payRent: async (paymentData: {
    propertyId: number;
    amount: number;
  }): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to pay rent: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error paying rent:', error);
      throw error;
    }
  },

  // Get USDT token address
  getUsdtTokenAddress: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/usdt-address`);
      if (!response.ok) {
        throw new Error(`Failed to get USDT token address: ${response.statusText}`);
      }
      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Error getting USDT token address:', error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};