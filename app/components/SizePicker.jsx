import React from 'react';

const SizeItem = ({ name, code, currentCode, onSelect }) => {
  const onClick = (e) => {
    e.preventDefault();
    onSelect(code);
  };
  const className = `SizePicker-size SizePicker-size--${code}` + (code === currentCode ? ' SizePicker-size--selected' : '');

  return <div className={className} onClick={onClick}>
    <div className="SizePicker-size-wrapper">
      {name}
    </div>
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
