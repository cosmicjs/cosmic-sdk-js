// TODO: Delete this file once the new changes have been tested.
// import { createBucketClient } from './dist';

// const cosmic = createBucketClient({
//   bucketSlug: 'stoicism-new-bucket',
//   readKey: 'xjwpAMIEFHX1EtpA6ZN4KlaMSRVDbz6L2tPg39X2rhT7wKM51s',
// });

// cosmic.media
//   .findOne({ original_name: 'jimmy-philadelphie-unsplash.' })
//   .props('url,imgix_url,name')
//   .then((data) => console.log(data, 'CHAIN -> THEN SUCCESSFUL'))
//   .catch((err) =>
//     console.log('CHAIN ---> ERROR FROM THE CHAIN METHOD -->', err)
//   );

// async function run() {
//   let posts;
//   try {
//     posts = await cosmic.media
//       .findOne({ original_name: 'jimmy-philadelphie-unsplash.jp' })
//       .props('url,imgix_url,name');
//     return posts;
//   } catch (e) {
//     console.log('TRYCATCH --> CATCH BLOCK ERROR CAUGHT SUCCESSFULLY', e);
//     throw e;
//   }
// }

// console.log(
//   'TEST LOG _>',
//   run()
//     .then(() => console.log('TRYCATCH -> CHAINED THEN WORKED'))
//     .catch((e) => console.log('TRYCATCH -> CHAINED ERROR WORKED', e))
// );