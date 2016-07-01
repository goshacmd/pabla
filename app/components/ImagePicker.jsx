import React from 'react';
import Option from './Option';

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
        const imageUrl = image.url + "&w=364";

        return <div className={className} onClick={this.handleSelect.bind(this, image)} key={image.url}>
          <Option selected={sel} borderStyle="thick-transparent">
              <img src={imageUrl}/ >
          </Option>
        </div>;
      })}
    </div>;
  }
});
