import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground mb-4">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                This page is currently being developed. Our team is working hard to bring you 
                an amazing experience for browsing {title.toLowerCase()}.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-6">
                <p className="text-muted-foreground mb-4">
                  In the meantime, you can:
                </p>
                <ul className="text-left space-y-2 text-muted-foreground">
                  <li>• Browse our featured properties on the homepage</li>
                  <li>• Contact our agents for personalized assistance</li>
                  <li>• Save your favorite properties to your wishlist</li>
                  <li>• Get a free property valuation</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Homepage
                  </Link>
                </Button>
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Agent
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Want to see this page completed sooner? Let us know what features you'd like to see!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
