import {getPopularImages, searchImages as _searchImages} from 'utils/unsplash';

export const setFont = (font) => ({
  type: 'SET_FONT',
  font
});

export const setFontSize = (size) => ({
  type: 'SET_FONT_SIZE',
  size
});

export const setBold = (bold) => ({
  type: 'SET_BOLD',
  bold
});

export const setItalic = (italic) => ({
  type: 'SET_ITALIC',
  italic
});

export const setColor = (color) => ({
  type: 'SET_COLOR',
  color
});

export const setFilter = (filter) => ({
  type: 'SET_FILTER',
  filter
});

export const selectImage = (image) => ({
  type: 'SELECT_IMAGE',
  image
});

export const setSize = (size) => ({
  type: 'SET_SIZE',
  size
});

export const setText = (text) => ({
  type: 'SET_TEXT',
  text
});

export const cacheDrawing = (drawing) => ({
  type: 'CACHE_DRAWING',
  drawing
});

export const setQuery = (query) => ({
  type: 'SET_QUERY',
  query
});


export const initialFetchImages = () => {
  return dispatch => {
    getPopularImages().then(images => {
      dispatch({ type: 'RECEIVE_IMAGES', images });
      dispatch(selectImage(images[0]));
    });
  };
};

export const searchImages = (query) => {
  return dispatch => {
    _searchImages(query).then(images => {
      dispatch({ type: 'RECEIVE_IMAGES', images });
    });
  };
};

export const resetSearch = () => {
  return dispatch => {
    getPopularImages().then(images => {
      dispatch({ type: 'RECEIVE_IMAGES', images });
    });
  };
};
