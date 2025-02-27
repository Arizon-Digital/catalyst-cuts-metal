
import { Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { ListProduct, ProductsList } from '@/vibes/soul/primitives/products-list';
import { FeaturedProductsList } from '@/vibes/soul/sections/featured-products-list';

interface NotFoundProps {
  title?: string;
  subtitle?: string;
  featuredProductsTitle?: string;
  featuredProductsDescription?: string;
  featuredProductsCta?: {
    label: string;
    href: string;
  };
  products: Streamable<ListProduct[]>;
  emptyStateTitle?: Streamable<string | null>;
  emptyStateSubtitle?: Streamable<string | null>;
  placeholderCount?: number;
}

export function NotFound({
  title = 'Not found',
  subtitle = "Take a look around if you're lost.",
  featuredProductsTitle = 'Featured Products',
  featuredProductsDescription = 'You might be interested in these popular items',
  featuredProductsCta = {
    label: 'View all products',
    href: '/products'
  },
  products = [] as Streamable<ListProduct[]>,
  emptyStateTitle = 'No products available',
  emptyStateSubtitle = 'Check back soon for new products',
  placeholderCount = 4,
}: NotFoundProps) {
  return (
    <>
      <section className="@container">
        <div className="mx-auto max-w-3xl px-4 pt-10 @xl:px-6 @xl:pt-14 @4xl:px-8 @4xl:pt-20">
          <h1 className="mb-3 font-heading text-3xl font-medium leading-none @xl:text-4xl @4xl:text-5xl">
            {title}
          </h1>
          <p className="text-lg text-contrast-500">{subtitle}</p>
        </div>
      </section>
      
      <section className="mt-16 @xl:mt-20 @4xl:mt-24">
        <FeaturedProductsList
          title={featuredProductsTitle}
          description={featuredProductsDescription}
          cta={featuredProductsCta}
          products={products}
          emptyStateTitle={emptyStateTitle}
          emptyStateSubtitle={emptyStateSubtitle}
          placeholderCount={placeholderCount}
        />
      </section>
    </>
  );
}