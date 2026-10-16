// Alternativa opcional a systemd usando PM2:
//   pm2 start deploy/ecosystem.config.cjs && pm2 save && pm2 startup
// Las variables secretas se leen de /etc/upampi/contact.env (no se versionan).
const fs = require('node:fs');

function readEnv(file) {
  try {
    return Object.fromEntries(
      fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
        .map((l) => {
          const i = l.indexOf('=');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')];
        }),
    );
  } catch {
    return {};
  }
}

module.exports = {
  apps: [
    {
      name: 'upampi-contact',
      cwd: '/var/www/upampi/current',
      script: 'dist/server/entry.mjs',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '4321',
        ...readEnv('/etc/upampi/contact.env'),
      },
    },
  ],
};
