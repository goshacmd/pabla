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
    if (!url) return Promise.resolve();
    if (this.props.image !== url) this.setState({ image: null });
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
  },

  cancelEditing() {
    this.setState({ isEditing: false });
  },

  updateCursor(e) {
    if (keys[e.which] === 'escape') {
      this.cancelEditing();
      e.target.blur();
    }

    const {selectionStart, selectionEnd} = this.refs.txt;
    this.textEditor.setFromInput(selectionStart, selectionEnd);

    setTimeout(this.doRedraw, 0);
  },

  setFocus() {
    this.setState({ isFocused: true });
  },

  setNoFocus() {
    this.setState({ isFocused: false, isEditing: false });
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
      this.setFocus();
    } else {
      this.setNoFocus();
    }
  },

  handleMouseMove(e) {
    if (this.mouseHeld) {
      // move

      const canvas = this.refs.canvas.refs.canvas;
      const ctx = canvas.getContext('2d');

      const {startPos} = this;
      const mousePos = getMousePos(e, canvas);

      const mouseDiff = {
        x: startPos.x - mousePos.x,
        y: startPos.y - mousePos.y
      };

      const {isFocused, isEditing} = this.state;

      if (isFocused && !isEditing) {
        this.textRect = applyMouseDiff(this.textRect, mouseDiff);
        this.setState({ mouseDiff });
        this.startPos = mousePos;
      } else if (isFocused && isEditing) {
        const cursor1 = startPos;
        const cursor2 = mousePos;

        const {textRect} = this;
        const {text, fontSize} = this.props;
        let idx1 = findIdxForCursor(ctx, textRect, cursor1, fontSize, text);
        let idx2 = findIdxForCursor(ctx, textRect, cursor2, fontSize, text);
        this.textEditor.setSelection(idx1, idx2, this.refs.txt);
      }

      setTimeout(this.doRedraw, 0);
    }
  },

  handleMouseUp(e) {
    const canvas = this.refs.canvas.refs.canvas;
    const ctx = canvas.getContext('2d');

    if (this.mouseDown) {
      if ((new Date - this.mouseDown) < 200) {
        const {textRect, startPos} = this;
        const {text, fontSize} = this.props;
        const cursor = findIdxForCursor(ctx, textRect, startPos, fontSize, text);
        this.textEditor.setCursor(cursor, this.refs.txt);
        this.setState({ isEditing: true });
        this.refs.txt.focus();
      }
    }

    this.setState({ mouseDiff: null });
    this.mouseDown = null;
    this.mouseHeld = false;
  },

  getSelectionRects() {
    const {textEditor, textRect} = this;
    const {cursor1, cursor2} = textEditor;

    if (this.state.isEditing && cursor1 >= 0 && cursor2 >= 0) {
      const {fontSize, text} = this.props;
      const rects = findRectsForSelection(_ctx, textRect, cursor1, cursor2, fontSize, text);
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
    const {textEditor, textRect} = this;
    const {cursor, showCursor} = textEditor;

    if (this.state.isEditing && showCursor && selRects.length === 0) {
      const {fontSize, text} = this.props;
      const pos = findPosForCursor(_ctx, cursor, fontSize, text);
      if (pos) {
        return findCoordsForPos(_ctx, textRect, fontSize, text, pos);
      }
    }
  },

  render() {
    const img = this.state.image;
    const {canvasWidth, canvasHeight, isFocused, isEditing} = this.state;
    const {filter, fontSize, text} = this.props;
    const {textRect, mouseHeld, textEditor} = this;
    const mainFrame = [0, 0, canvasWidth, canvasHeight];

    const selectionRectFrames = this.getSelectionRects();
    const selectionRects = selectionRectFrames.map((frame, i) => {
      return <CanvasRect key={i} fill="rgba(87, 205, 255, 0.5)" frame={frame} />
    });

    const cursorCoords = this.getCursorCoords(selectionRectFrames);

    return <div className="ImageCanvas">
      <Canvas
        ref="canvas"
        width={canvasWidth}
        height={canvasHeight}
        onRedraw={this.props.onRedraw}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}>
        {img ?
          <CanvasImage image={img} frame={mainFrame} /> :
          null}
        <CanvasFilter filter={filter} frame={mainFrame} />
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

      <textarea ref='txt' value={text} onChange={e => this.props.onTextChange(e.target.value)} onKeyUp={this.updateCursor} style={{height: 1, width: 1, opacity: 0}} />
    </div>
  }
});
