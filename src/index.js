import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import config from 'react-global-configuration';

config.set({
  api: 'https://api.hurouap.com/swagger/',
  'swagger-bucket': 'https://s3-ap-northeast-1.amazonaws.com/swagger-repository-test/',
});


ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
