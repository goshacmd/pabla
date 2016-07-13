import React from 'react';
import {CanvasRect, CanvasFilter, CanvasImage, CanvasText, CanvasOutline, CanvasLine, CanvasGroup} from './Canvas';
import Snap from './TextBoxSnap';
import Cursor from './TextBoxCursor';
import {findIdxForCursor, findPosForCursor, findCoordsForPos, findRectsForSelection} from 'utils/text';
import {keys} from 'utils/keyboard';
import {rectCenter, moveRect} from 'utils/pixels';

const _ctx = document.createElement('canvas').getContext('2d');

const makeBlue = (alpha) => `rgba(87, 205, 255, ${alpha})`;

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string.isRequired,
    textAttrs: React.PropTypes.object.isRequired,
    textRect: React.PropTypes.array.isRequired,
    focusedPart: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.bool]).isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    part: React.PropTypes.string.isRequired,
    cancelEditing: React.PropTypes.func.isRequired,
    setFocus: React.PropTypes.func.isRequired,
    moveRect: React.PropTypes.func.isRequired
  },

  getCursors() {
    return this.props.selection;
  },

  getSnapFrames() {
    const rect = this.props.textRect;
    const [x, y, w, h] = rect;
    const size = 15;
    const {y: yCenter} = rectCenter(rect);
    const left = [x - size/2, yCenter - size/2, size, size];
    const right = [x + w - size/2, yCenter - size/2, size, size];

    return {left, right};
  },

  getSelectionRects() {
    const {textRect, textAttrs, text} = this.props;
    const {cursor1, cursor2} = this.getCursors();
    const {isEditing} = this.getFocusState();

    if (isEditing && cursor1 >= 0 && cursor2 >= 0) {
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
    const {textRect, textAttrs, text} = this.props;
    const {cursor} = this.getCursors();
    const {isEditing} = this.getFocusState();

    if (isEditing && selRects.length === 0) {
      const pos = findPosForCursor(_ctx, cursor, textRect, textAttrs, text);
      if (pos) {
        return findCoordsForPos(_ctx, textRect, textAttrs, text, pos);
      }
    }
  },

  getFocusState() {
    const {focusedPart, isEditing} = this.props;
    return {
      isFocused: focusedPart === this.props.part,
      isEditing: focusedPart === this.props.part && isEditing
    };
  },

  cancelEdit(e) {
    if (keys[e.which] === 'escape') {
      this.props.cancelEditing();
      e.target.blur();
    }
  },

  handleMouseDown(e, mousePos, sub) {
    this.startPos = mousePos;

    this.mouseHeld = true;
    if (this.getFocusState().isFocused) {
      this.mouseDown = new Date;
    }
    this.props.setFocus();
  },

  handleMouseMove(e, mousePos) {
    if (!this.mouseHeld) return;

    const {startPos} = this;
    const mouseDiff = {
      x: startPos.x - mousePos.x,
      y: startPos.y - mousePos.y
    };

    const {isFocused, isEditing} = this.getFocusState();

    if (isFocused && !isEditing && !this.snap) {
      // drag text box
      const {textRect} = this.props;
      const newRect = moveRect(textRect, mouseDiff);
      this.props.moveRect(newRect);
      this.startPos = mousePos;
    } else if (isFocused && isEditing) {
      //select text
      const cursor1 = startPos;
      const cursor2 = mousePos;

      const {textRect, textAttrs, text} = this.props;
      let idx1 = findIdxForCursor(_ctx, textRect, cursor1, textAttrs, text);
      let idx2 = findIdxForCursor(_ctx, textRect, cursor2, textAttrs, text);
      this.props.onAreaSelection(idx1, idx2);
    }
  },

  handleMouseUp(e) {
    if (this.mouseDown && (new Date - this.mouseDown) < 200) {
      const {startPos} = this;
      const {text, textAttrs, textRect} = this.props;
      const cursor = findIdxForCursor(_ctx, textRect, startPos, textAttrs, text);
      this.props.onSetCursor(cursor);
      this.props.setEditing();
      this.props.onEditEnter();
    }

    this.mouseDown = null;
    this.mouseHeld = false;
  },

  render() {
    const {isFocused, isEditing} = this.getFocusState();
    const {text, textAttrs, textRect} = this.props;
    const {mouseHeld} = this;

    const selectionRectFrames = this.getSelectionRects();
    const selectionRects = selectionRectFrames.map((frame, i) => {
      return <CanvasRect key={i} fill={makeBlue(0.5)} frame={frame} />;
    });

    const {left: leftSnapFrame, right: rightSnapFrame} = this.getSnapFrames();
    const cursorCoords = this.getCursorCoords(selectionRects);
    const outlineColor = mouseHeld ? makeBlue(0.5) : '#0092d1';

    // invisible rect to allow text selection/dragging
    return <CanvasGroup>
      <CanvasRect
        frame={textRect}
        fill="rgba(0,0,0,0)"
        mouseSnap={true}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp} />
      {isFocused ?
        <Snap frame={leftSnapFrame} textRect={textRect} color={outlineColor} direction="left" onMove={this.props.moveRect} /> :
        null}
      {isFocused ?
        <Snap frame={rightSnapFrame} textRect={textRect} color={outlineColor} direction="right" onMove={this.props.moveRect} /> :
        null}
      <CanvasText text={text} frame={textRect} textAttrs={textAttrs} onUpdateRect={this.props.moveRect} />
      {isFocused ?
        <CanvasOutline width={2} frame={textRect} color={outlineColor} /> :
        null}
      {cursorCoords && isEditing ?
        <Cursor coords={cursorCoords} /> :
        null}
      {isEditing ? selectionRects : null}
    </CanvasGroup>;
  }
});
