import React from 'react';

export default ({ selected, checkSize, children }) => {
  if (!checkSize) checkSize = 'normal';
  const className = `OptionWrapper OptionWrapper--size-${checkSize}` + (selected ? " OptionWrapper--selected" : "");

  return <div className={className}>
    <div className="OptionWrapper-w">
      {children}
    </div>
  </div>;
};
