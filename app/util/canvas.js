import {addText} from 'util/text';

const canvasComponents = {
  image(ctx, child) {
    drawImage(ctx, child.frame, child.image);
  },
  filter(ctx, child) {
    applyContrast(ctx, child.frame);
  },
  text(ctx, child) {
    const rect = addText(ctx, child.fontSize, child.frame, child.text);
    child.onUpdateRect && child.onUpdateRect(rect);
  },
  rect(ctx, child) {
    ctx.fillStyle = child.fill;
    ctx.fillRect(...child.frame);
  },
  outline(ctx, child) {
    ctx.lineWidth = child.width;
    ctx.strokeStyle = child.color;
    ctx.strokeRect(...child.frame);
  },
  line(ctx, child) {
    ctx.strokeStyle = child.color;
    ctx.lineWidth = child.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(...child.from);
    ctx.lineTo(...child.to);
    ctx.stroke();
    ctx.strokeStyle = null;
  }
};

const applyContrast = (ctx, frame) => {
  ctx.fillStyle = "rgba(45, 45, 45, 0.45)";
  ctx.fillRect(...frame);
};

const drawImage = (ctx, frame, img) => {
  const canvasWidth = frame[2];
  const canvasHeight = frame[3];

  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

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

  ctx.drawImage(img, xPad, yPad, zoneWidth, zoneHeight, 0, 0, canvasWidth, canvasHeight);
};

export const renderCanvasLayout = (ctx, layout) => {
  layout.children.forEach(child => {
    if (!child) return;
    const renderer = canvasComponents[child.type];
    if (!renderer) console.error(`Unknown canvas component: ${child.type}`);
    renderer(ctx, child);
  });
};
