import { GenericObject } from '../types/generic.types';

export const encodedQueryParam = (query?: GenericObject) => {
  if (!query) return '';
  return `&query=${encodeURIComponent(JSON.stringify(query))}`;
};

export const previewTokenParam = (previewToken?: string) => {
  if (!previewToken) return '';
  return `&preview_token=${encodeURIComponent(previewToken)}`;
};
