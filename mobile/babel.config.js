module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 향후 필요시 추가: ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  };
};

