
'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, ChevronDown, Menu, Search, SearchIcon, ShoppingBag, User, X } from 'lucide-react';
import React, {
  forwardRef,
  Ref,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductCard } from '@/vibes/soul/primitives/product-card';
import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

// Mobile Navigation Component
const MobileNavigation = ({
  logoHref = '/',
  logoLabel = 'Home',
  streamableLogo,
  cartHref,
  streamableCartCount,
  links
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (label: string) => {
    setOpenCategories(prev =>
      prev.includes(label)
        ? prev.filter(cat => cat !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-black text-white py-2">
        <div className="flex justify-between items-center px-4">
          <span className="text-sm">Sign in or Create account</span>
          <a href="tel:(970) 800-3173" className="text-sm font-bold">
            (970) 800-3173
          </a>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full bg-[#2b3238]">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Logo
            className="flex h-8"
            href={logoHref}
            label={logoLabel}
            logo={streamableLogo}
          />

          <div className="flex items-center gap-4">
            <button className="text-white">
              <Search size={20} />
            </button>
            <Link href={cartHref} className="text-white">
              <div className="relative">
                <ShoppingBag size={20} />
                <Stream value={streamableCartCount}>
                  {(count) => count != null && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#cc3333] text-xs text-white">
                      {count}
                    </span>
                  )}
                </Stream>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[104px] z-50 bg-white overflow-y-auto">
          <div className="flex flex-col divide-y">
            <Stream value={links}>
              {(navLinks) =>
                navLinks.map((link, index) => (
                  <div key={index} className="flex flex-col">
                    <button
                      onClick={() => toggleCategory(link.label)}
                      className="flex items-center justify-between px-6 py-4 text-lg font-medium hover:bg-gray-50"
                    >
                      {link.label}
                      <ChevronDown
                        className={clsx(
                          "transition-transform",
                          openCategories.includes(link.label) ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {openCategories.includes(link.label) && link.groups?.map((group, groupIndex) => (
                      <div key={groupIndex} className="bg-gray-50">
                        {group.label && (
                          <div className="px-8 py-2 text-sm font-semibold text-gray-900">
                            {group.label}
                          </div>
                        )}
                        {group.links.map((subLink, linkIndex) => (
                          <Link
                            key={linkIndex}
                            href={subLink.href}
                            className="block px-8 py-3 text-sm text-gray-600 hover:bg-gray-100"
                          >
                            {subLink.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              }
            </Stream>
            <Link href="/customer-gallery" className="px-6 py-4 text-lg hover:bg-gray-50">
              Customer Gallery
            </Link>
            <Link href="/videos" className="px-6 py-4 text-lg hover:bg-gray-50">
              Videos
            </Link>
            <Link href="/blog" className="px-6 py-4 text-lg hover:bg-gray-50">
              Blog
            </Link>
            <Link href="/shipping" className="px-6 py-4 text-lg hover:bg-gray-50">
              Shipping & Returns
            </Link>
            <Link href="/contact" className="px-6 py-4 text-lg hover:bg-gray-50">
              Contact Us
            </Link>
          </div>
        </div>
      )}

      {/* Featured Categories Grid when menu is closed */}
      
      
    </div>
  );
};

// Desktop Navigation Component
const DesktopNavigation = forwardRef(function DesktopNavigation<S extends SearchResult>({
  className,
  isFloating = false,
  cartHref,
  cartCount: streamableCartCount,
  accountHref,
  links: streamableLinks,
  logo: streamableLogo,
  logoHref = '/',
  logoLabel = 'Home',
  logoWidth = 200,
  logoHeight = 40,
  mobileLogo: streamableMobileLogo,
  mobileLogoWidth = 100,
  mobileLogoHeight = 40,
  linksPosition = 'center',
  searchHref,
  searchParamName = 'query',
  searchAction,
  searchCtaLabel,
  searchInputPlaceholder,
  cartLabel = 'Cart',
  accountLabel = 'Profile',
  openSearchPopupLabel = 'Open search popup',
  searchLabel = 'Search',
}: Props<S>, ref: Ref<HTMLDivElement>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSearchOpen(false);
  }, [pathname]);

  const categoryButtons = [
    {
      label: "Colored Diamond Plate Sheets",
      href: "/colored-diamond-plate",
      groups: [
        {
          links: [
            { label: "Red Diamond Plate", href: "/red-diamond-plate" },
            { label: "Blue Diamond Plate", href: "/blue-diamond-plate" },
            { label: "Black Diamond Plate", href: "/black-diamond-plate" }
          ]
        }
      ]
    },
    {
      label: "Diamond Plate Material Descriptions",
      href: "/diamond-plate-material",
      groups: [
        {
          links: [
            { label: "Aluminum Diamond Plate", href: "/aluminum-diamond-plate" },
            { label: "Steel Diamond Plate", href: "/steel-diamond-plate" }
          ]
        }
      ]
    },
    {
      label: "Diamond Plate Sheets",
      href: "/diamond-plate-sheets",
      groups: [
        {
          links: [
            { label: "4x8 Sheets", href: "/4x8-sheets" },
            { label: "4x10 Sheets", href: "/4x10-sheets" }
          ]
        }
      ]
    },
    {
      label: "Diamond Plate Sticker",
      href: "/diamond-plate-sticker",
      groups: [
        {
          links: [
            { label: "Chrome Sticker", href: "/chrome-sticker" },
            { label: "Colored Sticker", href: "/colored-sticker" }
          ]
        }
      ]
    },
    {
      label: "Diamond Plate Trim & Accents",
      href: "/diamond-plate-trim",
      groups: [
        {
          links: [
            { label: "Corner Guards", href: "/corner-guards" },
            { label: "Diamond Plate Trim", href: "/trim" }
          ]
        }
      ]
    }
  ];

  return (
    <NavigationMenu.Root
      className={clsx('relative mx-auto w-full @container', className)}
      delayDuration={0}
      onValueChange={() => setIsSearchOpen(false)}
      ref={ref}
    >
      {/* Top Section with improved search and phone number */}
<div className="bg-black text-white py-2">
  <div className="container mx-auto flex justify-between items-center px-24">
    <div className="relative">
      {searchAction ? (
        <Popover.Root onOpenChange={setIsSearchOpen} open={isSearchOpen}>
          <Popover.Trigger asChild>
            <button
              aria-label={openSearchPopupLabel}
              className="flex items-center gap-2 bg-white rounded-md px-4 py-2 text-black hover:bg-gray-50"
            >
              <Search size={20} strokeWidth={1.5} />
              <span className="hidden md:block">Search products...</span>
            </button>
          </Popover.Trigger>
          <Popover.Content className="w-screen max-w-xl transform -translate-x-1/2 left-1/2 absolute z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200">
              <SearchForm
                searchAction={searchAction}
                searchCtaLabel={searchCtaLabel}
                searchHref={searchHref}
                searchInputPlaceholder={searchInputPlaceholder}
                searchParamName={searchParamName}
              />
            </div>
          </Popover.Content>
        </Popover.Root>
      ) : (
        <Link 
          aria-label={searchLabel} 
          className="flex items-center gap-2 bg-white rounded-md px-4 py-2 text-black hover:bg-gray-50" 
          href={searchHref}
        >
          <Search size={20} strokeWidth={1.5} />
          <span className="hidden md:block">Search products...</span>
        </Link>
      )}
    </div>
    
    <div className="flex items-center gap-6">
      <span className="text-sm">Sign in or Create an account</span>
      <Link href={accountHref} className="flex items-center gap-1 text-sm hover:text-gray-300">
        <User size={16} />
        <span>My Account</span>
      </Link>
      <span className="text-sm hover:text-gray-300 cursor-pointer">My Favorites</span>
      <div className="flex items-center gap-2">
        
      <a 
        href="tel:(970) 800-3173" 
        className="bg-[#bc0000] hover:bg-[#a00000] text-white font-bold py-1.5 px-4 inline-flex items-center gap-2 transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-4 h-4"
        >
          <path d="M19.95 21q-3.125 0-6.175-1.363t-5.55-3.862q-2.5-2.5-3.862-5.55T3 4.05q0-.45.3-.75t.75-.3H8.1q.35 0 .625.225t.325.575l.65 3.5q.05.35-.013.638T9.4 8.45L6.975 10.9q.5.925 1.187 1.787t1.513 1.663q.775.775 1.625 1.438T13.1 17l2.35-2.35q.225-.225.588-.337t.712-.063l3.45.7q.35.075.575.337t.225.613v4.05q0 .45-.3.75t-.75.3Z"/>
        </svg>
        (970) 800-3173
      </a>
      </div>
    </div>
  </div>
</div>

      {/* Middle Section with Logo and Shipping Info */}
<div className="bg-[#2b3238] py-4">
  <div className="container mx-auto flex justify-between items-center px-24">
    {/* Logo Section */}
    <div className="flex-shrink-0">
      <Logo
        className={clsx(streamableMobileLogo != null ? 'hidden @4xl:flex' : 'flex')}
        height={logoHeight}
        href={logoHref}
        label={logoLabel}
        logo={streamableLogo}
        width={logoWidth}
      />
      {streamableMobileLogo != null && (
        <Logo
          className="flex @4xl:hidden"
          height={mobileLogoHeight}
          href={logoHref}
          label={logoLabel}
          logo={streamableMobileLogo}
          width={mobileLogoWidth}
        />
      )}
    </div>

    {/* Shipping Info Section */}
    <div className="flex items-center gap-16">
      {/* Free Hat Offer */}
      <div className="flex items-center gap-3">
        <div className="text-[#cc3333]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
            <path d="M13 7h-2v6h6v-2h-4z"/>
          </svg>
        </div>
        <div className="text-white">
          <p className="text-sm font-medium">Free hat with</p>
          <p className="text-sm font-medium">orders over $750</p>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="flex items-center gap-3">
        <div className="text-[#cc3333]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
        <div className="text-white">
          <p className="text-sm font-medium">Order by midnight & receive</p>
          <p className="text-sm font-medium">your order in 3-10 business days!</p>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Bottom Section with Categories */}
      <div className="bg-gray-200 py-2">
        <div className="container mx-auto flex justify-between items-center px-24">
          <div className="flex items-center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger className="flex items-center gap-2 bg-[#cc3333] px-6 py-2.5 text-white transition-colors hover:bg-red-600">
                Shop Now
                <ChevronDown size={16} />
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[220px] rounded-xl bg-white p-2 shadow-xl"
                  sideOffset={5}
                >

                  <Stream value={streamableLinks}>
                    {(links) => links.map((category, index) => (
                      <DropdownMenu.Sub key={index}>
                        <DropdownMenu.SubTrigger
                          className="flex w-full items-center justify-between rounded-lg p-2.5 text-sm font-medium hover:bg-gray-100"
                        >
                          <Link
                            href={category.href}
                            className="flex-1 text-left"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {category.label}
                          </Link>
                          <ChevronDown className="h-4 w-4" />
                        </DropdownMenu.SubTrigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.SubContent
                            className="min-w-[220px] rounded-xl bg-white p-2 shadow-xl"
                            alignOffset={-5}
                          >
                            {category.groups?.map((group, groupIndex) => (
                              <div key={groupIndex} className="py-1">
                                {group.label && group.href ? (
                                  <Link
                                    href={group.href}
                                    className="block px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded-lg"
                                  >
                                    {group.label}
                                  </Link>
                                ) : group.label ? (
                                  <div className="px-3 py-2 text-sm font-semibold text-gray-900">
                                    {group.label}
                                  </div>
                                ) : null}

                                {group.links.map((link, linkIndex) => (
                                  <DropdownMenu.Item
                                    key={linkIndex}
                                    className="rounded-lg text-gray-700 hover:bg-gray-100"
                                    asChild
                                  >
                                    <Link
                                      href={link.href}
                                      className="block w-full px-3 py-2 text-sm"
                                    >
                                      {link.label}
                                    </Link>
                                  </DropdownMenu.Item>
                                ))}
                              </div>
                            ))}
                          </DropdownMenu.SubContent>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Sub>
                    ))}
                  </Stream>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <nav className="hidden @4xl:flex gap-6">
            <p className="">Popular:</p>
            <Link href="#" className="hover:text-[#c4302b]">About Us</Link>
            <Link href="/customer-gallery/" className="hover:text-[#c4302b]">Customer Gallery</Link>
            <Link href="#" className="hover:text-[#c4302b]">Safe Shopping</Link>
            <Link href="#" className="hover:text-[#c4302b]">Videos</Link>
            <Link href="#" className="hover:text-[#c4302b]">Blog</Link>
            <Link href="#" className="hover:text-[#c4302b]">Shipping & Returns</Link>
            <Link href="#" className="hover:text-[#c4302b]">Contact Us</Link>
          </nav>

          <Link href={cartHref} className="flex items-center gap-2 bg-[#c4302b] text-white px-4 py-2 rounded">
            <ShoppingBag size={20} />
            <span>My Cart</span>
            <Stream value={streamableCartCount}>
              {(count) => count != null && `(${count})`}
            </Stream>
          </Link>
        </div>
      </div>
    </NavigationMenu.Root>
  );
});

DesktopNavigation.displayName = 'DesktopNavigation';

// Export the combined Navigation component
export const Navigation = forwardRef(function Navigation({
  className,
  cartHref,
  cartCount: streamableCartCount,
  links: streamableLinks,
  logo: streamableLogo,
  logoHref,
  logoLabel,
  ...props
}, ref) {
  return (
    <>
      {/* Mobile Navigation (hidden on larger screens) */}
      <div className="block md:hidden">
        <MobileNavigation
          logoHref={logoHref}
          logoLabel={logoLabel}
          streamableLogo={streamableLogo}
          cartHref={cartHref}
          streamableCartCount={streamableCartCount}
          links={streamableLinks}
        />
      </div>

      {/* Desktop Navigation (hidden on mobile) */}
      <div className="hidden md:block">
        <DesktopNavigation
          className={className}
          cartHref={cartHref}
          cartCount={streamableCartCount}
          links={streamableLinks}
          logo={streamableLogo}
          logoHref={logoHref}
          logoLabel={logoLabel}
          {...props}
          ref={ref}
        />
      </div>
    </>
  );
});

Navigation.displayName = 'Navigation';


function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search Products',
  searchCtaLabel = 'View more',
  submitLabel = 'Submit',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref?: string;
  searchCtaLabel?: string;
  searchInputPlaceholder?: string;
  submitLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(searchAction, {
      searchResults: null,
      lastResult: null,
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isPending = isSearching || isDebouncing || isSubmitting;

  const debouncedOnChange = useMemo(() => {
    const debounced = debounce((q: string) => {
      setIsDebouncing(false);
      const formData = new FormData();
      formData.append(searchParamName, q);
      startSearching(() => {
        formAction(formData);
      });
    }, 300);

    return (q: string) => {
      setIsDebouncing(true);
      debounced(q);
    };
  }, [formAction, searchParamName]);

  const [form] = useForm({ lastResult });

  const handleSubmit = useCallback(() => {
    setIsSubmitting(true);
  }, []);

  return (
    <>
      <form
        action={searchHref}
        className="flex items-center gap-3 px-3 py-3 @4xl:px-5 @4xl:py-4"
        onSubmit={handleSubmit}
      >
        <SearchIcon
          className="hidden shrink-0 text-gray-400 @xl:block"
          size={20}
          strokeWidth={1}
        />
        <input
          className="flex-grow bg-transparent pl-2 text-lg font-medium outline-0 placeholder:text-gray-400 focus-visible:outline-none @xl:pl-0"
          name={searchParamName}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            debouncedOnChange(e.currentTarget.value);
          }}
          placeholder={searchInputPlaceholder}
          type="text"
          value={query}
        />
        <Button
          loading={isPending}
          shape="circle"
          size="small"
          type="submit"
          variant="secondary"
        >
          <ArrowRight aria-label={submitLabel} size={20} strokeWidth={1.5} />
        </Button>
      </form>

      <SearchResults
        emptySearchSubtitle={emptyStateSubtitle}
        emptySearchTitle={emptyStateTitle}
        errors={form.errors}
        query={query}
        searchCtaLabel={searchCtaLabel}
        searchParamName={searchParamName}
        searchResults={searchResults}
        stale={isPending}
      />
    </>
  );
}

// SearchResults Component
function SearchResults({
  query,
  searchResults,
  stale,
  searchParamName,
  searchCtaLabel,
  emptySearchTitle = `No results were found for '${query}'`,
  emptySearchSubtitle = 'Please try another search.',
  errors,
}: {
  query: string;
  searchParamName: string;
  searchCtaLabel?: string;
  emptySearchTitle?: string;
  emptySearchSubtitle?: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  errors?: string[];
}) {
  if (query === '') return null;

  if (errors != null && errors.length > 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-gray-100 p-6">
        {errors.map((error) => (
          <FormStatus key={error} type="error">
            {error}
          </FormStatus>
        ))}
      </div>
    );
  }

  if (searchResults == null || searchResults.length === 0) {
    if (stale) return null;

    return (
      <div className="flex flex-col border-t border-gray-100 p-6">
        <p className="text-2xl font-medium text-gray-900">{emptySearchTitle}</p>
        <p className="text-gray-500">{emptySearchSubtitle}</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-1 flex-col overflow-y-auto border-t border-gray-100 @2xl:flex-row',
        stale && 'opacity-50',
      )}
    >
      {searchResults.map((result, index) => {
        switch (result.type) {
          case 'links': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-1 border-b border-gray-100 p-5 @2xl:max-w-80 @2xl:border-b-0 @2xl:border-r"
                key={`result-${index}`}
              >
                <h3 className="mb-4 font-mono text-sm uppercase text-gray-900">
                  {result.title}
                </h3>
                <ul role="listbox">
                  {result.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        className="block rounded-lg px-3 py-4 font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          case 'products': {
            return (
              <section
                aria-label={result.title}
                className="flex w-full flex-col gap-5 p-5"
                key={`result-${index}`}
              >
                <h3 className="font-mono text-sm uppercase text-gray-900">
                  {result.title}
                </h3>
                <ul
                  className="grid w-full grid-cols-2 gap-5 @xl:grid-cols-4 @2xl:grid-cols-2 @4xl:grid-cols-4"
                  role="listbox"
                >
                  {result.products.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        imageSizes="(min-width: 42rem) 25vw, 50vw"
                        product={{
                          id: product.id,
                          title: product.title,
                          href: product.href,
                          price: product.price,
                          image: product.image,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

// Constants and Types
const navButtonClassName = 'relative rounded-lg p-2 outline-0 ring-[var(--nav-focus,hsl(var(--primary)))] transition-colors hover:bg-[var(--nav-button-background-hover,hsl(var(--contrast-100)))] focus-visible:ring-2';

export type SearchResult =
  | {
    type: 'products';
    title: string;
    products: Array<{
      id: string;
      title: string;
      href: string;
      price?: Price;
      image?: { src: string; alt: string };
    }>;
  }
  | {
    type: 'links';
    title: string;
    links: Array<{ label: string; href: string }>;
  };

interface Props<S extends SearchResult> {
  className?: string;
  isFloating?: boolean;
  accountHref: string;
  cartCount?: Streamable<number | null>;
  cartHref: string;
  links: Streamable<Link[]>;
  linksPosition?: 'center' | 'left' | 'right';
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoWidth?: number;
  logoHeight?: number;
  logoHref?: string;
  logoLabel?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  mobileLogoWidth?: number;
  mobileLogoHeight?: number;
  searchHref: string;
  searchParamName?: string;
  searchAction?: SearchAction<S>;
  searchCtaLabel?: string;
  searchInputPlaceholder?: string;
  cartLabel?: string;
  accountLabel?: string;
  openSearchPopupLabel?: string;
  searchLabel?: string;
  mobileMenuTriggerLabel?: string;
}

interface Link {
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Awaited<Payload>,
) => State | Promise<State>;

type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;

export default Navigation;