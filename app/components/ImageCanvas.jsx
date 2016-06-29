import React from 'react';
import {Canvas, CanvasRect, CanvasFilter, CanvasImage, CanvasText, CanvasOutline, CanvasLine} from './Canvas';

import {getImage} from 'util/imageCache';

import {findIdxForCursor, findPosForCursor, findCoordsForPos, findRectsForSelection} from 'util/text';
import TextEditor from 'util/textEditor';

const _ctx = document.createElement('canvas').getContext('2d');

const keys = {
  8:  'backspace',
  27: 'escape',
  37: 'arr_left',
  39: 'arr_right'
};

const SIZES = {
  tall: [500, 750],
  square: [500, 500],
  wide: [500, 250]
};

const getMousePos = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return mousePos;
};

const isInRect = (pos, rect) => {
  return (pos.x >= rect[0] && pos.x <= rect[0] + rect[2]) && (pos.y >= rect[1] && pos.y <= rect[1] + rect[3]);
};

const applyMouseDiff = (textRect, mouseDiff) => {
  return [textRect[0]-mouseDiff.x, textRect[1]-mouseDiff.y, textRect[2], textRect[3]];
};

// TODO:
// wait for image loading
export default React.createClass({
  initSize(size) {
    const obj = {};
    [obj.canvasWidth, obj.canvasHeight] = SIZES[size];
    const state = this.state;
    if (state.canvasWidth === obj.canvasWidth && state.canvasHeight === obj.canvasHeight) {
      return Promise.resolve();
    } else {
      return new Promise(resolve => {
        this.setState(obj, resolve);
      });
    }
  },

  loadImage(url) {
    return getImage(url).then(img => {
      this.setState({ image: img });
    });
  },

  componentWillReceiveProps(nextProps) {
    Promise.all([this.initSize(nextProps.size), this.loadImage(nextProps.image)]).then(() => {
      this.redraw(nextProps);
    });
  },

  getInitialState() {
    this.textEditor = new TextEditor(this);
    return {};
  },

  componentWillMount() {
    Promise.all([this.initSize(this.props.size), this.loadImage(this.props.image)]);
  },

  componentDidMount() {
    document.addEventListener('keypress', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
    this.textRect = [20, 20, this.state.canvasWidth - 40, this.state.canvasHeight - 40];
    window.requestAnimationFrame(this.doRedraw);

    setInterval(() => {
      if (this.state.isEditing) {
        this.textEditor.toggleCursor();
        window.requestAnimationFrame(this.doRedraw);
      }
    }, 450);
  },

  doRedraw() {
    this.redraw(this.props);
  },

  redraw(nextProps) {
    if (!nextProps) nextProps = this.props;

    this.forceUpdate();
    this.props.onRedraw && this.props.onRedraw(this.refs.canvas.refs.canvas.toDataURL('image/jpeg'));
  },

  cancelEditing() {
    this.setState({ isEditing: false });
    setTimeout(this.doRedraw, 50);
  },

  moveCursor(dir, shift) {
    this.textEditor.moveCursor(dir, shift);
    setTimeout(this.doRedraw, 50);
  },

  insertOrDeleteChar(char) {
    const newText = this.textEditor.insertOrDeleteChar(char);
    this.props.onTextChange(newText);
  },

  selectAll() {
    this.textEditor.selectAll();
    setTimeout(this.doRedraw, 150);
  },

  handleKeyDown(e) {
    if (this.state.isEditing) {
      if (e.which === 65 && e.metaKey === true) {
        e.preventDefault();
        return this.selectAll();
      }

      switch (keys[e.which]) {
        case 'escape':
          this.cancelEditing();
          break;
        case 'arr_left':
          this.moveCursor('left', e.shiftKey);
          break;
        case 'arr_right':
          this.moveCursor('right', e.shiftKey);
          break;
      }
    }
  },

  handleKeyUp(e) {
    if (e.keyIdentifier === 'Meta' || e.keyIdentifier === 'Alt' || e.keyIdentifier === 'Control') return;

    if (this.state.isEditing) {
      if (keys[e.which] === 'backspace') {
        this.insertOrDeleteChar();
      } else {
        let char = String.fromCharCode(e.charCode);
        if (!e.shiftKey) char = char.toLowerCase();
        if (e.keyCode === 13) char = '\n';
        this.insertOrDeleteChar(char);
      }
    }
  },

  handleMouseDown(e) {
    const mousePos = getMousePos(e, this.refs.canvas.refs.canvas);
    this.startPos = mousePos;

    const textRect = this.textRect;
    const isInTextRect = isInRect(mousePos, textRect);

    if (isInTextRect) {
      this.mouseHeld = true;
      if (this.state.isFocused) {
        this.mouseDown = new Date;
      }
      this.setState({ isFocused: true });
      setTimeout(this.doRedraw, 100);
    } else {
      this.setState({ isFocused: false, isEditing: false });
      setTimeout(this.doRedraw, 100);
    }
  },

  handleMouseMove(e) {
    if (this.mouseHeld) {
      // move

      const mousePos = getMousePos(e, this.refs.canvas.refs.canvas);

      const mouseDiff = {
        x: this.startPos.x - mousePos.x,
        y: this.startPos.y - mousePos.y
      };

      if (this.state.isFocused && !this.state.isEditing) {
        this.textRect = applyMouseDiff(this.textRect, mouseDiff);
        this.setState({ mouseDiff });
        this.startPos = mousePos;
      } else if (this.state.isFocused && this.state.isEditing) {
        const cursor1 = this.startPos;
        const cursor2 = mousePos;


        const canvas = this.refs.canvas.refs.canvas;
        const ctx = canvas.getContext('2d');
        const {textRect} = this;
        const {text, fontSize} = this.props;
        let idx1 = findIdxForCursor(ctx, textRect, cursor1, fontSize, text);
        let idx2 = findIdxForCursor(ctx, textRect, cursor2, fontSize, text);
        this.textEditor.cursor1 = idx1;
        this.textEditor.cursor2 = idx2;
      }

      setTimeout(this.doRedraw, 50);
    }
  },

  handleMouseUp(e) {
    if (this.mouseDown) {
      if ((new Date - this.mouseDown) < 200) {
        const canvas = this.refs.canvas.refs.canvas;
        const ctx = canvas.getContext('2d');
        const {textRect} = this;
        const {text, fontSize} = this.props;
        this.textEditor.cursor = findIdxForCursor(ctx, textRect, this.startPos, fontSize, text) || this.textEditor.cursor;
        this.setState({ isEditing: true });
        this.textEditor.cursor1 = null;
        this.textEditor.cursor2 = null;

        setTimeout(this.doRedraw, 50);
      }
    }
    this.setState({ mouseDiff: null });
    this.mouseDown = null;
    this.mouseHeld = false;
    setTimeout(this.doRedraw, 50);
  },

  getSelectionRects() {
    const {textEditor} = this;

    if (this.state.isEditing && textEditor.cursor1 && textEditor.cursor2) {
      const {fontSize, text} = this.props;
      const rects = findRectsForSelection(_ctx, this.textRect, textEditor.cursor1, textEditor.cursor2, fontSize, text);
      if (rects) {
        return rects.map((rect, i) => {
          const {x1,x2,y1,y2} = rect;
          return [x1, y1, x2-x1, y2-y1];
        });
      }
    }

    return [];
  },

  getCursorCoords(selRects = []) {
    const {textEditor} = this;

    if (this.state.isEditing && textEditor.showCursor && selRects.length === 0) {
      const {fontSize, text} = this.props;
      const pos = findPosForCursor(_ctx, textEditor.cursor, fontSize, text);
      if (pos) {
        return findCoordsForPos(_ctx, this.textRect, fontSize, text, pos);
      }
    }
  },

  render() {
    const image = this.props.image || {};
    const img = this.state.image;
    const {canvasWidth, canvasHeight, isFocused, isEditing} = this.state;
    const {contrast, fontSize, text} = this.props;
    const {textRect, mouseHeld, textEditor} = this;
    const mainFrame = [0, 0, canvasWidth, canvasHeight];

    const selectionRectFrames = this.getSelectionRects();
    const selectionRects = selectionRectFrames.map((frame, i) => {
      return <CanvasRect key={i} fill="rgba(87, 205, 255, 0.5)" frame={frame} />
    });

    const cursorCoords = this.getCursorCoords(selectionRectFrames);

    return <div className="ImageCanvas">
      <Canvas ref="canvas" width={canvasWidth} height={canvasHeight} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
        {img ?
          <CanvasImage image={img} frame={mainFrame} /> :
          null}
        {contrast ?
          <CanvasFilter frame={mainFrame} /> :
          null}
        {textRect ?
          <CanvasText ref="textRect" text={text} frame={textRect} fontSize={fontSize} onUpdateRect={newRect => this.textRect = newRect} /> :
          null}
        {textRect && isFocused ?
          <CanvasOutline width={2} frame={textRect} color={mouseHeld ? 'rgba(87, 205, 255, 0.5)' : '#0092d1'} /> :
          null}
        {cursorCoords ?
          <CanvasLine color="rgba(255, 255, 255, 0.75)" width={1} from={[cursorCoords.x, cursorCoords.y1]} to={[cursorCoords.x, cursorCoords.y2]} /> :
          null}
        {selectionRects}
      </Canvas>
    </div>
  }
});
