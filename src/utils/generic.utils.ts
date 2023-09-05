import { GenericObject } from '../types/generic.types';

export const encodedQueryParam = (query?: GenericObject) => {
  if (!query) return '';
  return `&query=${encodeURIComponent(JSON.stringify(query))}`;
};
