import Container from './Container';
import createCanvasComponent from './createCanvasComponent';

export const CanvasRect = createCanvasComponent('CanvasRect', (props) => Object.assign({ type: 'rect' }, props));
export const CanvasFilter = createCanvasComponent('CanvasFilter', (props) => Object.assign({ type: 'filter' }, props));
export const CanvasImage = createCanvasComponent('CanvasImage', (props) => Object.assign({ type: 'image' }, props));
export const CanvasText = createCanvasComponent('CanvasText', (props) => Object.assign({ type: 'text' }, props));
export const CanvasOutline = createCanvasComponent('CanvasOutline', (props) => Object.assign({ type: 'outline' }, props));
export const CanvasLine = createCanvasComponent('CanvasLine', (props) => Object.assign({ type: 'line' }, props));
export const Canvas = Container;
