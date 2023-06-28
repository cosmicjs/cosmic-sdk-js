// TODO: Delete this file once the new changes have been tested.
// import { createBucketClient } from './dist';

// const cosmic = createBucketClient({
//   bucketSlug: 'stoicism-new-bucket',
//   readKey: 'xjwpAMIEFHX1EtpA6ZN4KlaMSRVDbz6L2tPg39X2rhT7wKM51s',
// });

// cosmic.objects
//   .findOne({
//     type: 'itineraires',
//     slug: 'voyage-sportif-ultime-les-4-sports-en-4-jous',
//   })
//   .props('slug,title,metadata')
//   .depth(1)
//   .then((data) => console.log(data, 'CHAIN -> THEN SUCCESSFUL'))
//   .catch((err) => console.log('CHAIN ---> ERROR FROM THE CHAIN METHOD', err));

// async function run() {
//   let posts;
//   try {
//     posts = await cosmic.objects
//       .findOne({
//         type: 'itineraires',
//         slug: 'voyage-sportif-ultime-les-4-sports-en-4-jour',
//       })
//       .props('slug,title,metadata')
//       .depth(1);
//     console.log(posts, 'TRYCATCH ---> SUCCESSFUL!');
//     return posts;
//   } catch (e) {
//     console.log('TRYCATCH --> CATCH BLOCK ERROR CAUGHT SUCCESSFULLY', e);
//     return null;
//   }
// }

// run();