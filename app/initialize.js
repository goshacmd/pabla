require('es6-promise').polyfill();

import 'styles/application.scss';

import ReactDOM from 'react-dom';
import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {Provider} from 'react-redux';

import reducer from 'reducer';
import App from 'container/App';

import {initialFetchImages} from 'actions';

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

store.dispatch(initialFetchImages());

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
