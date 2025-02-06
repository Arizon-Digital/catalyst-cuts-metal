// import { clsx } from 'clsx';
// import { forwardRef, ReactNode, type Ref } from 'react';

// import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
// import { Logo } from '@/vibes/soul/primitives/logo';
// import { Link } from '~/components/link';

// interface Image {
//   src: string;
//   alt: string;
// }

// interface Link {
//   href: string;
//   label: string;
// }

// export interface Section {
//   title?: string;
//   links: Link[];
// }

// interface SocialMediaLink {
//   href: string;
//   icon: ReactNode;
// }

// interface ContactInformation {
//   address?: string;
//   phone?: string;
// }

// interface Props {
//   logo?: Streamable<string | Image | null>;
//   sections: Streamable<Section[]>;
//   copyright?: Streamable<string | null>;
//   contactInformation?: Streamable<ContactInformation | null>;
//   paymentIcons?: Streamable<ReactNode[] | null>;
//   socialMediaLinks?: Streamable<SocialMediaLink[] | null>;
//   contactTitle?: string;
//   className?: string;
//   logoHref?: string;
//   logoLabel?: string;
//   logoWidth?: number;
//   logoHeight?: number;
// }

// /**
//  * This component supports various CSS variables for theming. Here's a comprehensive list, along
//  * with their default values:
//  *
//  * ```css
//  * :root {
//  *   --footer-focus: hsl(var(--primary));
//  *   --footer-background: hsl(var(--background));
//  *   --footer-border-top: hsl(var(--contrast-100));
//  *   --footer-border-bottom: hsl(var(--primary));
//  *   --footer-contact-title: hsl(var(--contrast-300));
//  *   --footer-contact-text: hsl(var(--foreground));
//  *   --footer-social-icon: hsl(var(--contrast-400));
//  *   --footer-social-icon-hover: hsl(var(--foreground));
//  *   --footer-section-title: hsl(var(--foreground));
//  *   --footer-link: hsl(var(--contrast-400));
//  *   --footer-link-hover: hsl(var(--foreground));
//  *   --footer-copyright: hsl(var(--contrast-400));
//  * }
//  * ```
//  */
// export const Footer = forwardRef(function Footer(
//   {
//     logo,
//     sections: streamableSections,
//     contactTitle = 'Contact Us',
//     contactInformation: streamableContactInformation,
//     paymentIcons: streamablePaymentIcons,
//     socialMediaLinks: streamableSocialMediaLinks,
//     copyright: streamableCopyright,
//     className,
//     logoHref = '#',
//     logoLabel = 'Home',
//     logoWidth = 200,
//     logoHeight = 40,
//   }: Props,
//   ref: Ref<HTMLDivElement>,
// ) {
//   return (
//     <footer
//       className={clsx(
//         'border-b-4 border-t border-b-[var(--footer-border-bottom,hsl(var(--primary)))] border-t-[var(--footer-border-top,hsl(var(--contrast-100)))] bg-[var(--footer-background,hsl(var(--background)))] @container',
//         className,
//       )}
//       ref={ref}
//     >
     
//       <div className="mx-auto max-w-screen-2xl px-4 py-6 @xl:px-6 @xl:py-10 @4xl:px-8 @4xl:py-12">
//         <div className="flex flex-col justify-between gap-x-8 gap-y-12 @3xl:flex-row">
//           <div className="flex flex-col gap-4 @3xl:w-1/3 @3xl:gap-6">
//             {/* Logo Information */}
//             <Logo
//               height={logoHeight}
//               href={logoHref}
//               label={logoLabel}
//               logo={logo}
//               width={logoWidth}
//             />

//             {/* Contact Information */}
//             <Stream
//               fallback={
//                 <div className="mb-4 animate-pulse text-lg @lg:text-xl">
//                   <div className="flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
//                   </div>
//                   <div className="flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[15ch] rounded bg-contrast-100" />
//                   </div>
//                   <div className="flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[12ch] rounded bg-contrast-100" />
//                   </div>
//                 </div>
//               }
//               value={streamableContactInformation}
//             >
//               {(contactInformation) => {
//                 if (contactInformation?.address != null || contactInformation?.phone != null) {
//                   return (
//                     <div className="mb-4 text-lg font-medium @lg:text-xl">
//                       <h3 className="text-[var(--footer-contact-title,hsl(var(--contrast-300)))]">
//                         {contactTitle}
//                       </h3>
//                       <div className="text-[var(--footer-contact-text,hsl(var(--foreground)))]">
//                         {contactInformation.address != null &&
//                           contactInformation.address !== '' && <p>{contactInformation.address}</p>}
//                         {contactInformation.phone != null && contactInformation.phone !== '' && (
//                           <p>{contactInformation.phone}</p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 }
//               }}
//             </Stream>

