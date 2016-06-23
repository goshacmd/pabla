import React from 'react';

export default ({ title, children }) => {
  return <div className="Card">
    <div className="Card-header"><h4>{title}</h4></div>
    {children}
  </div>
};
