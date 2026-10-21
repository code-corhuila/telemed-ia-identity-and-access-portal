const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'identity',

  // The exposed routes arrive with the identity pages.
  exposes: {},

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },

  // NORMA 5.4.1: HTTP client, session and error type come from the shell.
  externals: [
    'shell/apiClient',
    'shell/session',
    'shell/apiError',
  ],

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],
});
