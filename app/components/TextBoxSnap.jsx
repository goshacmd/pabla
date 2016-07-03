import React from 'react';
import {CanvasRect} from './Canvas';
import {shrinkRect} from 'utils/pixels';

const MIN_TEXT_WIDTH = 100;

export default React.createClass({
  propTypes: {
    frame: React.PropTypes.array.isRequired,
    textRect: React.PropTypes.array.isRequired,
    color: React.PropTypes.string.isRequired,
    direction: React.PropTypes.oneOf(['left', 'right']),
    onMove: React.PropTypes.func.isRequired
  },

  handleResizeStart(e, mousePos) {
    this.startPos = mousePos;
    this.mouseHeld = true;
  },

  handleResizeMove(e, mousePos) {
    if (!this.mouseHeld) return;

    const {startPos} = this;
    const mouseDiff = {
      x: startPos.x - mousePos.x,
      y: startPos.y - mousePos.y
    };
    // resize text
    const rect = this.props.textRect;
    const newRect = shrinkRect(rect, this.props.direction, mouseDiff.x);
    if (newRect[2] <= MIN_TEXT_WIDTH) return;
    this.props.onMove(newRect);
    this.startPos = mousePos;
  },

  handleResizeEnd() {
    this.mouseHeld = false;
  },

  render() {
    const {frame, color} = this.props;

    return <CanvasRect
      frame={frame}
      fill={color}
      mouseSnap={true}
      onMouseDown={this.handleResizeStart}
      onMouseMove={this.handleResizeMove}
      onMouseUp={this.handleResizeEnd} />;
  }
});
