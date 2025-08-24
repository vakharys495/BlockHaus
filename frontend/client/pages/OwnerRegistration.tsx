import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Check,
  Camera,
  Building2
} from 'lucide-react';

interface OwnerForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  aboutMe: string;
  profilePhoto: File | null;
}

export default function OwnerRegistration() {
  const navigate = useNavigate();
  const [ownerForm, setOwnerForm] = useState<OwnerForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    aboutMe: '',
    profilePhoto: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOwnerForm({ ...ownerForm, profilePhoto: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call to register owner
    setTimeout(() => {
      // Store owner registration status in localStorage
      localStorage.setItem('isRegisteredOwner', 'true');
      localStorage.setItem('ownerInfo', JSON.stringify({
        fullName: ownerForm.fullName,
        email: ownerForm.email,
        phone: ownerForm.phone,
        address: ownerForm.address,
        city: ownerForm.city,
        aboutMe: ownerForm.aboutMe,
        registrationDate: new Date().toISOString()
      }));
      
      setIsSubmitting(false);
      navigate('/my-listings');
    }, 2000);
  };

  const isFormValid = ownerForm.fullName && ownerForm.email && ownerForm.phone && ownerForm.address && ownerForm.city;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Register as Property Owner</h1>
            <p className="text-muted-foreground">
              Join BLOKHAUS as a verified property owner and start listing your properties
            </p>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="text-center">
                <Label htmlFor="profilePhoto" className="block mb-4">
                  Profile Photo *
                </Label>
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center overflow-hidden border-4 border-dashed border-border">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label 
                    htmlFor="profilePhoto" 
                    className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                  <input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload a clear photo of yourself for verification
                </p>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={ownerForm.fullName}
                      onChange={(e) => setOwnerForm({...ownerForm, fullName: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm({...ownerForm, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={ownerForm.phone}
                      onChange={(e) => setOwnerForm({...ownerForm, phone: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="city"
                      placeholder="Enter your city"
                      value={ownerForm.city}
                      onChange={(e) => setOwnerForm({...ownerForm, city: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Full Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                  <Textarea
                    id="address"
                    placeholder="Enter your complete address"
                    value={ownerForm.address}
                    onChange={(e) => setOwnerForm({...ownerForm, address: e.target.value})}
                    className="pl-10"
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aboutMe">About Me (Optional)</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Tell potential renters about yourself, your experience as a property owner, etc."
                  value={ownerForm.aboutMe}
                  onChange={(e) => setOwnerForm({...ownerForm, aboutMe: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Terms and Benefits */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-semibold mb-3">Owner Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">List unlimited properties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Manage booking requests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Secure USDT payments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Verified owner badge</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Property analytics</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Verification Required:</strong> All property owners must complete identity verification. 
                  Your information will be reviewed within 24-48 hours.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? 'Registering...' : 'Register as Owner'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By registering, you agree to our Terms of Service and Privacy Policy. 
                False information may result in account suspension.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
