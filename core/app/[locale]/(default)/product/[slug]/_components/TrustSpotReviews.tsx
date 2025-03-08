'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    trustspot_init?: any;
    trustspot_key?: string;
  }
}

const TrustSpotWidget = () => {
  useEffect(() => {
   
    const linkElement = document.createElement('link');
    linkElement.href = 'https://trustspot.io/index.php/api/pub/product_widget_css/7218/widget.css';
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    document.head.appendChild(linkElement);
    
  
    const keyScript = document.createElement('script');
    keyScript.text = "trustspot_key='e76c74075b554b2b651aaef17d93a7730e92ef48133e582efa1d7e52233d36c5421c86bd4bacb8513c0f13579ed61c5f1074308422bd8bdf5ba1b28b746f966a';";
    document.head.appendChild(keyScript);
    
    
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://trustspot.io/assets/js/trustspot_product_reviews.js';
    scriptElement.async = true;
    document.head.appendChild(scriptElement);
    
    scriptElement.onload = () => {
      if (window.trustspot_init) {
        setTimeout(() => {
          window.trustspot_init();
        }, 500);
      }
    };
    
    return () => {
      try {
        document.head.removeChild(linkElement);
        document.head.removeChild(keyScript);
        document.head.removeChild(scriptElement);
      } catch (error) {
        console.error('Error cleaning up TrustSpot scripts:', error);
      }
    };
  }, []);
  
  return (
    <div className="trustspot trustspot-main-widget" data-product-sku="%%GLOBAL_ProductId%%" data-name="%%GLOBAL_ProductName%%"></div>
  );
};

export default TrustSpotWidget;