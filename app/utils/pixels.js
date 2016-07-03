export const rectCenter = ([x, y, w, h]) => {
  return { x: x + w/2, y: y + h/2 };
};

export const isInRect = (pos, rect) => {
  return (pos.x >= rect[0] && pos.x <= rect[0] + rect[2]) && (pos.y >= rect[1] && pos.y <= rect[1] + rect[3]);
};

export const moveRect = (rect, diff) => {
  const [x, y, w, h] = rect;
  return [x-diff.x, y-diff.y, w, h];
};

export const shrinkRect = (rect, dir, value) => {
  const [x, y, w, h] = rect;
  return dir === 'left' ?
    [x - value, y, w + value, h] :
    [x, y, w - value, h];
};

export const pointDiff = (a, b) => {
  const xDiff = a.x - b.x;
  const yDiff = a.y - b.y;
  return {xDiff, yDiff};
};

export const diffWithin = (a, b, {x, y}) => {
  const {xDiff, yDiff} = pointDiff(a, b);

  return {
    xWithin: xDiff >= -x && xDiff <= x,
    yWithin: yDiff >= -y && yDiff <= y
  };
};

export const centerCrop = (area, frame) => {
  const {width: imgWidth, height: imgHeight} = area;
  const {width: canvasWidth, height: canvasHeight} = frame;

  const origRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  // determine crop
  let zoneWidth, zoneHeight;
  if (canvasRatio >= origRatio) {
    zoneWidth = imgWidth;
    zoneHeight = imgWidth / canvasRatio;
  } else {
    zoneWidth = imgHeight * canvasRatio;
    zoneHeight = imgHeight;
  }

  // center
  const xPad = (imgWidth - zoneWidth) / 2;
  const yPad = (imgHeight - zoneHeight) / 2;

  return {xPad, yPad, zoneWidth, zoneHeight};
};

export const getMousePos = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return mousePos;
};
