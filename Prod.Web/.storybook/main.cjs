module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ],
  webpackFinal: (config) => {
    config.resolve.alias['../components/viewModel'] = require.resolve('../src/components/viewModelMock.js');
    config.resolve.alias['../components/authService'] = require.resolve('../src/components/authServiceMock.js');
    return config;
  }
}