import React from 'react';
import Option from './Option';

const colors = [
  'white',
  'black',
  '#444',
  '#007fff',
  '#ffb300',
  '#71c318'
];

export default React.createClass({
  propTypes: {
    textAttrs: React.PropTypes.shape({
      fontSize: React.PropTypes.number.isRequired,
    }).isRequired,
    onFontChange: React.PropTypes.func.isRequired,
    onFontSizeChange: React.PropTypes.func.isRequired,
    onColorChange: React.PropTypes.func.isRequired
  },

  updateFont() {
    const val = this.refs.font.value;
    this.props.onFontChange(val);
  },

  updateFontSize() {
    const val = parseInt(this.refs.fontSize.value, 10);
    this.props.onFontSizeChange(val);
  },

  updateColor(color) {
    this.props.onColorChange(color);
  },

  render() {
    const {font, fontSize, color} = this.props.textAttrs;
    return <div className="TextPropsPicker">
      <p>
        Font:
        <select ref="font" value={font} onChange={this.updateFont}>
          {['Arial', 'Georgia'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </p>
      <p>
        Font size:
        <select ref="fontSize" value={fontSize} onChange={this.updateFontSize}>
          {[8, 10, 12, 14, 16, 18, 20, 22, 26, 32, 36, 42, 48, 54].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </p>

      <div className="TextPropsPicker-colors">
        {colors.map(color => {
          return <div key={color} className="TextPropsPicker-color" onClick={this.updateColor.bind(this, color)}>
            <Option selected={color === this.props.textAttrs.color} checkSize="small">
              <div style={{background: color, borderRadius: 3}} />
            </Option>
          </div>;
        })}
      </div>
    </div>;
  }
});
