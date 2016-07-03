import React from 'react';
import {CanvasLine} from './Canvas';

export default React.createClass({
  propTypes: {
    coords: React.PropTypes.shape({
      x: React.PropTypes.number.isRequired,
      y1: React.PropTypes.number.isRequired,
      y2: React.PropTypes.number.isRequired
    }).isRequired
  },

  getInitialState() {
    return { show: true };
  },

  componentDidMount() {
    this._blink = setInterval(() => {
      this.setState({ show: !this.state.show });
    }, 500);
  },

  componentWillUnmount() {
    clearInterval(this._blink);
  },

  render() {
    const {coords: cursorCoords} = this.props;
    const {show} = this.state;

    const color = show ? "rgba(255, 255, 255, 0.75)" : "rgba(0,0,0,0)";
    return <CanvasLine color={color} width={1} from={[cursorCoords.x, cursorCoords.y1]} to={[cursorCoords.x, cursorCoords.y2]} />;
  }
});
