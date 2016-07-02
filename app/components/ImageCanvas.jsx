import React from 'react';
import {Canvas, CanvasRect, CanvasFilter, CanvasImage, CanvasText, CanvasOutline, CanvasLine} from './Canvas';
import {getImage} from 'utils/imageCache';
import {rectCenter, isInRect, pointDiff} from 'utils/pixels';
import Spinner from './Spinner';
import TextBox from './TextBox';

const makeBlue = (alpha) => `rgba(87, 205, 255, ${alpha})`;

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
    this.bodyBox = new TextBox('body', {
      cancelEditing: () => this.props.onCancelEdit(),
      setFocus: () => this.props.onFocus('body'),
      setEditing: () => this.props.onEdit(),
      moveRect: (newRect) => this.props.onTextRectMove(newRect),
      getProps: () => this.props.body,
      getArea: () => this.refs.txt,
      getFocusState: () => this.props
    });
    return {};
  },

  componentWillMount() {
    Promise.all([this.initSize(this.props.size), this.loadImage(this.props.image)]);
  },

  componentDidMount() {
    window.requestAnimationFrame(this.doRedraw);

    setInterval(() => {
      if (this.props.isEditing) {
        const textEditor = this.getTextEditor();
        if (!textEditor) return;
        textEditor.toggleCursor();
        window.requestAnimationFrame(this.doRedraw);
      }
    }, 450);
  },

  getTextEditor() {
    return this.bodyBox.textEditor;
  },

  doRedraw() {
    this.redraw(this.props);
  },

  redraw(nextProps) {
    if (!nextProps) nextProps = this.props;
    this.forceUpdate();
  },

  updateCursor(e) {
    this.bodyBox.updateCursor(e);
    setTimeout(this.doRedraw, 0);
  },

  setNoFocus() {
    this.props.onBlur();
  },

  getClickRegions() {
    const bodyRegions = this.bodyBox.getClickRegions();

    return Object.keys(bodyRegions).reduce((memo, key) => {
      memo['body__' + key] = bodyRegions[key];
      return memo;
    }, {});
  },

  getMousePos(e) {
    return getMousePos(e, this.refs.canvas.refs.canvas);
  },

  findRegionUnderPos(mousePos) {
    const clickRegions = this.getClickRegions();
    return Object.keys(clickRegions).find(name => {
      const rect = clickRegions[name];
      if (!rect) return;
      return isInRect(mousePos, rect);
    });
  },

  handleMouseDown(e) {
    const mousePos = this.getMousePos(e);
    const pointedRegion = this.findRegionUnderPos(mousePos);

    if (!pointedRegion) {
      return this.setNoFocus();
    }

    const [area, sub] = pointedRegion.split('__');

    this._mouseArea = area + 'Box';
    this[this._mouseArea].handleMouseDown(e, mousePos, sub);
    setTimeout(this.doRedraw, 0);
  },

  handleMouseMove(e) {
    const {_mouseArea} = this;
    if (!_mouseArea) return;
    const mousePos = this.getMousePos(e);
    this[_mouseArea].handleMouseMove(e, mousePos);
    setTimeout(this.doRedraw, 0);
  },

  handleMouseUp(e) {
    const {_mouseArea} = this;
    if (!_mouseArea) return;
    this[_mouseArea].handleMouseUp(e);
    this._mouseArea = null;
    setTimeout(this.doRedraw, 0);
  },

  getGuidePoints() {
    const {canvasWidth, canvasHeight} = this.state;

    const horizontal = [[0, canvasHeight / 2], [canvasWidth, canvasHeight / 2]];
    const vertical = [[canvasWidth / 2, 0], [canvasWidth / 2, canvasHeight]];

    return {horizontal, vertical};
  },

  closeToGuides(part) {
    const {canvasWidth, canvasHeight} = this.state;
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
    const img = this.state.image;
    if (!img) {
      return <div className="ImageCanvas">
        <Spinner />
      </div>;
    }

    const {canvasWidth, canvasHeight} = this.state;
    const {filter, isFocused} = this.props;
    const {text} = this.props.body;
    const mainFrame = [0, 0, canvasWidth, canvasHeight];

    const {horizontal: horizontalGuidePoints, vertical: verticalGuidePoints} = this.getGuidePoints();
    const {horizontal: showHorizontalGuide, vertical: showVerticalGuide} = isFocused ? this.closeToGuides(isFocused) : {};

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
        {this.bodyBox.render()}
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
