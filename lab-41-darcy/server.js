'use strict';

const express = require('express');
const superagent = require('superagent');
const dotenv = require('dotenv');
const cookie = require('cookie');
const app = express();

dotenv.load();

app.get('/oauth-callback', function(req, res) {
  if (!req.query.code) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    console.log('CODE: ', req.query.code, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    superagent.post('https://www.googleapis.com/oauth2/v4/token')
      .type('form')
      .send({
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth-callback`
      })
      .then(response => {
        let {access_token, id_token} = response.body;
        let payload = id_token.split('.')[1];
        let decoded = Buffer.from(payload, 'base64').toString();
        let json = JSON.parse(decoded);
        console.log('access', access_token);
        console.log('id', id_token);
        res.cookie('X-Some-Cookie', 'some token');
        res.write('Welcome ' + json.given_name + '!');
        res.end();
      })
      .catch(err => {
        console.log(err);
      });
  }
});

app.get('*', (req, res) => {
  res.sendFile('./index.html', {root:'./'});
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('Listening on http://localhost: ' + PORT);
});