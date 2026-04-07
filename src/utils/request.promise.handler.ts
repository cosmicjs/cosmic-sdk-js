export const requestPromiseHandler = async (
  method: string,
  url: string,
  data?: any,
  headers?: any
) => {
  // eslint-disable-next-line no-undef
  const options: RequestInit = {
    method,
    headers: { ...headers },
  };

  if (data !== undefined && data !== null) {
    options.body = JSON.stringify(data);
    if (
      options.headers &&
      !(options.headers as Record<string, string>)['Content-Type']
    ) {
      (options.headers as Record<string, string>)['Content-Type'] =
        'application/json';
    }
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (err as any).response = {
        data: `HTTP ${response.status}: ${response.statusText}`,
      };
      throw err;
    }
    const err = new Error(errorData?.message || `HTTP ${response.status}`);
    (err as any).response = { data: errorData };
    throw err;
  }

  return { data: await response.json() };
};
