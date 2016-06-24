import React from 'react';

export default React.createClass({
  propTypes: {
    images: React.PropTypes.arrayOf(React.PropTypes.shape({ url: React.PropTypes.string })).isRequired,
    selected: React.PropTypes.shape({ url: React.PropTypes.string }),
    onSelect: React.PropTypes.func
  },

  handleSelect(image) {
    this.props.onSelect && this.props.onSelect(image);
  },

  render() {
    const selected = this.props.selected || {};
    return <div className="ImagePicker">
      {this.props.images.map(image => {
        const sel = image.url === selected.url;
        const className = 'ImagePicker-image' + (sel ? ' ImagePicker-image--selected' : '');
        return <div className={className} onClick={() => this.handleSelect(image)} key={image.url}>
          <div className="ImagePicker-image-wrapper"><img crossOrigin="anonymous" src={image.url}/ ></div>
        </div>
      })}
    </div>;
  }
});
