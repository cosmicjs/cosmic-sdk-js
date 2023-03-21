const apiConfigs = {
  production: {
    v3: {
      apiUrl: 'https://api.cosmicjs.com/v3',
      uploadUrl: 'https://workers.cosmicjs.com/v3',
    },
  },
  staging: {
    v3: {
      apiUrl: 'https://api.cosmic-staging.com/v3',
      uploadUrl: 'https://workers.cosmic-staging.com/v3',
    },
  },
};

export default apiConfigs;
