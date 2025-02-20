'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Popover from '@radix-ui/react-popover';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ArrowRight, ChevronDown, ChevronRight, Search, User, ShoppingBag } from 'lucide-react';
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
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Button } from '@/vibes/soul/primitives/button';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Price } from '@/vibes/soul/primitives/price-label';
import { ProductCard } from '@/vibes/soul/primitives/product-card';
import { Link } from '~/components/link';
import { usePathname } from '~/i18n/routing';

// Static menu items
const STATIC_MENU_ITEMS = [
  { label: 'About Us', href: '/about' }, 
  { label: 'Customer Gallery', href: '/customer-gallery' },
  { label: 'Safe Shopping', href: '/safe-shopping' },
  { label: 'Videos', href: '/videos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Shipping & returns', href: '/shipping-returns' },
  { label: 'Contact Us', href: '/contact' },
];

// Reuse existing types from original code
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

type LocaleAction = Action<SubmissionResult | null, FormData>;
type CurrencyAction = Action<SubmissionResult | null, FormData>;
type SearchAction<S extends SearchResult> = Action<
  {
    searchResults: S[] | null;
    lastResult: SubmissionResult | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  FormData
>;


interface Props<S extends SearchResult> {
  className?: string;
  isFloating?: boolean;
  accountHref: string;
  cartCount?: Streamable<number | null>;
  cartHref: string;
  links: Streamable<Link[]>;
  linksPosition?: 'center' | 'left' | 'right';
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
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoWidth?: number;
  logoHeight?: number;
  logoHref?: string;
  logoLabel?: string;
  mobileLogo?: Streamable<string | { src: string; alt: string } | null>;
  mobileLogoWidth?: number;
  mobileLogoHeight?: number;
}

// Utility Component for Category Dropdown Item
const CategoryMenuItem = ({ item, onSelect }: { item: Link; onSelect?: (href: string) => void }) => {
  if (item.groups && item.groups.length > 0) {
    return (
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm text-gray-900 hover:bg-gray-100">
          {item.href ? (
            <Link href={item.href} className="flex-1">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          <ChevronRight className="h-4 w-4" />
        </DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <div className="relative z-[100]">
            <DropdownMenu.SubContent
              className="min-w-[200px] rounded-md bg-white p-1 shadow-lg"
              sideOffset={-5}
              alignOffset={-4}
            >
              {item.groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {group.label && (
                    <div className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
                      {group.href ? (
                        <Link href={group.href} className="hover:text-gray-700">
                          {group.label}
                        </Link>
                      ) : (
                        group.label
                      )}
                    </div>
                  )}
                  {group.links?.map((link, linkIndex) => (
                    <DropdownMenu.Item
                      key={linkIndex}
                      className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onSelect={(event) => {
                        event.preventDefault();
                        onSelect?.(link.href);
                      }}
                    >
                      <Link href={link.href} className="block w-full">
                        {link.label}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </div>
              ))}
            </DropdownMenu.SubContent>
          </div>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    );
  }

  return (
    <DropdownMenu.Item 
      className="rounded-md px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
      onSelect={(event) => {
        event.preventDefault();
        onSelect?.(item.href);
      }}
    >
      <Link href={item.href} className="block w-full">
        {item.label}
      </Link>
    </DropdownMenu.Item>
  );
};

// SearchForm Component
function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref,
  searchInputPlaceholder = 'Search products...',
  searchCtaLabel = 'View all results',
}: {
  searchAction: SearchAction<S>;
  searchParamName?: string;
  searchHref: string;
  searchInputPlaceholder?: string;
  searchCtaLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult }, formAction] = useActionState(searchAction, {
    searchResults: null,
    lastResult: null,
  });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isPending = isSearching || isDebouncing;

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

  return (
    <div className="p-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedOnChange(e.target.value);
          }}
          placeholder={searchInputPlaceholder}
          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2"
        />
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
          size={20} 
        />
      </div>

      <SearchResults
        query={query}
        searchParamName={searchParamName}
        searchCtaLabel={searchCtaLabel}
        searchResults={searchResults}
        stale={isPending}
        errors={form.errors}
      />
    </div>
  );
}

