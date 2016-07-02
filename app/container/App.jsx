import React from 'react';
import {connect} from 'react-redux';
import {cacheDrawing, setText, setTextRect, setFocus, setEditing, setNoFocus, setNoEditing} from 'actions';

import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import ImageCanvas from 'components/ImageCanvas';

const App = React.createClass({
  updateDrawnImage(data) {
    if (this.props.drawing === data) return;
    this.props.onCacheDrawing(data);
  },

  render() {
    const selectedUrl = this.props.selected && this.props.selected.url;
    const {text, textRect, textAttrs, filter, size} = this.props;
    return (
      <div className="Container">
        <LeftSidebar />
        <div className="Main">
          <h4 className="Main-subtitle">Canvas</h4>
          <ImageCanvas
            image={selectedUrl}
            body={{
              text, textAttrs, textRect
            }}
            filter={filter}
            size={size}
            isFocused={this.props.focused}
            isEditing={this.props.editing}
            onFocus={this.props.onFocus}
            onEdit={this.props.onEdit}
            onBlur={this.props.onBlur}
            onCancelEdit={this.props.onCancelEdit}
            onTextRectMove={this.props.onTextRectMove}
            onRedraw={this.updateDrawnImage}
            onTextChange={this.props.onTextChange} />
        </div>
        <RightSidebar />
      </div>
    );
  }
});

const mapStateToProps = (state) => ({
  textAttrs: state.textAttrs,
  filter: state.filter,
  size: state.size,
  selected: state.selectedImage,
  drawing: state.drawing,
  text: state.text,
  textRect: state.textRect,
  focused: state.focused,
  editing: state.editing
});

const mapDispatchToProps = (dispatch) => ({
  onCacheDrawing(drawing) {
    dispatch(cacheDrawing(drawing));
  },

  onTextChange(text) {
    dispatch(setText(text));
  },

  onTextRectMove(part, rect) {
    dispatch(setTextRect(part, rect));
  },

  onFocus(part) {
    dispatch(setFocus(part));
  },

  onEdit() {
    dispatch(setEditing());
  },

  onBlur() {
    dispatch(setNoFocus());
  },

  onCancelEdit() {
    dispatch(setNoEditing());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
