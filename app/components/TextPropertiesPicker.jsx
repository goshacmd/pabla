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

const fonts = ['Arial', 'Georgia', 'Helvetica', 'Trebuchet MS'];
const fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 26, 32, 36, 42, 48, 54];

export default React.createClass({
  propTypes: {
    textAttrs: React.PropTypes.shape({
      font: React.PropTypes.string.isRequired,
      fontSize: React.PropTypes.number.isRequired,
      color: React.PropTypes.string.isRequired,
      bold: React.PropTypes.bool.isRequired,
      italic: React.PropTypes.bool.isRequired,
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

  updateBold() {
    this.props.onBoldChange(!this.props.textAttrs.bold);
  },

  updateItalic() {
    this.props.onItalicChange(!this.props.textAttrs.italic);
  },

  render() {
    const {font, fontSize, color, bold, italic} = this.props.textAttrs;
    return <div className="TextPropsPicker">
      <p>
        Font:
        <select ref="font" value={font} onChange={this.updateFont}>
          {fonts.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </p>
      <p>
        Font size:
        <select ref="fontSize" value={fontSize} onChange={this.updateFontSize}>
          {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </p>

      <div className="TextPropsPicker-style">
        <div className="TextPropsPicker-style-bold" onClick={this.updateBold}>
          <Option selected={bold}>
            <span>Bold</span>
          </Option>
        </div>
        <div className="TextPropsPicker-style-italic" onClick={this.updateItalic}>
          <Option selected={italic}>
            <span>Italic</span>
          </Option>
        </div>
      </div>

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
