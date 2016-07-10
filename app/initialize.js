import * as promisePolyfill from 'es6-promise';
promisePolyfill.polyfill();

import 'babel-polyfill';

import 'styles/application.scss';

import ReactDOM from 'react-dom';
import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {Provider} from 'react-redux';

import reducer from 'reducer';
import App from 'container/App';

import rootSaga from 'sagas';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

document.addEventListener('DOMContentLoaded', () => {
  const el = document.createElement('div');
  el.id = 'app';
  document.body.appendChild(el);
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    el
  );
});
