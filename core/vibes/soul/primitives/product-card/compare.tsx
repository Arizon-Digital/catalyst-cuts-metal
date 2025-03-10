'use client';

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

import { Checkbox } from '@/vibes/soul/form/checkbox';

interface Props {
  productId: string;
  colorScheme?: 'light' | 'dark';
  paramName?: string;
  label?: string;
}

export const Compare = function Compare({
  productId,
  colorScheme = 'light',
  paramName = 'compare',
  label = 'Compare',
}: Props) {
  const [param, setParam] = useQueryState(
    paramName,
    parseAsArrayOf(parseAsString).withOptions({ shallow: false }),
  );

  return (
    <Checkbox
      checked={param?.includes(productId) ?? false}
      colorScheme={colorScheme}
      label={label}
      onCheckedChange={(value) => {
        void setParam((prev) => {
          const next =
            value === true
              ? [...(prev ?? []), productId]
              : (prev ?? []).filter((v) => v !== productId);

          return next.length > 0 ? next : null;
        });
      }}
    />
  );
};
