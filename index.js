const express = require('express');
const { getCountries, getStatus, connect, disconnect } = require('./commands');

const app = express();

app.use(express.json());

app.get('/status', (req, res) => {
  getStatus().then((status) => {
    res.json(status);
  }).catch((err) => {
    res.status(500).json({
      error: err.toString()
    });
  });
});

app.get('/countries', (req, res) => {
  getCountries().then((countries) => {
    res.json({ countries })
  }).catch((err) => {
    res.status(500).json({
      error: err.toString()
    });
  });
});

app.post('/connect', (req, res) => {
  let server = req.body.server;

  if (!server) {
    res.status(400).json({
      error: 'Invalid server'
    });
    return;
  }

  server = server.replace(/[^a-zA-Z0-9\-_]+/g, '');

  connect(server).then(() => getStatus()).then((status) => {
    if (status.connected) {
      res.json(status);
    } else {
      res.status(500).json({
        error: `Failed to connect to ${server}`
      });
    }
  }).catch((err) => {
    res.status(500).json({
      error: err.toString()
    });
  });
});

app.post('/disconnect', (req, res) => {
  disconnect().then(() => getStatus()).then((status) => {
    if (!status.connected) {
      res.json(status);
    } else {
      res.status(500).json({
        error: 'Failed to disconnect'
      });
    }
  }).catch((err) => {
    res.status(500).json({
      error: err.toString()
    });
  });
});

app.listen(8123, () => {
  console.log('nordvpn remote listening on port 8123');
});
