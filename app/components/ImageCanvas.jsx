import React from 'react';
import ReactDOM from 'react-dom';
import {Canvas, CanvasRect, CanvasFilter, CanvasText, CanvasImage, CanvasOutline, CanvasLine} from './Canvas';
import {rectCenter, pointDiff} from 'utils/pixels';
import Spinner from './Spinner';
import TextBox from './TextBox';
import computeDimensions from './computeImageDimensions';
import loadImage from './loadImage';

const makeBlue = (alpha) => `rgba(87, 205, 255, ${alpha})`;

const ImageCanvas = React.createClass({
  redraw() {
    this.forceUpdate();
  },

  updateCursor(e) {
    this.refs.bodyBox.updateCursor(e);
    setTimeout(this.redraw, 0);
  },

  setNoFocus() {
    this.props.onBlur();
  },

  handleClickOnImage(e, mousePos) {
    this.setNoFocus();
  },

  getGuidePoints() {
    const {canvasWidth, canvasHeight} = this.props;

    const horizontal = [[0, canvasHeight / 2], [canvasWidth, canvasHeight / 2]];
    const vertical = [[canvasWidth / 2, 0], [canvasWidth / 2, canvasHeight]];

    return {horizontal, vertical};
  },

  closeToGuides(part) {
    const {canvasWidth, canvasHeight} = this.props;
    const {isFocused} = this.props;

    if (!isFocused) return { horizontal: false, vertical: false };

    const rect = this.props[part].textRect;

    const textCenter = rectCenter(rect);
    const canvasCenter = { x: canvasWidth/2, y: canvasHeight/2 };
    const {xDiff, yDiff} = pointDiff(canvasCenter, textCenter);

    return {
      horizontal: yDiff >= -1 && yDiff <= 1,
      vertical: xDiff >= -1 && xDiff <= 1,
    };
  },

  render() {
    if (!this.props.image) {
      return <div className="ImageCanvas">
        <Spinner />
      </div>;
    }

    const {canvasWidth, canvasHeight} = this.props;
    const {filter, isFocused} = this.props;
    const {image} = this.props;
    const {text} = this.props.body;
    const mainFrame = [0, 0, canvasWidth, canvasHeight];

    const {horizontal: horizontalGuidePoints, vertical: verticalGuidePoints} = this.getGuidePoints();
    const {horizontal: showHorizontalGuide, vertical: showVerticalGuide} = isFocused ? this.closeToGuides(isFocused) : {};

    return <div className="ImageCanvas">
      <Canvas
        ref="canvas"
        width={canvasWidth}
        height={canvasHeight}
        onRedraw={this.props.onRedraw}>
        <CanvasImage image={image} frame={mainFrame} onMouseDown={this.handleClickOnImage} />
        <CanvasFilter filter={filter} frame={mainFrame} />
        {showHorizontalGuide ?
          <CanvasLine color={makeBlue(0.85)} width={2} from={horizontalGuidePoints[0]} to={horizontalGuidePoints[1]} /> :
          null}
        {showVerticalGuide ?
          <CanvasLine color={makeBlue(0.85)} width={2} from={verticalGuidePoints[0]} to={verticalGuidePoints[1]} /> :
          null}
        <TextBox
          ref="bodyBox"
          part="body"
          cancelEditing={this.props.onCancelEdit}
          setEditing={this.props.onEdit}
          setFocus={this.props.onFocus.bind(this, 'body')}
          moveRect={this.props.onTextRectMove.bind(this)}
          textRect={this.props.body.textRect}
          textAttrs={this.props.body.textAttrs}
          text={this.props.body.text}
          getArea={() => this.refs.txt}
          focusedPart={this.props.isFocused}
          isEditing={this.props.isEditing} />
      </Canvas>

      <textarea
        ref="txt"
        value={text}
        onChange={e => this.props.onTextChange(e.target.value)}
        onKeyUp={this.updateCursor}
        style={{height: 1, width: 1, opacity: 0}} />
    </div>
  }
});

export default computeDimensions(loadImage(ImageCanvas));
