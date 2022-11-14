/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

 const { getDefaultConfig } = require("metro-config");

 module.exports = (async () => {
   const {
     resolver: { 
      assetExts }
   } = await getDefaultConfig();
 
   return {
     transformer: {
       getTransformOptions: async () => ({
         transform: {
           experimentalImportSupport: false,
           inlineRequires: true,
         },
       }),
     },
     resolver: {
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'],//add here
      // extraNodeModules: require('node-libs-react-native'),
      assetExts: [...assetExts, "obj", "mtl", "JPG", "vrx", "hdr", "gltf", "glb", "bin", "arobject", "gif"]
     }
   }
 })();
 
// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
//   resolver: {
//     sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json'] //add here
//   },
// };