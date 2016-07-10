import { takeEvery } from 'redux-saga';
import { call, put, fork } from 'redux-saga/effects';

import * as unsplash from 'utils/unsplash';
import {selectImage} from 'actions';

function* initImagesSaga() {
  const images = yield call(unsplash.getPopularImages);
  yield put({ type: 'RECEIVE_IMAGES', images });
  yield put(selectImage(images[0]));
}

function* getPopularImagesSaga() {
  const images = yield call(unsplash.getPopularImages);
  yield put({ type: 'RECEIVE_IMAGES', images });
}

function* searchImagesSaga({ query }) {
  const images = yield call(unsplash.searchImages, query);
  yield put({ type: 'RECEIVE_IMAGES', images });
}

export default function* rootSaga() {
  yield fork(initImagesSaga);
  yield fork(takeEvery, 'SEARCH_IMAGES', searchImagesSaga);
  yield fork(takeEvery, 'RESET_SEARCH', getPopularImagesSaga);
}
