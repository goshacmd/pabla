import React from 'react';

export default React.createClass({
  propTypes: {
    fontSize: React.PropTypes.number.isRequired,
    onFontSizeChange: React.PropTypes.func.isRequired
  },

  updateFontSize() {
    const val = parseInt(this.refs.fontSize.value, 10);
    this.props.onFontSizeChange(val);
  },

  render() {
    return <div>
      Font size:
      <select ref="fontSize" value={this.props.fontSize} onChange={this.updateFontSize}>
        {[8, 10, 12, 14, 16, 18, 20, 22, 26, 32, 36, 42, 48, 54].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>;
  }
});
