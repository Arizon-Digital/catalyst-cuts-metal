import { notFound } from 'next/navigation';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PricingFragment } from '~/client/fragments/pricing';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { FeaturedProductsCarouselFragment } from '~/components/featured-products-carousel/fragment';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { ProductSchemaFragment } from './_components/product-schema/fragment';
import { ProductViewedFragment } from './_components/product-viewed/fragment';

const MultipleChoiceFieldFragment = graphql(`
  fragment MultipleChoiceFieldFragment on MultipleChoiceOption {
    entityId
    displayName
    displayStyle
    isRequired
    values(first: 50) {
      edges {
        node {
          entityId
          label
          isDefault
          isSelected
          ... on SwatchOptionValue {
            __typename
            hexColors
            imageUrl(lossy: true, width: 40)
          }
          ... on ProductPickListOptionValue {
            __typename
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
          }
        }
      }
    }
  }
`);

const CheckboxFieldFragment = graphql(`
  fragment CheckboxFieldFragment on CheckboxOption {
    entityId
    isRequired
    displayName
    checkedByDefault
    label
    checkedOptionValueEntityId
    uncheckedOptionValueEntityId
  }
`);

const NumberFieldFragment = graphql(`
  fragment NumberFieldFragment on NumberFieldOption {
    entityId
    displayName
    isRequired
    defaultNumber: defaultValue
    highest
    isIntegerOnly
    limitNumberBy
    lowest
  }
`);

const TextFieldFragment = graphql(`
  fragment TextFieldFragment on TextFieldOption {
    entityId
    displayName
    isRequired
    defaultText: defaultValue
    maxLength
    minLength
  }
`);

const MultiLineTextFieldFragment = graphql(`
  fragment MultiLineTextFieldFragment on MultiLineTextFieldOption {
    entityId
    displayName
    isRequired
    defaultText: defaultValue
    maxLength
    minLength
    maxLines
  }
`);

const DateFieldFragment = graphql(`
  fragment DateFieldFragment on DateFieldOption {
    entityId
    displayName
    isRequired
    defaultDate: defaultValue
    earliest
    latest
    limitDateBy
  }
`);

const AddToCartButtonFragment = graphql(`
  fragment AddToCartButtonFragment on Product {
    inventory {
      isInStock
    }
    availabilityV2 {
      status
    }
  }
`);

export const ProductFormFragment = graphql(
  `
    fragment ProductFormFragment on Product {
      entityId
      variants {
        edges {
          node {
            entityId
          }
        }
      }
      productOptions(first: 10) {
        edges {
          node {
            __typename
            entityId
            displayName
            isRequired
            isVariantOption
            ...MultipleChoiceFieldFragment
            ...CheckboxFieldFragment
            ...NumberFieldFragment
            ...TextFieldFragment
            ...MultiLineTextFieldFragment
            ...DateFieldFragment
          }
        }
      }
      ...AddToCartButtonFragment
    }
  `,
  [
    MultipleChoiceFieldFragment,
    CheckboxFieldFragment,
    NumberFieldFragment,
    TextFieldFragment,
    MultiLineTextFieldFragment,
    DateFieldFragment,
    AddToCartButtonFragment,
  ],
);

const ProductDetailsFragment = graphql(
  `
    fragment ProductDetailsFragment on Product {
      entityId
      name
      description
      path
      images {
        edges {
          node {
            altText
            url: urlTemplate(lossy: true)
            isDefault
          }
        }
      }
      defaultImage {
        altText
        url: urlTemplate(lossy: true)
      }
      brand {
        name
      }
      reviewSummary {
        averageRating
      }
      description
      sku
      weight {
        value
        unit
      }
      condition
      customFields {
        edges {
          node {
            entityId
            name
            value
          }
        }
      }
      warranty
      ...PricingFragment
      ...ProductFormFragment
    }
  `,
  [PricingFragment, ProductFormFragment],
);

