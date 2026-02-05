export default function (api) {
  api.cache(false);
  return {
    presets: [
      ['babel-preset-expo', { "jsxRuntime": 'automatic' }],
    ]
  };
}
