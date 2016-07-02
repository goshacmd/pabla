import {getPopularImages} from 'utils/unsplash';

const images = getPopularImages();

const initialState = {
  filter: 'light_contrast',
  availableImages: [],
  selectedImage: null,
  query: "",
  drawing: null,
  size: 'square',
  text: '“Others have seen what is and asked why. I have seen what could be and asked why not.”\n- Pablo Picasso',
  textAttrs: {
    fontSize: 32,
    color: 'white',
    font: 'Georgia',
    bold: false,
    italic: false,
    lineHeight: 1.35
  }
};

export default function(state = initialState, action) {
  let textAttrs;
  switch (action.type) {
    case 'SET_FONT':
      textAttrs = Object.assign({}, state.textAttrs, { font: action.font });
      return Object.assign({}, state, { textAttrs });
    case 'SET_FONT_SIZE':
      textAttrs = Object.assign({}, state.textAttrs, { fontSize: action.size });
      return Object.assign({}, state, { textAttrs });
    case 'SET_BOLD':
      textAttrs = Object.assign({}, state.textAttrs, { bold: action.bold });
      return Object.assign({}, state, { textAttrs });
    case 'SET_ITALIC':
      textAttrs = Object.assign({}, state.textAttrs, { italic: action.italic });
      return Object.assign({}, state, { textAttrs });
    case 'SET_COLOR':
      textAttrs = Object.assign({}, state.textAttrs, { color: action.color });
      return Object.assign({}, state, { textAttrs });
    case 'SET_FILTER':
      return Object.assign({}, state, { filter: action.filter });
    case 'SELECT_IMAGE':
      return Object.assign({}, state, { selectedImage: action.image });
    case 'SET_SIZE':
      return Object.assign({}, state, { size: action.size });
    case 'SET_TEXT':
      return Object.assign({}, state, { text: action.text });
    case 'CACHE_DRAWING':
      return Object.assign({}, state, { drawing: action.drawing });
    case 'RECEIVE_IMAGES':
      return Object.assign({}, state, { availableImages: action.images });
    case 'SET_QUERY':
      return Object.assign({}, state, { query: action.query });
    default:
      return state;
  }
}
