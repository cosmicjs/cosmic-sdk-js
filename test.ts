// TODO: Delete this file once the new changes have been tested.
// import { createBucketClient } from './dist';

// const cosmic = createBucketClient({
//   bucketSlug: 'stoicism-new-bucket',
//   readKey: 'xjwpAMIEFHX1EtpA6ZN4KlaMSRVDbz6L2tPg39X2rhT7wKM51s',
// });

// async function run() {
//   let posts;
//   try {
//     posts = await cosmic.media
//       .findOne({ original_name: 'jimmy-philadelphie-unsplash.jpg' })
//       .props('url,imgix_url,name');

//     return posts;
//   } catch (e) {
//     return e;
//   }
// }

// console.log(
//   'HELLO',
//   run().then((res) => console.log(res))
// );
