import React from 'react';

const SIZES = {
  tall: [500, 750],
  square: [500, 500],
  wide: [500, 250]
};

export default (Component) => {
  return ({ size, ...rest }) => {
    const [canvasWidth, canvasHeight] = SIZES[size];
    return <Component {...rest} {...{canvasWidth, canvasHeight}} />;
  };
};
