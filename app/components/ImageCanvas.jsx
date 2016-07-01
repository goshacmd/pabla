import React from 'react';
import {Canvas, CanvasRect, CanvasFilter, CanvasImage, CanvasText, CanvasOutline, CanvasLine} from './Canvas';
import Spinner from './Spinner';

import {getImage} from 'util/imageCache';

import {findIdxForCursor, findPosForCursor, findCoordsForPos, findRectsForSelection} from 'util/text';
import TextEditor from 'util/textEditor';

const _ctx = document.createElement('canvas').getContext('2d');

const makeBlue = (alpha) => `rgba(87, 205, 255, ${alpha})`;

const rectCenter = ([x, y, w, h]) => {
  return { x: x + w/2, y: y + h/2 };
};

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
    return {
      textRect: [20, 20, 500 - 40, 500 - 40]
    };
  },

  componentWillMount() {
    Promise.all([this.initSize(this.props.size), this.loadImage(this.props.image)]);
  },

  componentDidMount() {
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

  setEditing() {
    this.setState({ isFocused: true, isEditing: true });
  },

  setNoFocus() {
    this.setState({ isFocused: false, isEditing: false });
  },

  handleMouseDown(e) {
    const mousePos = getMousePos(e, this.refs.canvas.refs.canvas);
    this.startPos = mousePos;

    const {left, right} = this.getSnapFrames();

    const textRect = this.state.textRect;
    const isInTextRect = isInRect(mousePos, textRect);
    const isInLeftSnap = isInRect(mousePos, left);
    const isInRightSnap = isInRect(mousePos, right);

    if (isInTextRect && !isInLeftSnap && !isInRightSnap) {
      this.mouseHeld = true;
      if (this.state.isFocused) {
        this.mouseDown = new Date;
      }
      this.setFocus();
    } else if (isInLeftSnap) {
      this.mouseHeld = true;
      this.snap = 'left';
    } else if (isInRightSnap) {
      this.mouseHeld = true;
      this.snap = 'right';
    } else {
      this.setNoFocus();
    }
  },

  handleMouseMove(e) {
    if (!this.mouseHeld) return;

    // move
    const {startPos} = this;
    const mousePos = getMousePos(e, this.refs.canvas.refs.canvas);

    const mouseDiff = {
      x: startPos.x - mousePos.x,
      y: startPos.y - mousePos.y
    };

    const {isFocused, isEditing} = this.state;

    if (isFocused && !isEditing && !this.snap) {
      // drag text box
      const newRect = applyMouseDiff(this.state.textRect, mouseDiff);
      this.setState({ textRect: newRect });
      this.mouseDiff = mouseDiff;
      this.startPos = mousePos;
    } else if (this.snap) {
      // resize text
      const [x, y, w, h] = this.state.textRect;
      let newRect = this.snap === 'left' ?
        [x - mouseDiff.x, y, w + mouseDiff.x, h] :
        [x, y, w - mouseDiff.x, h];
      this.setState({ textRect: newRect });
      this.mouseDiff = mouseDiff;
      this.startPos = mousePos;
    } else if (isFocused && isEditing) {
      // selct text
      const cursor1 = startPos;
      const cursor2 = mousePos;

      const {textRect} = this.state;
      const {text, textAttrs} = this.props;
      let idx1 = findIdxForCursor(_ctx, textRect, cursor1, textAttrs, text);
      let idx2 = findIdxForCursor(_ctx, textRect, cursor2, textAttrs, text);
      this.textEditor.setSelection(idx1, idx2, this.refs.txt);
    }

    setTimeout(this.doRedraw, 0);
  },

  handleMouseUp(e) {
    if (this.mouseDown && (new Date - this.mouseDown) < 200 && !this.snap) {
      const {startPos} = this;
      const {textRect} = this.state;
      const {text, textAttrs} = this.props;
      const cursor = findIdxForCursor(_ctx, textRect, startPos, textAttrs, text);
      this.textEditor.setCursor(cursor, this.refs.txt);
      this.setEditing();
      this.refs.txt.focus();
    }

    this.mouseDiff = null;
    this.mouseDown = null;
    this.mouseHeld = false;
    this.snap = null
    setTimeout(this.doRedraw, 0);
  },

  getSelectionRects() {
    const {textEditor} = this;
    const {textRect} = this.state;
    const {cursor1, cursor2} = textEditor;

    if (this.state.isEditing && cursor1 >= 0 && cursor2 >= 0) {
      const {textAttrs, text} = this.props;
      const rects = findRectsForSelection(_ctx, textRect, cursor1, cursor2, textAttrs, text);
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
    const {textRect} = this.state;
    const {cursor, showCursor} = textEditor;

    if (this.state.isEditing && showCursor && selRects.length === 0) {
      const {textAttrs, text} = this.props;
      const pos = findPosForCursor(_ctx, cursor, textRect, textAttrs, text);
      if (pos) {
        return findCoordsForPos(_ctx, textRect, textAttrs, text, pos);
      }
    }
  },

  getSnapFrames() {
    const [x, y, w, h] = this.state.textRect;
    const size = 15;
    const {y: yCenter} = rectCenter([x, y, w, h]);
    const left = [x - size/2, yCenter - size/2, size, size];
    const right = [x + w - size/2, yCenter - size/2, size, size];

    return {left, right};
  },

  getGuidePoints() {
    const {canvasWidth, canvasHeight} = this.state;

    const horizontal = [[0, canvasHeight / 2], [canvasWidth, canvasHeight / 2]];
    const vertical = [[canvasWidth / 2, 0], [canvasWidth / 2, canvasHeight]];

    return {horizontal, vertical};
  },

  closeToGuides() {
    const {canvasWidth, canvasHeight, isFocused} = this.state;

    if (!isFocused) return { horizontal: false, vertical: false };

    const {x: xCenter, y: yCenter} = rectCenter(this.state.textRect);

    const xDiff = canvasWidth/2 - xCenter;
    const yDiff = canvasHeight/2 - yCenter;

    return {
      horizontal: yDiff >= -1 && yDiff <= 1,
      vertical: xDiff >= -1 && xDiff <= 1,
    };
  },

  render() {
    const img = this.state.image;
    if (!img) {
      return <div className="ImageCanvas">
        <Spinner />
      </div>;
    }

    const {canvasWidth, canvasHeight, isFocused, isEditing, textRect} = this.state;
    const {filter, textAttrs, text} = this.props;
    const {mouseHeld, textEditor} = this;
    const mainFrame = [0, 0, canvasWidth, canvasHeight];

    const selectionRectFrames = this.getSelectionRects();
    const selectionRects = selectionRectFrames.map((frame, i) => {
      return <CanvasRect key={i} fill={makeBlue(0.5)} frame={frame} />
    });

    const {left: leftSnapFrame, right: rightSnapFrame} = this.getSnapFrames();
    const {horizontal: horizontalGuidePoints, vertical: verticalGuidePoints} = this.getGuidePoints();
    const {horizontal: showHorizontalGuide, vertical: showVerticalGuide} = this.closeToGuides();

    const cursorCoords = this.getCursorCoords(selectionRectFrames);

    const updateTextRect = newRect => {
      this.setState({ textRect: newRect });
    };

    const outlineColor = mouseHeld ? makeBlue(0.5) : '#0092d1';

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
        {showHorizontalGuide ?
          <CanvasLine color={makeBlue(0.85)} width={2} from={horizontalGuidePoints[0]} to={horizontalGuidePoints[1]} /> :
          null}
        {showVerticalGuide ?
          <CanvasLine color={makeBlue(0.85)} width={2} from={verticalGuidePoints[0]} to={verticalGuidePoints[1]} /> :
          null}
        {textRect && isFocused ? <CanvasRect frame={leftSnapFrame} fill={outlineColor} /> : null}
        {textRect && isFocused ? <CanvasRect frame={rightSnapFrame} fill={outlineColor} /> : null}
        {textRect ?
          <CanvasText ref="textRect" text={text} frame={textRect} textAttrs={textAttrs} onUpdateRect={updateTextRect} /> :
          null}
        {textRect && isFocused ?
          <CanvasOutline width={2} frame={textRect} color={outlineColor} /> :
          null}
        {cursorCoords ?
          <CanvasLine color="rgba(255, 255, 255, 0.75)" width={1} from={[cursorCoords.x, cursorCoords.y1]} to={[cursorCoords.x, cursorCoords.y2]} /> :
          null}
        {selectionRects}
      </Canvas>

      <textarea
        ref="txt"
        value={text}
        onChange={e => this.props.onTextChange(e.target.value)}
        onKeyUp={this.updateCursor}
        onFocus={this.setEditing}
        style={{height: 1, width: 1, opacity: 0}} />
    </div>
  }
});
