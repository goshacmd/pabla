import React from 'react';

export default ({ selected, checkSize, borderStyle, children }) => {
  if (!checkSize) checkSize = 'normal';
  if (!borderStyle) borderStyle = 'thin-grey';

  const className = `OptionWrapper OptionWrapper--size-${checkSize} OptionWrapper--border-${borderStyle}` + (selected ? " OptionWrapper--selected" : "");

  return <div className={className}>
    <div className="OptionWrapper-w">
      {children}
    </div>
  </div>;
};
