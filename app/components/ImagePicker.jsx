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

  search(e) {
    e.preventDefault();

    const value = this.refs.search.value;

    if (value && value.length > 0) {
      this.props.onSearch(value);
    } else {
      this.props.onSearchReset();
    }
  },

  render() {
    const selected = this.props.selected || {};
    return <div className="ImagePicker">
      <form onSubmit={this.search}>
        <input ref="search" type="text" className="ImagePicker-search" placeholder="Search images" />
      </form>

      {this.props.images.map(image => {
        const sel = image.url === selected.url;
        const className = 'ImagePicker-image' + (sel ? ' ImagePicker-image--selected' : '');
        const imageUrl = image.url + "&w=364";

        return <div className={className} onClick={this.handleSelect.bind(this, image)} key={image.url}>
          <div className="ImagePicker-image-wrapper"><img src={imageUrl}/ ></div>
        </div>;
      })}
    </div>;
  }
});
