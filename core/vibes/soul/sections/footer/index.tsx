

import React, { forwardRef } from 'react';
import { Stream } from '@/vibes/soul/lib/streamable';
import { Link } from '~/components/link';
import { Facebook, Youtube, Twitter, Mail } from 'lucide-react';

export const Footer = forwardRef(function Footer(
  {
    sections: streamableSections,
    className,
  },
  ref
) {
  // Only Quick Links and Categories sections
  const quickLinks = [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Customer Gallery' },
    { href: '#', label: 'Safe Shopping' },
    { href: '#', label: 'Videos' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Shipping & Returns' },
    { href: '#', label: 'Contact Us' }
  ];

  return (
    <>
      <div className="w-full bg-[#2D3748] p-4 text-center">
        <a href="tel:9708003173" className="text-xl font-semibold text-white">
          CALL (970) 800-3173
        </a>
      </div>

      <footer className="border-b-4 border-t bg-gray-100" ref={ref}>
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {/* Quick Links */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-700">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-gray-600 hover:text-gray-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="col-span-2">
              <Stream value={streamableSections}>
                {(sections) => {
                  if (sections?.length > 0) {
                    return (
                      <div>
                        <h3 className="mb-4 font-semibold text-gray-700">Categories</h3>
                        <ul className="space-y-2">
                          {sections[0].links.map((link, idx) => (
                            <li key={idx}>
                              <Link
                                href={link.href}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                }}
              </Stream>
            </div>

            {/* Payments & Security */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-700">Payments & Security</h3>
              <div className="mb-4 flex flex-wrap gap-2">
                <img src="https://cdn2.bigcommerce.com/n-ww20x/ghm4gd08/templates/__custom/img/cards.png?t=1501592050" alt="Visa" className="h-8" />
                
              </div>
              <div className="flex gap-4">
                <img src="https://s3.amazonaws.com/marketing360verticals/ecommerce/img/safe-secure.png" alt="Safe Shopping" className="h-16" />
                <img src="https://cdn2.bigcommerce.com/n-ww20x/ghm4gd08/templates/__custom/img/Authorize_Logo.png?t=1501592050" alt="Authorize.net" className="h-16" />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-700">Social Media</h3>
              <div className="flex gap-4">
                <Link href="#" className="text-blue-600 hover:text-blue-800">
                  <Facebook size={24} />
                </Link>
                <Link href="#" className="text-red-600 hover:text-red-800">
                  <Youtube size={24} />
                </Link>
                <Link href="#" className="text-blue-400 hover:text-blue-600">
                  <Twitter size={24} />
                </Link>
                <Link href="#" className="text-red-600 hover:text-red-800">
                  <Mail size={24} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
});

export default Footer;