



'use client';

import { Checkbox } from '@radix-ui/react-checkbox';
import { Label } from '@radix-ui/react-label';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { Check } from 'lucide-react';

interface Image {
  altText?: string;
  src?: string;
}

interface ProductInfo {
  id: string;
  image?: Image;
  name: string;
}

interface Props {
  productId: string | string[];
  colorScheme?: 'light' | 'dark';
  paramName?: string;
  label?: string;
}

export const Compare = ({
  productId,
  colorScheme = 'light',
  paramName = 'compare',
  label,
}: Props) => {
  const checkboxId = useId();
  const t = useTranslations('Components.ProductCard.Compare');
  const displayLabel = label || t('compare');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { products, setProducts } = useCompareDrawerContext();
  
  useEffect(() => {
    if (Array.isArray(productId)) {
      setSelectedIds(productId);
    } else {
      setSelectedIds(products.some(({ id }) => id === productId) ? [productId] : []);
    }
  }, [productId, products]);
  
  const isChecked = () => {
    if (Array.isArray(productId)) {
      return productId.every(id => selectedIds.includes(id));
    }
    return selectedIds.includes(productId);
  };

  const handleOnCheckedChange = (isChecked: boolean) => {
    if (Array.isArray(productId)) {
      if (isChecked) {
        const newIds = [...selectedIds];
        productId.forEach(id => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        setSelectedIds(newIds);
        
        const newProducts = [...products];
        productId.forEach(id => {
          if (!products.some(p => p.id === id)) {
            const productDetails = { id, name: id, image: undefined };
            newProducts.push(productDetails);
          }
        });
        setProducts(newProducts);
      } else {
        const newIds = selectedIds.filter(id => !productId.includes(id));
        setSelectedIds(newIds);
        
        setProducts(products.filter(p => !productId.includes(p.id)));
      }
    } else {
      if (isChecked) {
        setSelectedIds(prev => [...prev, productId]);
        
        const productToAdd = {
          id: productId,
          name: productId, 
          image: undefined,
        };
        
        setProducts([...products, productToAdd]);
      } else {
        setSelectedIds(prev => prev.filter(id => id !== productId));
        setProducts(products.filter(p => p.id !== productId));
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        aria-label={displayLabel}
        checked={isChecked()}
        className="h-4 w-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative flex items-center justify-center"
        id={checkboxId}
        onCheckedChange={handleOnCheckedChange}
      >
        {isChecked() && (
          <Check className="h-3 w-3 text-blue-600" />
        )}
      </Checkbox>
      <Label className="font-normal" htmlFor={checkboxId}>
        {displayLabel}
      </Label>
    </div>
  );
};