const ProductPageQuery = graphql(
  `
    query ProductPageQuery(
      $entityId: Int!
      $optionValueIds: [OptionValueId!]
      $useDefaultOptionSelections: Boolean
      $currencyCode: currencyCode
    ) {
      site {
        product(
          entityId: $entityId
          optionValueIds: $optionValueIds
          useDefaultOptionSelections: $useDefaultOptionSelections
        ) {
          ...ProductDetailsFragment
          ...ProductViewedFragment
          ...ProductSchemaFragment
          name
          defaultImage {
            url: urlTemplate(lossy: true)
            altText
          }
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
          relatedProducts(first: 8) {
            edges {
              node {
                ...FeaturedProductsCarouselFragment
              }
            }
          }
        }
      }
    }
  `,
  [
    ProductDetailsFragment,
    ProductViewedFragment,
    ProductSchemaFragment,
    FeaturedProductsCarouselFragment,
  ],
);

type Variables = VariablesOf<typeof ProductPageQuery>;

export const getProductData = cache(async (variables: Variables) => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();

  const { data } = await client.fetch({
    document: ProductPageQuery,
    variables: { ...variables, currencyCode },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const product = data.site.product;

  if (!product) {
    return notFound();
  }

  return product;
});


const GetMultipleChoiceOptionsQuery = graphql(`
  query GetMultipleChoiceOptions($entityId: Int!, $valuesCursor: String) {
    site {
      product(entityId: $entityId) {
        entityId
        productOptions(first: 50) {
          edges {
            node {
              entityId
              displayName
              isRequired
              ... on MultipleChoiceOption {
                displayStyle
                values(first: 50, after: $valuesCursor) {
                  edges {
                    node {
                      entityId
                      label
                      isDefault
                      isSelected
                      ... on SwatchOptionValue {
                        __typename
                        hexColors
                        imageUrl(lossy: true, width: 40)
                      }
                      ... on ProductPickListOptionValue {
                        __typename
                        defaultImage {
                          altText
                          url: urlTemplate(lossy: true)
                        }
                      }
                    }
                  }
                  pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                    hasPreviousPage
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);
 
export const getMultipleChoiceOptions = async (
  productId: number | undefined,
  valuesCursor?: string | null,
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  // First fetch
  const { data: firstData } = await client.fetch({
    document: GetMultipleChoiceOptionsQuery,
    variables: { entityId: productId, valuesCursor },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const pId = firstData?.site?.product?.entityId;
  const firstMultipleChoiceOptions =
    firstData?.site?.product?.productOptions?.edges
      ?.map((edge) => edge.node)
      ?.filter((node) => node?.displayStyle === "DropdownList") || [];

  let firstDropdownList =
    firstMultipleChoiceOptions?.map((option) => option.values?.edges).flat() || [];
  const firstPageInfo = firstMultipleChoiceOptions?.map((option) => option.values?.pageInfo).flat() || [];
  const firstPageInfo1 = firstPageInfo?.[0];

  const endCursor = firstPageInfo1?.endCursor || null;
  const hasNextPage = firstPageInfo1?.hasNextPage ?? null;

  // Store first fetch data
  let combinedDropdownList = [...firstDropdownList];
  let combinedMultipleChoiceOptions = [...firstMultipleChoiceOptions];

  // If there's a next page, fetch the second batch
  if (hasNextPage && endCursor) {
    const { data: secondData } = await client.fetch({
      document: GetMultipleChoiceOptionsQuery,
      variables: { entityId: productId, valuesCursor: endCursor },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const secondMultipleChoiceOptions =
      secondData?.site?.product?.productOptions?.edges
        ?.map((edge) => edge.node)
        ?.filter((node) => node?.displayStyle === "DropdownList") || [];

    let secondDropdownList =
      secondMultipleChoiceOptions?.map((option) => option.values?.edges).flat() || [];
    
    // Merge both results
    combinedMultipleChoiceOptions = [...firstMultipleChoiceOptions, ...secondMultipleChoiceOptions];
    combinedDropdownList = [...firstDropdownList, ...secondDropdownList];
  }

  // Sorting function: Extracts the first numeric value and sorts in descending order
  const extractWidth = (label) => parseInt(label.match(/\d+/)[0], 10);
  combinedDropdownList.sort((a, b) => extractWidth(b.node.label) - extractWidth(a.node.label));

  return {
    multipleChoiceOptions: combinedMultipleChoiceOptions,
    DropdownList: combinedDropdownList, // Sorted in descending order
    pId,
    pageInfo: firstPageInfo, // Keep original pageInfo from first fetch
    endCursor,
    hasNextPage,
  };
};

