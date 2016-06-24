import React from 'react';
import {connect} from 'react-redux';
import {cacheDrawing} from 'actions';

import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ImageCanvas from 'components/ImageCanvas';

const App = React.createClass({
  updateDrawnImage(data) {
    if (this.props.drawing === data) return;
    this.props.onCacheDrawing(data);
  },

  render() {
    return (
      <div className="Container">
        <LeftSidebar />
        <div className="Main">
          <h4 className="Main-subtitle">Canvas</h4>
          <ImageCanvas image={this.props.selected} fontSize={this.props.fontSize} contrast={this.props.contrast} size={this.props.size} onRedraw={this.updateDrawnImage} />
        </div>
        <RightSidebar />
      </div>
    );
  }
});

const mapStateToProps = (state) => ({
  fontSize: state.fontSize,
  contrast: state.contrast,
  size: state.size,
  selected: state.selectedImage,
  drawing: state.drawing
});

const mapDispatchToProps = (dispatch) => ({
  onCacheDrawing(drawing) {
    dispatch(cacheDrawing(drawing));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
