const BOX_MARGIN = 5;
const BOX_TOTAL_MARGIN = 2 * BOX_MARGIN;

const setupCtx = (ctx, textAttrs) => {
  const {bold, italic, font, fontSize, color} = textAttrs;

  ctx.font = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''} ${fontSize}px "${font}"`;
  ctx.fillStyle = color;
};

export const splitTextInLines = (ctx, maxWidth, textAttrs, text) => {
  const {fontSize} = textAttrs;

  maxWidth = maxWidth - BOX_TOTAL_MARGIN;

  setupCtx(ctx, textAttrs);

  const paras = text.split('\n');
  const words = paras.map(para => para.split(' ')).reduce((acc, words, idx) => {
    const a = idx == paras.length - 1 ? [] : ['\n'];
    return acc.concat(words).concat(a);
  }, []);
  let lines = [''];
  let indices = [[]];

  let lastGlobIdx = 0;
  words.forEach((word, idx) => {
    if (word === '\n') {
      indices.push([]);
      lines.push('');
      return;
    }
    const lastIdx = lines.length-1;
    let lastLine = lines[lastIdx]
    const newText = lastLine.length === 0 ? word : lastLine + ' ' + word;
    if (ctx.measureText(newText).width <= maxWidth || lastLine.length === 0) {
      lines[lastIdx] = newText;
      const empty = lastLine.length === 0;
      indices[lastIdx] = indices[lastIdx].concat(word.split('').map((_, i) => lastGlobIdx + 1 + i));
    } else {
      indices.push(word.split('').map((_, i) => lastGlobIdx + 1 + i));
      lines.push(word);
    }
    indices[lines.length-1].push(lastGlobIdx + 1 + word.length);
    lastGlobIdx = lastGlobIdx + 1 + word.length
  });

  return [lines, indices];
};

export const findIdxForCursor = (ctx, textRect, cursorAt, textAttrs, text) => {
  const {fontSize, lineHeight} = textAttrs;

  setupCtx(ctx, textAttrs);

  const maxWidth = textRect[2];
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, textAttrs, text);
  const spaced = fontSize * lineHeight;
  let cursor;
  lines.forEach((line, idx) => {
    const x = textRect[0] + BOX_MARGIN;
    const y = textRect[1] + fontSize + (idx * spaced);
    // find cursor
    if (cursorAt && cursorAt.y <= y && cursorAt.y >= y - spaced) {
      line.split('').forEach((char, idx) => {
        const wd0 = ctx.measureText(line.slice(0, idx)).width;
        const wd1 = ctx.measureText(line.slice(0, idx+1)).width;
        const curX = cursorAt.x - x;
        if (curX >= wd0 && curX <= wd1) {
          cursor = text.indexOf(line) + idx;
        }
      });
    }
  });
  return cursor !== undefined ? cursor + 1 : null;
};

export const coordsForLine = (textRect, textAttrs, lineNo) => {
  const {fontSize, lineHeight} = textAttrs;

  const spaced = fontSize * lineHeight;
  return { x: textRect[0] + BOX_MARGIN, y: textRect[1] + fontSize + (lineNo * spaced) };
};

export const findPosForCursor = (ctx, cursor, textRect, textAttrs, text) => {
  const {fontSize} = textAttrs;

  setupCtx(ctx, textAttrs);

  const maxWidth = textRect[2];
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, fontSize, text);

  if (cursor === 0) {
    return {lineNo: 0, idxInLine: 0, line: ['']};
  };

  const line = mapIndices.find(line => line.indexOf(cursor) !== -1);
  let pos;
  if (line) {
    const lineNo = mapIndices.indexOf(line);
    const idxInLine = line.indexOf(cursor);
    const lineText = line.map(i => text[i-1]).join('');

    pos = {lineNo, idxInLine, line};
  }
  return pos;
};

export const findCoordsForPos = (ctx, textRect, textAttrs, text, pos) => {
  const {fontSize} = textAttrs;
  setupCtx(ctx, textAttrs);

  const {lineNo, idxInLine, line} = pos;
  const lineText = line.map(i => text[i-1]).join('');

  const {x, y} = coordsForLine(textRect, textAttrs, lineNo);
  const wd1 = ctx.measureText(lineText.slice(0, idxInLine + 1)).width;

  return { x: x+wd1, y1: y-fontSize+7, y2: y+7 };
};

export const findRectsForSelection = (ctx, textRect, cursor1, cursor2, textAttrs, text) => {
  const {fontSize} = textAttrs;
  setupCtx(ctx, textAttrs);

  let idx1 = cursor1;
  let idx2 = cursor2;
  if (idx1 > idx2) {
    [idx1, idx2] = [idx2, idx1];
  }
  const pos1 = findPosForCursor(ctx, idx1, textRect, textAttrs, text);
  const pos2 = findPosForCursor(ctx, idx2, textRect, textAttrs, text);

  if (!(pos1 && pos2)) return;
  const [lines, mapIndices] = splitTextInLines(ctx, textRect[2], textAttrs, text);

  if (pos1.lineNo === pos2.lineNo) {
    const line = mapIndices.find(line => line.indexOf(idx1+1) !== -1);
    const lineText = line.map(i => text[i-1]).join('');
    const {x, y} = coordsForLine(textRect, textAttrs, pos1.lineNo);
    const wd1 = ctx.measureText(lineText.slice(0, pos1.idxInLine)).width;
    const wd2 = ctx.measureText(lineText.slice(pos1.idxInLine, pos2.idxInLine)).width;

    return [{x1:x+wd1, x2:x+wd1+wd2, y1: y-fontSize+7, y2:y+7 }];
  } else {
    const lineNos = Array.apply(0, Array(pos2.lineNo - pos1.lineNo + 1)).map((_, idx) => idx + pos1.lineNo);

    return lineNos.map(lineNo => {
      const {x, y} = coordsForLine(textRect, textAttrs, lineNo);

      let wd1, wd2;
      if (lineNo == pos1.lineNo) {
        const line = mapIndices.find(line => line.indexOf(idx1+1) !== -1);
        const lineText = line.map(i => text[i-1]).join('');
        wd1 = ctx.measureText(lineText.slice(0, pos1.idxInLine)).width;
        wd2 = ctx.measureText(lineText.slice(pos1.idxInLine)).width;
      } else if (lineNo === pos2.lineNo) {
        const line = mapIndices.find(line => line.indexOf(idx2) !== -1);
        const lineText = line.map(i => text[i-1]).join('');
        wd1 = 0;
        wd2 = ctx.measureText(lineText.slice(0, pos2.idxInLine)).width;
      } else {
        const line = mapIndices[lineNo];
        const lineText = line.map(i => text[i-1]).join('');
        wd1 = 0
        wd2 = ctx.measureText(lineText).width;
      }
      return {x1:x+wd1, x2:x+wd1+wd2, y1: y-fontSize+7, y2:y+7 };
    });
  }
};

export const addText = (ctx, textAttrs, _textRect, text) => {
  const {fontSize, lineHeight} = textAttrs;
  setupCtx(ctx, textAttrs);

  const textRect = _textRect.slice();

  const maxWidth = _textRect[2] - BOX_TOTAL_MARGIN;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, textAttrs, text);

  const spaced = fontSize * lineHeight;
  lines.forEach((line, idx) => {
    const {x, y} = coordsForLine(textRect, textAttrs, idx);
    ctx.fillText(line, x, y, maxWidth);
  });

  const totalHeight = lines.length * spaced;

  textRect[3] = totalHeight;

  return textRect;
};
