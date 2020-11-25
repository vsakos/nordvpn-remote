const { exec, spawn } = require('child_process');

function getStatus () {
  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];

    const child = spawn('nordvpn', [ 'status' ]);

    child.stdout.on('data', (data) => {
      stdout.push(data.toString('utf8'));
    });

    child.stderr.on('data', (data) => {
      stderr.push(data.toString('utf8'));
    });

    child.on('close', (code) => {
      if (code === 0) {
        const lines = stdout.join('').split(/[\r\n]/).map((line) => line.trim()).filter((line) => line.length > 3);
        const items = lines.reduce((acc, line) => {
          const [ key, value ] = line.split(':');
          if (key && value) {
            acc[key.trim().toLowerCase()] = value.trim();
          }
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
      } else {
        reject(stderr.join(''));
      }
    });
  });
}

function getCountries () {
  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];

    const child = spawn('nordvpn', [ 'countries' ]);

    child.stdout.on('data', (data) => {
      stdout.push(data.toString('utf8'));
    });

    child.stderr.on('data', (data) => {
      stderr.push(data.toString('utf8'));
    });

    child.on('close', (code) => {
      if (code === 0) {
        const lines = stdout.join('').split(/[\r\n]/).map((line) => line.trim()).filter((line) => line.length > 3);
        const countries = lines.join('').split(',').map((line) => line.trim());

        resolve(countries);
      } else {
        reject(stderr.join(''));
      }
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
