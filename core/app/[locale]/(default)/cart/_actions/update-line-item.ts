'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/cart/schema';
import { CartLineItem } from '@/vibes/soul/sections/cart/types';

import { getCart } from '../page-data';

import { removeItem } from './remove-item';
import { CartSelectedOptionsInput, updateQuantity } from './update-quantity';

export const updateLineItem = async (
  prevState: Awaited<{
    lineItems: CartLineItem[];
    lastResult: SubmissionResult | null;
  }>,
  formData: FormData,
): Promise<{
  lineItems: CartLineItem[];
  lastResult: SubmissionResult | null;
}> => {
  const t = await getTranslations('Cart.Errors');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }),
    };
  }

  const cartId = cookies().get('cartId')?.value;

  if (!cartId) {
    return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
  }

  switch (submission.value.intent) {
    case 'increment': {
      const data = await getCart(cartId);

      const cart = data.site.cart;

      if (!cart) {
        return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
      }

      const cartLineItem = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].find(
        (cartItem) => cartItem.entityId === submission.value.id,
      );

      if (!cartLineItem) {
        return {
          ...prevState,
          lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
        };
      }

      const parsedSelectedOptions = cartLineItem.selectedOptions.reduce<CartSelectedOptionsInput>(
        (accum, option) => {
          let multipleChoicesOptionInput;
          let checkboxOptionInput;
          let numberFieldOptionInput;
          let textFieldOptionInput;
          let multiLineTextFieldOptionInput;
          let dateFieldOptionInput;

          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
              multipleChoicesOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.multipleChoices) {
                return {
                  ...accum,
                  multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
                };
              }

              return {
                ...accum,
                multipleChoices: [multipleChoicesOptionInput],
              };

            case 'CartSelectedCheckboxOption':
              checkboxOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.checkboxes) {
                return {
                  ...accum,
                  checkboxes: [...accum.checkboxes, checkboxOptionInput],
                };
              }

              return { ...accum, checkboxes: [checkboxOptionInput] };

            case 'CartSelectedNumberFieldOption':
              numberFieldOptionInput = {
                optionEntityId: option.entityId,
                number: option.number,
              };

              if (accum.numberFields) {
                return {
                  ...accum,
                  numberFields: [...accum.numberFields, numberFieldOptionInput],
                };
              }

              return { ...accum, numberFields: [numberFieldOptionInput] };

            case 'CartSelectedTextFieldOption':
              textFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.textFields) {
                return {
                  ...accum,
                  textFields: [...accum.textFields, textFieldOptionInput],
                };
              }

              return { ...accum, textFields: [textFieldOptionInput] };

            case 'CartSelectedMultiLineTextFieldOption':
              multiLineTextFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.multiLineTextFields) {
                return {
                  ...accum,
                  multiLineTextFields: [
                    ...accum.multiLineTextFields,
                    multiLineTextFieldOptionInput,
                  ],
                };
              }

              return {
                ...accum,
                multiLineTextFields: [multiLineTextFieldOptionInput],
              };

            case 'CartSelectedDateFieldOption':
              dateFieldOptionInput = {
                optionEntityId: option.entityId,
                date: new Date(String(option.date.utc)).toISOString(),
              };

              if (accum.dateFields) {
                return {
                  ...accum,
                  dateFields: [...accum.dateFields, dateFieldOptionInput],
                };
              }

              return { ...accum, dateFields: [dateFieldOptionInput] };
          }

          return accum;
        },
        {},
      );

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.entityId,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: submission.value.quantity + 1,
        });
      } catch (error) {
        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity + 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'decrement': {
      const data = await getCart(cartId);

      const cart = data.site.cart;

      if (!cart) {
        return { ...prevState, lastResult: submission.reply({ formErrors: [t('cartNotFound')] }) };
      }

      const cartLineItem = [...cart.lineItems.physicalItems, ...cart.lineItems.digitalItems].find(
        (cartItem) => cartItem.entityId === submission.value.id,
      );

      if (!cartLineItem) {
        return {
          ...prevState,
          lastResult: submission.reply({ formErrors: [t('lineItemNotFound')] }),
        };
      }

      const parsedSelectedOptions = cartLineItem.selectedOptions.reduce<CartSelectedOptionsInput>(
        (accum, option) => {
          let multipleChoicesOptionInput;
          let checkboxOptionInput;
          let numberFieldOptionInput;
          let textFieldOptionInput;
          let multiLineTextFieldOptionInput;
          let dateFieldOptionInput;

          switch (option.__typename) {
            case 'CartSelectedMultipleChoiceOption':
              multipleChoicesOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.multipleChoices) {
                return {
                  ...accum,
                  multipleChoices: [...accum.multipleChoices, multipleChoicesOptionInput],
                };
              }

              return {
                ...accum,
                multipleChoices: [multipleChoicesOptionInput],
              };

            case 'CartSelectedCheckboxOption':
              checkboxOptionInput = {
                optionEntityId: option.entityId,
                optionValueEntityId: option.valueEntityId,
              };

              if (accum.checkboxes) {
                return {
                  ...accum,
                  checkboxes: [...accum.checkboxes, checkboxOptionInput],
                };
              }

              return { ...accum, checkboxes: [checkboxOptionInput] };

            case 'CartSelectedNumberFieldOption':
              numberFieldOptionInput = {
                optionEntityId: option.entityId,
                number: option.number,
              };

              if (accum.numberFields) {
                return {
                  ...accum,
                  numberFields: [...accum.numberFields, numberFieldOptionInput],
                };
              }

              return { ...accum, numberFields: [numberFieldOptionInput] };

            case 'CartSelectedTextFieldOption':
              textFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.textFields) {
                return {
                  ...accum,
                  textFields: [...accum.textFields, textFieldOptionInput],
                };
              }

              return { ...accum, textFields: [textFieldOptionInput] };

            case 'CartSelectedMultiLineTextFieldOption':
              multiLineTextFieldOptionInput = {
                optionEntityId: option.entityId,
                text: option.text,
              };

              if (accum.multiLineTextFields) {
                return {
                  ...accum,
                  multiLineTextFields: [
                    ...accum.multiLineTextFields,
                    multiLineTextFieldOptionInput,
                  ],
                };
              }

              return {
                ...accum,
                multiLineTextFields: [multiLineTextFieldOptionInput],
              };

            case 'CartSelectedDateFieldOption':
              dateFieldOptionInput = {
                optionEntityId: option.entityId,
                date: new Date(String(option.date.utc)).toISOString(),
              };

              if (accum.dateFields) {
                return {
                  ...accum,
                  dateFields: [...accum.dateFields, dateFieldOptionInput],
                };
              }

              return { ...accum, dateFields: [dateFieldOptionInput] };
          }

          return accum;
        },
        {},
      );

      try {
        await updateQuantity({
          lineItemEntityId: cartLineItem.entityId,
          productEntityId: cartLineItem.productEntityId,
          variantEntityId: cartLineItem.variantEntityId,
          selectedOptions: parsedSelectedOptions,
          quantity: submission.value.quantity - 1,
        });
      } catch (error) {
        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const item = submission.value;

      return {
        lineItems: prevState.lineItems.map((lineItem) =>
          lineItem.id === item.id ? { ...lineItem, quantity: lineItem.quantity - 1 } : lineItem,
        ),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    case 'delete': {
      try {
        await removeItem({ lineItemEntityId: submission.value.id });
      } catch (error) {
        if (error instanceof Error) {
          return { ...prevState, lastResult: submission.reply({ formErrors: [error.message] }) };
        }

        return { ...prevState, lastResult: submission.reply({ formErrors: [String(error)] }) };
      }

      const deletedItem = submission.value;

      // TODO: add bodl
      // bodl.cart.productRemoved({
      //   currency,
      //   product_value: product.listPrice.value * product.quantity,
      //   line_items: [lineItemTransform(product)],
      // });

      return {
        lineItems: prevState.lineItems.filter((item) => item.id !== deletedItem.id),
        lastResult: submission.reply({ resetForm: true }),
      };
    }

    default: {
      return prevState;
    }
  }
};
