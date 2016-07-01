import React from 'react';
import Option from './Option';

const SizeItem = ({ name, code, currentCode, onSelect }) => {
  const onClick = (e) => {
    e.preventDefault();
    onSelect(code);
  };
  const className = `SizePicker-size SizePicker-size--${code}`;

  return <div className={className} onClick={onClick}>
    <Option selected={code === currentCode}>
      {name}
    </Option>
  </div>
};

export default React.createClass({
  render() {
    const size = this.props.size;

    return <div className="SizePicker">
      <SizeItem name="Tall" code="tall" currentCode={size} onSelect={this.props.onSizeSelect} />
      <SizeItem name="Square" code="square" currentCode={size} onSelect={this.props.onSizeSelect} />
      <SizeItem name="Wide" code="wide" currentCode={size} onSelect={this.props.onSizeSelect} />
    </div>;
  }
});
