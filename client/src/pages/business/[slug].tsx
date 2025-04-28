import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Marketing site components (simplified for this implementation)
const Hero = ({ business }: { business: any }) => (
  <section className="py-20 bg-gradient-to-r from-primary-500/20 to-primary-700/20 overflow-hidden">
    <div className="container px-4 mx-auto">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{business.name}</h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10">
          {business.description || `Professional ${business.vertical} services for your home or business.`}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="text-lg">Contact Us</Button>
          <Button size="lg" variant="outline" className="text-lg">Our Services</Button>
        </div>
      </div>
    </div>
  </section>
);

const Services = ({ business }: { business: any }) => {
  // Get services based on vertical
  const getServices = () => {
    const verticalMap: Record<string, string[]> = {
      hvac: ['Air Conditioning', 'Heating', 'Ventilation', 'Maintenance', 'System Installation'],
      plumbing: ['Leak Repair', 'Drain Cleaning', 'Water Heater Service', 'Fixture Installation'],
      electrical: ['Wiring', 'Panel Upgrades', 'Lighting Installation', 'Safety Inspections'],
      cleaning: ['Deep Cleaning', 'Regular Maintenance', 'Window Cleaning', 'Move-in/Move-out'],
      landscaping: ['Lawn Care', 'Tree Service', 'Hardscaping', 'Irrigation Systems'],
      roofing: ['Roof Repair', 'Replacement', 'Inspection', 'Gutter Installation'],
      general: ['Maintenance', 'Repair', 'Installation', 'Consultation'],
    };
    
    return verticalMap[business.vertical] || verticalMap.general;
  };
  
  const services = getServices();
  
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{service}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Professional {service.toLowerCase()} services tailored to your needs.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Reviews = ({ business }: { business: any }) => (
  <section className="py-16 bg-gray-50">
    <div className="container px-4 mx-auto">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Our Customers Love Us</h2>
        <p className="text-lg text-gray-600 mb-12">
          See what our satisfied customers have to say about our services
        </p>
        
        {/* Mock reviews - would be real in production */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                    </svg>
                  ))}
                </div>
                <p className="italic text-gray-600 mb-4">
                  "Excellent service! Very professional and got the job done quickly."
                </p>
                <p className="font-semibold">- Satisfied Customer</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Contact = ({ business }: { business: any }) => (
  <section className="py-16 bg-white">
    <div className="container px-4 mx-auto">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Contact Us</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-4">Get In Touch</h3>
            <div className="space-y-4">
              {business.phone && (
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  {business.phone}
                </p>
              )}
              {business.email && (
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  {business.email}
                </p>
              )}
              {business.address && (
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {business.address}, {business.city}, {business.state} {business.zip}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Send a Message</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
              </div>
              <Button>Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ business }: { business: any }) => (
  <footer className="bg-gray-900 text-white py-12">
    <div className="container px-4 mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">{business.name}</h3>
          <p className="text-gray-400 mb-4">{business.description}</p>
          {business.phone && (
            <p className="text-gray-400">{business.phone}</p>
          )}
          {business.email && (
            <p className="text-gray-400">{business.email}</p>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Services</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4">Hours</h3>
          <ul className="space-y-1">
            <li className="text-gray-400">Monday-Friday: 8am-6pm</li>
            <li className="text-gray-400">Saturday: 9am-2pm</li>
            <li className="text-gray-400">Sunday: Closed</li>
          </ul>
          <div className="mt-4 flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} {business.name}. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default function BusinessPage() {
  const [, params] = useRoute('/:slug');
  const slug = params?.slug;
  const [, navigate] = useLocation();
  
  // Fetch business by slug
  const { data: business, isLoading, error } = useQuery({
    queryKey: [`/api/businesses/slug/${slug}`],
    enabled: !!slug,
  });
  
  // Redirect to 404 page if business not found
  useEffect(() => {
    if (!isLoading && error) {
      navigate('/not-found');
    }
  }, [isLoading, error, navigate]);
  
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="py-20 bg-gradient-to-r from-gray-100 to-gray-200">
          <div className="container px-4 mx-auto">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
        </div>
        <div className="container px-4 mx-auto py-12">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!business) return null;
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header with business info */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <Button size="sm" variant="outline" onClick={() => navigate('/app')}>
              Login
            </Button>
          </div>
        </div>
      </header>
      
      {/* Marketing site sections */}
      <Hero business={business} />
      <Services business={business} />
      <Reviews business={business} />
      <Contact business={business} />
      <Footer business={business} />
    </div>
  );
}