const { exec, spawn } = require('child_process');

function getStatus () {
  return new Promise((resolve, reject) => {
    exec('nordvpn status', { timeout: 30 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = stdout.toString('utf8').split(/[\r\n]/).map((line) => line.trim()).filter((line) => line.length > 3);
      const items = lines.reduce((acc, line) => {
        const [ key, value ] = line.split(':');
        acc[key.trim().toLowerCase()] = value.trim();
        return acc;
      }, {});

      if (items.status === 'Connected') {
        resolve({
          connected: true,
          country: items.country,
          server: items['current server'],
          ip: items['your new ip']
        });
      } else {
        resolve({
          connected: false
        });
      }
    });
  });
}

function getCountries () {
  return new Promise((resolve, reject) => {
    exec('nordvpn countries', { timeout: 30 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = stdout.toString('utf8').split(/[\r\n]/).map((line) => line.trim()).filter((line) => line.length > 3);
      const countries = lines.join('').split(',').map((line) => line.trim());

      resolve(countries);
    });
  });
}

function connect (server) {
  return new Promise((resolve, reject) => {
    const child = spawn('nordvpn', [ 'connect', server ]);
    child.on('close', () => {
      resolve();
    });
  });
}

function disconnect () {
  return new Promise((resolve, reject) => {
    const child = spawn('nordvpn', [ 'disconnect' ]);
    child.on('close', () => {
      resolve();
    });
  });
}

module.exports = {
  getStatus,
  getCountries,
  connect,
  disconnect
};