//             {/* Social Media Links */}
//             <Stream
//               fallback={
//                 <div className="flex animate-pulse items-center gap-3">
//                   <div className="h-8 w-8 rounded-full bg-contrast-100" />
//                   <div className="h-8 w-8 rounded-full bg-contrast-100" />
//                   <div className="h-8 w-8 rounded-full bg-contrast-100" />
//                   <div className="h-8 w-8 rounded-full bg-contrast-100" />
//                 </div>
//               }
//               value={streamableSocialMediaLinks}
//             >
//               {(socialMediaLinks) => {
//                 if (socialMediaLinks != null) {
//                   return (
//                     <div className="flex items-center gap-3">
//                       {socialMediaLinks.map(({ href, icon }, i) => {
//                         return (
//                           <Link
//                             className="flex items-center justify-center rounded-lg fill-[var(--footer-social-icon,hsl(var(--contrast-400)))] p-1 ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 ease-out hover:fill-[var(--footer-social-icon-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
//                             href={href}
//                             key={i}
//                           >
//                             {icon}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   );
//                 }
//               }}
//             </Stream>
//           </div>

//           {/* Footer Columns of Links */}
//           <Stream
//             fallback={
//               <div className="grid w-full flex-1 animate-pulse gap-y-8 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] @xl:gap-y-10">
//                 <div className="pr-8">
//                   <div className="mb-3 flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
//                   </div>

//                   <ul>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="pr-8">
//                   <div className="mb-3 flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
//                   </div>

//                   <ul>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="pr-8">
//                   <div className="mb-3 flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
//                   </div>

//                   <ul>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="pr-8">
//                   <div className="mb-3 flex h-[1lh] items-center">
//                     <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
//                   </div>

//                   <ul>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                     <li className="py-2 text-sm">
//                       <div className="flex h-[1lh] items-center text-sm">
//                         <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
//                       </div>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             }
//             value={streamableSections}
//           >
//             {(sections) => {
//               if (sections.length > 0) {
//                 return (
//                   <div className="grid w-full flex-1 gap-y-8 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] @xl:gap-y-10">
//                     {sections.map(({ title, links }, i) => (
//                       <div className="pr-8" key={i}>
//                         {title != null && (
//                           <span className="mb-3 block font-semibold text-[var(--footer-section-title,hsl(var(--foreground)))]">
//                             {title}
//                           </span>
//                         )}

//                         <ul>
//                           {links.map((link, idx) => {
//                             return (
//                               <li key={idx}>
//                                 <Link
//                                   className="block rounded-lg py-2 text-sm font-medium text-[var(--footer-link,hsl(var(--contrast-400)))] ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 hover:text-[var(--footer-link-hover,hsl(var(--foreground)))] focus-visible:outline-0 focus-visible:ring-2"
//                                   href={link.href}
//                                 >
//                                   {link.label}
//                                 </Link>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       </div>
//                     ))}
//                   </div>
//                 );
//               }
//             }}
//           </Stream>
//         </div>

//         <div className="flex flex-col-reverse items-start gap-y-8 pt-16 @3xl:flex-row @3xl:items-center @3xl:pt-20">
//           {/* Copyright */}
//           <Stream
//             fallback={
//               <div className="flex h-[1lh] flex-1 animate-pulse items-center text-sm">
//                 <span className="h-[1ex] w-[40ch] rounded-sm bg-contrast-100" />
//               </div>
//             }
//             value={streamableCopyright}
//           >
//             {(copyright) => {
//               if (copyright != null) {
//                 return (
//                   <p className="flex-1 text-sm text-[var(--footer-copyright,hsl(var(--contrast-400)))]">
//                     {copyright}
//                   </p>
//                 );
//               }
//             }}
//           </Stream>

//           {/* Payment Icons */}
//           <Stream
//             fallback={
//               <div className="flex animate-pulse flex-wrap gap-2">
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//                 <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
//               </div>
//             }
//             value={streamablePaymentIcons}
//           >
//             {(paymentIcons) => {
//               if (paymentIcons != null) {
//                 return <div className="flex flex-wrap gap-2">{paymentIcons}</div>;
//               }
//             }}
//           </Stream>
//         </div>
//       </div>
//     </footer>
//   );
// });



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