require('es6-promise').polyfill();

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
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#app')
  );
});
