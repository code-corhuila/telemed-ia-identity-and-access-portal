const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'identity',

  // The shell mounts these public routes (sign-in, registration and
  // password recovery) outside its authGuard.
  exposes: {
    './routes': './src/app/identity/identity.routes.ts',
  },

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
