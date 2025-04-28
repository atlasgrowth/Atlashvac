import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Business } from "@shared/schema";
import { ChatWidget } from "./ChatWidget";
import { PhoneIcon, MapPinIcon, MailIcon, ClockIcon, StarIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import verticals from '@shared/verticals.json';

interface MarketingSiteProps {
  business: Business;
}

export function MarketingSite({ business }: MarketingSiteProps) {
  const [chatOpen, setChatOpen] = useState(false);

  // Get vertical-specific content
  const vertical = business.vertical as keyof typeof verticals;
  const verticalData = verticals[vertical] || verticals.general;

  // Reviews data
  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/businesses/${business.id}/reviews`],
    enabled: !!business.id,
  });

  return (
    <div className="relative bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-6 pb-16 sm:pb-24">
        <nav className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center flex-1">
            <div className="flex items-center justify-between w-full md:w-auto">
              <a href="#">
                <span className="sr-only">{business.name}</span>
                <h1 className="text-2xl font-bold text-primary-600">{business.name}</h1>
              </a>
              <div className="-mr-2 flex items-center md:hidden">
                <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="hidden md:block md:ml-10 md:space-x-10">
              <a href="#services" className="font-medium text-gray-500 hover:text-gray-900">Services</a>
              <a href="#about" className="font-medium text-gray-500 hover:text-gray-900">About</a>
              <a href="#reviews" className="font-medium text-gray-500 hover:text-gray-900">Reviews</a>
              <a href="#contact" className="font-medium text-gray-500 hover:text-gray-900">Contact</a>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="inline-flex rounded-md shadow-md ring-1 ring-black ring-opacity-5">
              <a href={`tel:${business.phone}`} className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {business.phone}
              </a>
            </span>
          </div>
        </nav>

        {/* Hero content */}
        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">{verticalData.heroTitle}</span>
              <span className="block text-primary-600">{verticalData.heroSubtitle}</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              {business.description || verticalData.description}
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a href="#contact" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10">
                  Schedule Service
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a href="#services" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Our Services
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Services Section */}
      <div id="services" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Services</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive {verticalData.name} Solutions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              From routine maintenance to emergency repairs, we provide a full range of {verticalData.name.toLowerCase()} services for residential and commercial properties.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {verticalData.services.map((service, index) => (
                <div key={index} className="relative">
                  <div className={`absolute h-16 w-16 rounded-xl flex items-center justify-center ${index % 4 === 0 ? 'bg-primary-100 text-primary-600' : index % 4 === 1 ? 'bg-amber-100 text-amber-600' : index % 4 === 2 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {service.icon === 'snowflake' && <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18l-5 5m5-5l5 5m-10 5l5 5m5-5l-5 5m-6-14h12M5 12h14" /></svg>}
                    {service.icon === 'fire' && <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>}
                    {service.icon === 'droplet' && <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15c3.314 0 6-2.686 6-6 0-4-6-8-6-8S6 5 6 9c0 3.314 2.686 6 6 6z" /></svg>}
                    {service.icon === 'calendar-check' && <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                  </div>
                  <div className="ml-20">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div id="reviews" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Reviews</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </p>
          </div>
          
          <div className="mt-10 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {reviews.length > 0 ? reviews.slice(0, 3).map((review: any, idx: number) => (
              <div key={review.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-gray-500">{review.rating}.0</p>
                    </div>
                    <p className="mt-3 text-base text-gray-500">"{review.content}"</p>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{business.city}, {business.state}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : [
              // Render sample reviews if no real reviews are available
              {
                id: 1,
                name: "Sarah Johnson",
                location: business.city || "Austin, TX",
                rating: 5,
                text: "They provided exceptional service! The technician was knowledgeable, professional, and fixed our issue quickly. Highly recommend their services."
              },
              {
                id: 2,
                name: "Michael Thompson",
                location: business.city || "Austin, TX",
                rating: 5,
                text: "Great service from start to finish. The staff was friendly and the technicians were very thorough. Everything is working better than ever!"
              },
              {
                id: 3,
                name: "Jennifer Williams",
                location: business.city || "Austin, TX",
                rating: 4.5,
                text: "Responsive and reliable service. They diagnosed and fixed an issue that two other companies couldn't figure out. Fair pricing and excellent work."
              }
            ].map(review => (
              <div key={review.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < Math.floor(review.rating) ? 'fill-current' : i < review.rating ? 'fill-current opacity-50' : ''}`} />
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-gray-500">{review.rating}</p>
                    </div>
                    <p className="mt-3 text-base text-gray-500">"{review.text}"</p>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{review.name}</p>
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <span>{review.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <a href="#" className="text-base font-medium text-primary-600 hover:text-primary-500">
              Read more reviews on Google <svg className="inline-block h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div id="contact" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Contact Us</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Ready to Get Started?
            </p>
            <p className="mt-4 text-lg text-gray-500">
              Contact us today to schedule a service appointment or to get a free quote for your {verticalData.name} needs.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Contact Form */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <form action="#" method="POST">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">First name</label>
                      <div className="mt-1">
                        <input type="text" name="first-name" id="first-name" className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">Last name</label>
                      <div className="mt-1">
                        <input type="text" name="last-name" id="last-name" className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1">
                        <input id="email" name="email" type="email" className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1">
                        <input type="text" name="phone" id="phone" className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                      <div className="mt-1">
                        <textarea id="message" name="message" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 border-gray-300 rounded-md"></textarea>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Button 
                        type="submit" 
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Send Message
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Our Information</h3>
                  <div className="mt-6 space-y-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <MapPinIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3 text-base text-gray-500">
                        <p>{business.address}</p>
                        <p>{business.city}, {business.state} {business.zip}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <PhoneIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3 text-base text-gray-500">
                        <p>{business.phone}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <MailIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3 text-base text-gray-500">
                        <p>{business.email || `info@${business.slug}.com`}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3 text-base text-gray-500">
                        <p>Monday-Friday: 8am-7pm</p>
                        <p>Saturday: 9am-5pm</p>
                        <p>Sunday: Closed (24/7 Emergency Service Available)</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Follow Us</h3>
                    <div className="mt-2 flex space-x-6">
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Facebook</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Instagram</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Widget Button */}
              <div className="mt-6">
                <div className="bg-white overflow-hidden shadow rounded-lg border-primary-500 border-2">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Chat with Us</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-4">Need immediate assistance? Chat with our customer service team now!</p>
                      <Button 
                        onClick={() => setChatOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h1 className="text-xl font-semibold text-white">{business.name}</h1>
              <p className="mt-2 text-sm text-gray-300">
                Professional {verticalData.name} services for homes and businesses in the {business.city || "local"} area.
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-400">{verticalData.name} License #{business.id}12345</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
              <ul className="mt-4 space-y-4">
                {verticalData.services.map((service, idx) => (
                  <li key={idx}>
                    <a href="#services" className="text-base text-gray-300 hover:text-white">
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Service Areas
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Financing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    Warranty Info
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Chat Widget */}
      <ChatWidget
        businessId={business.id}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
}
