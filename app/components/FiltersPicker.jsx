import React from 'react';

export default React.createClass({
  propTypes: {
    contrast: React.PropTypes.bool.isRequired,
    onContrastChange: React.PropTypes.func.isRequired
  },

  updateContrast() {
    const val = this.refs.contrast.checked;
    this.props.onContrastChange(val);
  },

  render() {
    return <div>
      <label>
        <input ref="contrast" checked={this.props.contrast} type="checkbox" onChange={this.updateContrast} /> Contrast
      </label>
    </div>;
  }
});