// SearchResults Component
function SearchResults({
  query,
  searchResults,
  stale,
  errors,
  searchParamName,
  searchCtaLabel,
}: {
  query: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  errors?: string[];
  searchParamName: string;
  searchCtaLabel?: string;
}) {
  if (query === '') return null;

  if (errors?.length) {
    if (stale) return null;
    return (
      <div className="flex flex-col border-t border-gray-200 p-6">
        {errors.map((error) => (
          <FormStatus key={error} type="error">
            {error}
          </FormStatus>
        ))}
      </div>
    );
  }

  if (!searchResults?.length) {
    if (stale) return null;
    return (
      <div className="flex flex-col border-t border-gray-200 p-6">
        <p className="text-2xl font-medium text-gray-900">No results were found for '{query}'</p>
        <p className="text-gray-500">Please try another search.</p>
      </div>
    );
  }

  return (
   // Original structure maintained, only CSS modified
<div className={clsx(
  'flex flex-col space-y-6 border-t border-gray-200 md:flex-row md:space-y-0 w-full',
  stale && 'opacity-50'
)}>
  {searchResults.map((result, index) => (
    <div key={index} className="p-4 flex-1">
      <h3 className="mb-6 text-sm font-semibold uppercase">
        {result.title}
      </h3>
      {result.type === 'products' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-2">
          {result.products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageSizes="(min-width: 1024px) 25vw, 50vw"
            />
          ))}
        </div>
      
  
          ) : (
            <ul className="space-y-2">
              {result.links?.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// Main Navigation Component
export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  {
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
    searchHref,
    searchParamName = 'query',
    searchAction,
    searchCtaLabel,
    searchInputPlaceholder,
    cartLabel = 'Cart',
    accountLabel = 'Profile',
    openSearchPopupLabel = 'Open search popup',
    searchLabel = 'Search',
    mobileMenuTriggerLabel = 'Toggle navigation',
  }: Props<S>,
  ref: Ref<HTMLDivElement>,
) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <div>
      {/* Promo Banner */}
      <div className="w-full bg-gradient-to-r from-gray-900 to-black">
        <div className="mx-auto flex max-w-7xl">
          <div className="flex w-1/2 items-center justify-center py-2 px-4">
            <div className="flex items-center space-x-2">
            <img
        src="https://cdn2.bigcommerce.com/n-ww20x/ghm4gd08/templates/__custom/img/cap.png?t=1501592050" 
        alt="Menu icon"
        className="h-6 w-6 text-red-600"
      />
              <span className="text-sm font-medium text-white">
                Free hat with orders over $750
              </span>
            </div>
          </div>
          
          <div className="flex w-1/2 items-center justify-center border-l border-gray-700 py-2 px-4">
            <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24">
  <path
    d="M12 2C12 2 8 6 8 13C8 15 9 17.5 10 19.5C10.5 20.5 11 21.5 11.5 22L12 22.5L12.5 22C13 21.5 13.5 20.5 14 19.5C15 17.5 16 15 16 13C16 6 12 2 12 2Z"
    fill="#dc2626"
    stroke="#b91c1c"
    stroke-width="1"
  />
  <circle
    cx="12"
    cy="10"
    r="2"
    fill="#f8fafc"
    stroke="#b91c1c"
    stroke-width="0.5"
  />
  <path
    d="M8 13C8 13 4 15 3 19.5L7 17.5C7.5 16.5 8 15 8 13Z"
    fill="#dc2626"
    stroke="#b91c1c"
    stroke-width="1"
  />
  <path
    d="M16 13C16 13 20 15 21 19.5L17 17.5C16.5 16.5 16 15 16 13Z"
    fill="#dc2626"
    stroke="#b91c1c"
    stroke-width="1"
  />
  <path
    d="M10.5 19.5C10.5 19.5 9 20.5 9.5 22C10 21 10.5 20 10.5 19.5Z"
    fill="#f59e0b"
  />
  <path
    d="M13.5 19.5C13.5 19.5 15 20.5 14.5 22C14 21 13.5 20 13.5 19.5Z"
    fill="#f59e0b"
  />
</svg>
              <span className="text-sm font-medium text-white">
                Order by midnight & receive your order in 3-10 business days!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div 
        className={clsx(
          'relative w-full bg-black',
          isFloating && 'shadow-lg',
          className
        )}
        ref={ref}
      >
        <div className="mx-auto max-w-[85rem] sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section with Logo and Shop Now dropdown */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center">
                <Logo
                  className={clsx(streamableMobileLogo != null ? 'hidden md:flex' : 'flex')}
                  height={logoHeight}
                  href={logoHref}
                  label={logoLabel}
                  logo={streamableLogo}
                  width={logoWidth}
                />
                {streamableMobileLogo != null && (
                  <Logo
                    className="flex md:hidden"
                    height={mobileLogoHeight}
                    href={logoHref}
                    label={logoLabel}
                    logo={streamableMobileLogo}
                    width={mobileLogoWidth}
                  />
                )}
              </div>

              {/* Shop Now Dropdown - Hidden on mobile */}
              <div className="hidden md:block">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                    Shop Now
                    <ChevronDown size={16} />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="relative z-50 min-w-[250px] rounded-lg bg-white p-2 shadow-xl" 
                      sideOffset={5}
                    >
                      <Stream value={streamableLinks}>
                        {(links) => (
                          <div className="grid grid-cols-1 gap-1">
                            {Array.isArray(links) && links.map((item, index) => (
                              <CategoryMenuItem 
                                key={index} 
                                item={item} 
                                onSelect={(href) => {
                                  // You might want to replace this with your routing logic
                                  window.location.href = href;
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </Stream>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              {/* Static Menu Items */}
              <div className="hidden md:flex space-x-8">
                {STATIC_MENU_ITEMS.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="text-white hover:text-gray-200 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right section - Icons */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Popover.Root open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <Popover.Trigger asChild>
                  <button 
                    className="p-2 text-white hover:text-gray-200"
                    aria-label={openSearchPopupLabel}
                  >
                    <Search size={20} />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content 
                    className="z-50 w-screen  rounded-lg bg-white shadow-xl"
                    sideOffset={5}
                  >
                    {searchAction && (
                      <SearchForm
                        searchAction={searchAction}         
                        searchCtaLabel={searchCtaLabel}
                        searchHref={searchHref}
                        searchInputPlaceholder={searchInputPlaceholder}
                        searchParamName={searchParamName}
                      />
                    )}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              {/* Account */}
              <Link 
                href={accountHref}
                className="p-2 text-white hover:text-gray-200"
                aria-label={accountLabel}
              >
                <User size={20} />
              </Link>

              {/* Cart */}
              <Link 
                href={cartHref}
                className="p-2 text-white hover:text-gray-200 relative"
                aria-label={cartLabel}
              >
                <ShoppingBag size={20} />
                <Stream value={streamableCartCount}>
                  {(count) =>
                    count != null && count > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {count}
                      </span>
                    )
                  }
                </Stream>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-white hover:text-gray-200"
                aria-expanded={isMobileMenuOpen}
                aria-label={mobileMenuTriggerLabel}
              >
                <div className="space-y-1.5">
                  <span className={clsx(
                    'block h-0.5 w-6 bg-current transform transition duration-200',
                    isMobileMenuOpen && 'rotate-45 translate-y-2'
                  )} />
                  <span className={clsx(
                    'block h-0.5 w-6 bg-current transition duration-200',
                    isMobileMenuOpen && 'opacity-0'
                  )} />
                  <span className={clsx(
                    'block h-0.5 w-6 bg-current transform transition duration-200',
                    isMobileMenuOpen && '-rotate-45 -translate-y-2'
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute inset-x-0 top-full bg-white shadow-lg md:hidden z-50">
            <div className="divide-y divide-gray-200">
              {/* Static Menu Items */}
              <div className="px-2 py-3">
                {STATIC_MENU_ITEMS.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <Stream value={streamableLinks}>
                {(links) => (
                  <div className="py-3">
                    {Array.isArray(links) && links.map((item, index) => (
                      <MobileMenuItem key={index} item={item} />
                    ))}
                  </div>
                )}
              </Stream>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Navigation.displayName = 'Navigation';

// Mobile Menu Item Component
const MobileMenuItem = ({ item }: { item: Link }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border-b border-gray-200 last:border-0">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex-1">
          {item.href ? (
            <Link
              href={item.href}
              className="text-base font-medium text-gray-900"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-base font-medium text-gray-900">
              {item.label}
            </span>
          )}
        </div>
        {item.groups?.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500"
            aria-expanded={isExpanded}
          >
            <ChevronDown
              className={clsx(
                'h-5 w-5 transform transition-transform duration-200',
                isExpanded ? 'rotate-180' : ''
              )}
            />
          </button>
        )}
      </div>
      
      {isExpanded && item.groups?.length > 0 && (
        <div className="bg-gray-50 px-3 py-2">
          {item.groups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4 last:mb-0">
              {group.label && (
                <div className="mb-2">
                  {group.href ? (
                    <Link
                      href={group.href}
                      className="text-sm font-semibold text-gray-900"
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">
                      {group.label}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-2">
                {group.links?.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="block text-sm text-gray-700 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export type { Link, Props as NavigationProps, SearchResult };
export default Navigation;