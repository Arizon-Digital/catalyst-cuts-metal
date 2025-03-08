'use client';

import { use } from 'react';
import TrustSpotWidget from './_components/TrustSpotReviews';

export const ClientTrustSpotWrapper = ({ 
  productId, 
  productData 
}: { 
  productId: string, 
  productData: Promise<any> 
}) => {
  const product = use(productData);
  

  const updateTrustSpotAttributes = () => {
    setTimeout(() => {
      const trustspotElement = document.querySelector('.trustspot-main-widget');
      if (trustspotElement) {
        trustspotElement.setAttribute('data-product-sku', productId);
        trustspotElement.setAttribute('data-name', product.title);
      }
    }, 100);
  };
  
  if (typeof window !== 'undefined') {
    updateTrustSpotAttributes();
  }
  
  return <TrustSpotWidget />;
};