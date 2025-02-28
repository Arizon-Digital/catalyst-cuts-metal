

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
    { href: '/about', label: 'About Us' },
    { href: '/customer-gallery', label: 'Customer Gallery' },
    { href: '/safe-shopping', label: 'Safe Shopping' },
    { href: '/videos', label: 'Videos' },
    { href: '/blog', label: 'Blog' },
    { href: '/shipping-returns', label: 'Shipping & Returns' },
    { href: '/contact-us', label: 'Contact Us' }
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
                <img src="https://cdn2.bigcommerce.com/n-ww20x/ghm4gd08/templates/__custom/img/cards.png?t=1501592050" alt="Visa" className="h-[32px]" />

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
                <Link href="https://www.facebook.com/Cutsmetalloveland?ref=hl" className="text-blue-600 hover:text-blue-800">
                  <Facebook size={24} />
                </Link>
                <Link href="https://www.youtube.com/channel/UCbkSOBsMU4wF9B47pYrO7Wg" className="text-red-600 hover:text-red-800">
                  <Youtube size={24} />
                </Link>
                <Link href="https://x.com/i/flow/login?redirect_after_login=%2FCutsmetal" className="text-blue-400 hover:text-blue-600">
                  <Twitter size={24} />
                </Link>
               
                <Link href="https://www.pinterest.com/cuts_metal/">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.217-.937 1.401-5.965 1.401-5.965s-.357-.715-.357-1.774c0-1.66.962-2.9 2.161-2.9 1.02 0 1.512.765 1.512 1.682 0 1.025-.653 2.557-.989 3.975-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" fill="#E60023"/>
  </svg>
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