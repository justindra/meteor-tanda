Package.describe({
  name: 'justindra:tanda',
  version: '0.1.4',
  summary: 'Tanda OAuth flow',
  git: 'https://github.com/justindra/meteor-tanda',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('templating', 'client');
  api.use('underscore', 'server');
  api.use('random', 'client');
  api.use('service-configuration', ['client', 'server']);

  api.export('Tanda');

  api.addFiles(
    ['tanda_configure.html', 'tanda_configure.js'],
    'client');

  api.addFiles('tanda_server.js', 'server');
  api.addFiles('tanda_client.js', 'client');
});