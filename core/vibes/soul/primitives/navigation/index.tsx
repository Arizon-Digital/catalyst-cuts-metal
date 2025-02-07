
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
import { useRouter } from 'next/navigation';

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
  { label: 'Contact Us', href: '/contact' },
  { label: 'Customer Gallery', href: '/customer-gallery' },
  { label: 'Safe Shopping', href: '/safe-shopping' },
  { label: 'Videos', href: '/videos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
];

// Types
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

interface Locale {
  id: string;
  label: string;
}

interface Currency {
  id: string;
  label: string;
}

type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Awaited<Payload>,
) => State | Promise<State>;

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
  locales?: Locale[];
  activeLocaleId?: string;
  localeAction?: LocaleAction;
  currencies?: Currency[];
  activeCurrencyId?: string;
  currencyAction?: CurrencyAction;
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
}// CategoryMenuItem Component
const CategoryMenuItem = ({ item, onSelect }) => {
  if (item.groups && item.groups.length > 0) {
    return (
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm text-gray-900 hover:bg-gray-100">
          <span>{item.label}</span>
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
                      {group.label}
                    </div>
                  )}
                  {group.links?.map((link, linkIndex) => (
                    <DropdownMenu.Item
                      key={linkIndex}
                      className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onSelect={(event) => {
                        event.preventDefault();
                        onSelect && onSelect(link.href);
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
        onSelect && onSelect(item.href);
      }}
    >
      <Link href={item.href} className="block w-full">
        {item.label}
      </Link>
    </DropdownMenu.Item>
  );
};

// Search Results Component
function SearchResults({
  query,
  searchResults,
  stale,
  emptySearchTitle = `No results were found for '${query}'`,
  emptySearchSubtitle = 'Please try another search.',
  errors,
  searchCtaLabel,
  searchParamName,
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
        <p className="text-2xl font-medium text-gray-900">{emptySearchTitle}</p>
        <p className="text-gray-500">{emptySearchSubtitle}</p>
      </div>
    );
  }

  return (
    <div className={clsx(
      'flex flex-col border-t border-gray-200 md:flex-row',
      stale && 'opacity-50'
    )}>
      {searchResults.map((result, index) => (
        <div key={index} className="p-4">
          <h3 className="mb-4 text-sm font-semibold uppercase">
            {result.title}
          </h3>
          {result.type === 'products' ? (
            <div className="grid grid-cols-2 gap-4">
              {result.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageSizes="(min-width: 1024px) 25vw, 50vw"
                />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {result.links.map((link, i) => (
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

// Submit Button Component
function SubmitButton({ loading, submitLabel }: { loading: boolean; submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      loading={pending || loading}
      shape="circle"
      size="small"
      type="submit"
      variant="secondary"
    >
      <ArrowRight aria-label={submitLabel} size={20} strokeWidth={1.5} />
    </Button>
  );
}

// Search Form Component
function SearchForm<S extends SearchResult>({
  searchAction,
  searchParamName = 'query',
  searchHref = '/search',
  searchInputPlaceholder = 'Search products...',
  searchCtaLabel = 'View all results',
  submitLabel = 'Search',
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
  const [{ searchResults, lastResult }, formAction] = useActionState(searchAction, {
    searchResults: null,
    lastResult: null,
  });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isPending = isSearching || isDebouncing;

  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        setIsDebouncing(false);
        const formData = new FormData();
        formData.append(searchParamName, searchQuery);
        startSearching(() => {
          formAction(formData);
        });
      }, 300),
    [formAction, searchParamName]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsDebouncing(true);
    debouncedSearch(value);
  };

  return (
    <div className="p-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
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
        searchResults={searchResults}
        stale={isPending}
        searchCtaLabel={searchCtaLabel}
        searchParamName={searchParamName}
      />
    </div>
  );
}
// Main Navigation Component Continued
export const Navigation = forwardRef(function Navigation<S extends SearchResult>(
  props: Props<S>,
  ref: Ref<HTMLDivElement>
) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLinkSelect = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <div 
      className={clsx(
        'relative w-full bg-black',
        props.isFloating && 'shadow-lg',
        props.className
      )}
      ref={ref}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section with Logo, Shop Now, and static menu */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center">
              <Logo
                className={clsx(props.mobileLogo != null ? 'hidden md:flex' : 'flex')}
                height={props.logoHeight}
                href={props.logoHref}
                label={props.logoLabel}
                logo={props.logo}
                width={props.logoWidth}
              />
              {props.mobileLogo != null && (
                <Logo
                  className="flex md:hidden"
                  height={props.mobileLogoHeight}
                  href={props.logoHref}
                  label={props.logoLabel}
                  logo={props.mobileLogo}
                  width={props.mobileLogoWidth}
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
                    <Stream value={props.links}>
                      {(links) => (
                        <div className="grid grid-cols-1 gap-1">
                          {Array.isArray(links) && links.map((item, index) => (
                            <CategoryMenuItem 
                              key={index} 
                              item={item} 
                              onSelect={handleLinkSelect}
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
                  className="text-white hover:text-white text-sm font-medium"
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
                  className="p-2 text-white hover:text-white"
                  aria-label={props.openSearchPopupLabel}
                >
                  <Search size={20} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content 
                  className="z-50 w-screen max-w-xl rounded-lg bg-white shadow-xl"
                  sideOffset={5}
                >
                  {props.searchAction && (
                    <SearchForm
                      searchAction={props.searchAction}
                      searchCtaLabel={props.searchCtaLabel}
                      searchHref={props.searchHref}
                      searchInputPlaceholder={props.searchInputPlaceholder}
                      searchParamName={props.searchParamName}
                    />
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Account */}
            <Link 
              href={props.accountHref}
              className="p-2 text-white hover:text-white"
              aria-label={props.accountLabel}
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link 
              href={props.cartHref}
              className="p-2 text-white hover:text-white relative"
              aria-label={props.cartLabel}
            >
              <ShoppingBag size={20} />
              <Stream value={props.cartCount}>
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
              className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded={isMobileMenuOpen}
              aria-label={props.mobileMenuTriggerLabel}
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
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Static Menu Items */}
            {STATIC_MENU_ITEMS.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}

            {/* Categories */}
            <Stream value={props.links}>
              {(links) => (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {Array.isArray(links) && links.map((item, index) => (
                    <div key={index} className="space-y-4">
                      <div className="px-3">
                        <Link
                          href={item.href || '#'}
                          className="text-base font-medium text-gray-900"
                        >
                          {item.label}
                        </Link>
                      </div>
                      {item.groups?.map((group, groupIndex) => (
                        <div key={groupIndex} className="px-3">
                          {group.label && (
                            <div className="text-sm font-semibold text-gray-500 mb-2">
                              {group.label}
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
                  ))}
                </div>
              )}
            </Stream>
          </div>
        </div>
      )}
    </div>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;