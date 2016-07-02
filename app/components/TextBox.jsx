import React from 'react';
import {CanvasRect, CanvasFilter, CanvasImage, CanvasText, CanvasOutline, CanvasLine} from './Canvas';
import TextEditor from 'utils/textEditor';
import {findIdxForCursor, findPosForCursor, findCoordsForPos, findRectsForSelection} from 'utils/text';
import {keys} from 'utils/keyboard';
import {rectCenter, moveRect, shrinkRect} from 'utils/pixels';

const _ctx = document.createElement('canvas').getContext('2d');

const MIN_TEXT_WIDTH = 100;

const makeBlue = (alpha) => `rgba(87, 205, 255, ${alpha})`;

export default class TextBox {
  constructor(part, hooks) {
    this._part = part;
    this.textEditor = new TextEditor();
    this.hooks = hooks;
  }

  getProps() {
    return this.hooks.getProps();
  }

  getSnapFrames() {
    const rect = this.getProps().textRect;
    const [x, y, w, h] = rect;
    const size = 15;
    const {y: yCenter} = rectCenter(rect);
    const left = [x - size/2, yCenter - size/2, size, size];
    const right = [x + w - size/2, yCenter - size/2, size, size];

    return {left, right};
  }

  getClickRegions() {
    const {textRect} = this.getProps();

    const {left, right} = this.getSnapFrames();

    return {
      leftSnap: left,
      rightSnap: right,
      rect: textRect
    };
  }

  getSelectionRects() {
    const {textRect, textAttrs, text} = this.getProps();
    const {cursor1, cursor2} = this.textEditor;
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
  }

  getCursorCoords(selRects = []) {
    const {textRect, textAttrs, text} = this.getProps();
    const {cursor, showCursor} = this.textEditor;
    const {isEditing} = this.getFocusState();

    if (isEditing && showCursor && selRects.length === 0) {
      const pos = findPosForCursor(_ctx, cursor, textRect, textAttrs, text);
      if (pos) {
        return findCoordsForPos(_ctx, textRect, textAttrs, text, pos);
      }
    }
  }

  getFocusState() {
    const {isFocused, isEditing} = this.hooks.getFocusState();
    return {
      isFocused: isFocused === this._part,
      isEditing: isFocused === this._part && isEditing
    };
  }

  getLinkedArea() {
    return this.hooks.getArea();
  }

  updateCursor(e) {
    if (keys[e.which] === 'escape') {
      this.hooks.cancelEditing();
      e.target.blur();
    }

    const txt = this.getLinkedArea();
    const {selectionStart, selectionEnd} = txt;

    this.textEditor.setFromInput(selectionStart, selectionEnd);
  }

  handleMouseDown(e, mousePos, sub) {
    this.startPos = mousePos;

    if (sub === 'rect') {
      this.mouseHeld = true;
      if (this.getFocusState().isFocused) {
        this.mouseDown = new Date;
      }
      this.hooks.setFocus();
    } else if (sub === 'leftSnap') {
      this.mouseHeld = true;
      this.snap = 'left';
    } else if (sub === 'rightSnap') {
      this.mouseHeld = true;
      this.snap = 'right';
    }
  }

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
      const {textRect} = this.getProps();
      const newRect = moveRect(textRect, mouseDiff);
      this.hooks.moveRect(newRect);
      this.startPos = mousePos;
    } else if (this.snap) {
      // resize text
      const rect = this.getProps().textRect;
      const newRect = shrinkRect(rect, this.snap, mouseDiff.x);
      if (newRect[2] <= MIN_TEXT_WIDTH) return;
      this.hooks.moveRect(newRect);
      this.startPos = mousePos;
    } else if (isFocused && isEditing) {
      //select text
      const cursor1 = startPos;
      const cursor2 = mousePos;

      const {textRect, textAttrs, text} = this.getProps();
      let idx1 = findIdxForCursor(_ctx, textRect, cursor1, textAttrs, text);
      let idx2 = findIdxForCursor(_ctx, textRect, cursor2, textAttrs, text);
      this.textEditor.setSelection(idx1, idx2, this.getLinkedArea());
    }
  }

  handleMouseUp(e) {
    if (this.mouseDown && (new Date - this.mouseDown) < 200 && !this.snap) {
      const {startPos} = this;
      const {text, textAttrs, textRect} = this.getProps();
      const cursor = findIdxForCursor(_ctx, textRect, startPos, textAttrs, text);
      this.textEditor.setCursor(cursor, this.getLinkedArea());
      this.hooks.setEditing();
      this.getLinkedArea().focus();
    }

    this.mouseDown = null;
    this.mouseHeld = false;
    this.snap = null;
  }

  render() {
    const {isFocused, isEditing} = this.getFocusState();
    const {text, textAttrs, textRect} = this.getProps();
    const {mouseHeld} = this;

    const selectionRectFrames = this.getSelectionRects();
    const selectionRects = selectionRectFrames.map((frame, i) => {
      return <CanvasRect key={i} fill={makeBlue(0.5)} frame={frame} />;
    });

    const {left: leftSnapFrame, right: rightSnapFrame} = this.getSnapFrames();
    const cursorCoords = this.getCursorCoords(selectionRects);
    const outlineColor = mouseHeld ? makeBlue(0.5) : '#0092d1';

    const updateTextRect = newRect => {
      this.hooks.moveRect(newRect);
    };

    return [
      textRect && isFocused ? <CanvasRect frame={leftSnapFrame} fill={outlineColor} /> : null,
      textRect && isFocused ? <CanvasRect frame={rightSnapFrame} fill={outlineColor} /> : null,
      textRect ?
        <CanvasText ref="textRect" text={text} frame={textRect} textAttrs={textAttrs} onUpdateRect={updateTextRect} /> :
        null,
      textRect && isFocused ?
        <CanvasOutline width={2} frame={textRect} color={outlineColor} /> :
        null,
      cursorCoords && isEditing ?
        <CanvasLine color="rgba(255, 255, 255, 0.75)" width={1} from={[cursorCoords.x, cursorCoords.y1]} to={[cursorCoords.x, cursorCoords.y2]} /> :
        null,
      isEditing ? selectionRects : null
    ];
  }
}
