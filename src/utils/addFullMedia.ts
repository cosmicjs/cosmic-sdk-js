const fetchMediaData = async (
  cosmic: any,
  filenames: string[],
  props: string
) => {
  const query = {
    name: { $in: filenames },
  };
  const { media } = await cosmic.media
    .find(query)
    .props(!props || props === 'all' ? '' : `name,url,imgix_url,${props}`);
  return media;
};

const extractMediaFiles = (obj: any): string[] => {
  const mediaFiles: string[] = [];
  JSON.stringify(obj, (_, value) => {
    if (value && typeof value === 'object') {
      if (value.url && value.imgix_url) {
        mediaFiles.push(value.url.split('/').pop().split('?')[0]);
      }
    }
    return value;
  });
  return [...new Set(mediaFiles)];
};

const mapMediaDataToResponse = (
  response: any,
  mediaData: any[],
  props: string
) => {
  const mediaMap = new Map(mediaData.map((item) => [item.name, item]));

  const addFullMedia = (obj: any) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object') {
          if (obj[key].url && obj[key].imgix_url) {
            const filename = obj[key].url.split('/').pop().split('?')[0];
            if (mediaMap.has(filename)) {
              // eslint-disable-next-line no-param-reassign
              if (!props.includes('name')) {
                delete mediaMap.get(filename).name;
              }
              const newObj = { ...mediaMap.get(filename) };
              Object.assign(obj[key], newObj);
            }
          }
          addFullMedia(obj[key]);
        }
      });
    }
  };

  addFullMedia(response);
};

const addFullMediaData = async (response: any, cosmic: any, props: string) => {
  const processItem = async (item: any) => {
    const mediaFiles = extractMediaFiles(item);
    if (mediaFiles.length > 0) {
      const mediaData = await fetchMediaData(cosmic, mediaFiles, props);
      mapMediaDataToResponse(item, mediaData, props);
    }
    return item;
  };

  if (Array.isArray(response)) {
    return Promise.all(response.map((item) => processItem(item)));
  }
  return processItem(response);
};

export { addFullMediaData };
