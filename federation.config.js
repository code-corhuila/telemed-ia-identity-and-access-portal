const {
  withNativeFederation,
  shareAll,
} = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'identity',

  // The shell mounts the public routes (sign-in, registration and password
  // recovery) outside its authGuard, and the admin routes inside it.
  exposes: {
    './routes': './src/app/identity/identity.routes.ts',
    // Administration → Accounts, mounted by the shell inside its authGuard.
    './admin': './src/app/admin/admin.routes.ts',
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
