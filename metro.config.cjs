/* //metro.config.mjs
import { getDefaultConfig } from 'expo/metro-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getDefaultConfig(__dirname);

// Metro expects a Babel transformer
config.transformer.babelTransformerPath = fileURLToPath(
  new URL('node_modules/metro-react-native-babel-transformer/src/index.js', import.meta.url)
);

export default config;
*/

// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
module.exports = getDefaultConfig(__dirname);