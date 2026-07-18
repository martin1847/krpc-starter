/**
 * Expo (React Native + web via Metro) babel base.
 * - babel-preset-expo with `jsxImportSource: nativewind` compiles className -> style.
 * - nativewind/babel handles the className transform; the reanimated/worklets plugin must be last.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: ['react-native-worklets/plugin'],
  };
};
