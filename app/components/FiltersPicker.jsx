import React from 'react';

export default React.createClass({
  propTypes: {
    filter: React.PropTypes.oneOf(['none', 'light_contrast', 'heavy_contrast', 'light_blur', 'heavy_blur']).isRequired,
    onFilterChange: React.PropTypes.func.isRequired
  },

  updateFilter() {
    const val = this.refs.select.value;
    this.props.onFilterChange(val);
  },

  render() {
    return <div>
      <select className="FiltersPicker" value={this.props.filter} ref="select" onChange={this.updateFilter}>
        <option value="none">None</option>
        <option value="light_contrast">Light contrast</option>
        <option value="heavy_contrast">Heavy contrast</option>
        <option value="light_blur">Light blur</option>
        <option value="heavy_blur">Heavy blur</option>
      </select>
    </div>;
  }
});
