import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './index.css';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

import { BrowserRouter, Redirect, Route } from 'react-router-dom';

import app from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDur0kYc3v9FD4yVb5kKlnDH9IgRSGbNXQ',
  authDomain: 'yarn-for-more.firebaseapp.com',
  databaseURL: 'https://yarn-for-more.firebaseio.com',
  projectId: 'yarn-for-more',
  storageBucket: 'yarn-for-more.appspot.com',
  messagingSenderId: '1043913940689',
  appId: '1:1043913940689:web:745abe7f6b43fbd7946ff0',
};

app.initializeApp(firebaseConfig);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ffffff',
    },
  },
});

render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <Route path="/:yarn" component={App} />
      <Redirect from="/" to="/Lace" />
    </BrowserRouter>
  </ThemeProvider>,
  document.querySelector('#root'),
);
