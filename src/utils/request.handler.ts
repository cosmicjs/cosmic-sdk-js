const isNode = typeof process !== 'undefined' && process.versions?.node;

export const requestHandler = async (
  method: string,
  url: string,
  data?: any,
  headers?: any,
  stream?: boolean
) => {
  // eslint-disable-next-line no-undef
  const options: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (data !== undefined && data !== null) {
    const isFormData =
      (typeof FormData !== 'undefined' && data instanceof FormData) ||
      (data && typeof data.getHeaders === 'function');

    if (isFormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
      if (
        options.headers &&
        !(options.headers as Record<string, string>)['Content-Type']
      ) {
        (options.headers as Record<string, string>)['Content-Type'] =
          'application/json';
      }
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    throw errorData;
  }

  if (stream) {
    if (isNode) {
      const { Readable } = await import('stream');
      return Readable.fromWeb(response.body as any);
    }
    return response.body;
  }

  return response.json();
};
