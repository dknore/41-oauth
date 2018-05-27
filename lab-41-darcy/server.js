'use strict';

const express = require('express');
const superagent = require('superagent');
const dotenv = require('dotenv');
const app = express();

dotenv.load();

app.get('/oauth/google/code', function(req, res) {
  if (!req.query.code) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    console.log('CODE: ', req.query.code);
    superagent.post('https://www.googleapis.com/oauth2/v4/token')
      .type('form')
      .send({
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google/code`
      })
      .then(response => {
        console.log('Response AFTER code is given', response.body);
        return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
          .set('Authorization', `Bearer ${response.body.access_token}`);
      })
      .then(response => {
        console.log(':::OPEN ID - GOOGLE PLUS:::', response.body);
        res.cookie('X-Some-Cookie', 'some token');
        res.redirect(process.env.CLIENT_URL);
      });
  }
});

app.get('/oauth-callback', (req, res) => {
  res.sendFile('./index.html', {root:'./'});
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('Listening on http://localhost: ' + PORT);
});