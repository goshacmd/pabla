const CANVAS_WIDTH = 500;
const MAX_TEXT_WIDTH = CANVAS_WIDTH - 40 - 10;

export const splitTextInLines = (ctx, maxWidth, fontSize, text) => {
  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "white";

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

export const findIdxForCursor = (ctx, textRect, cursorAt, fontSize, text) => {
  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "white";
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, fontSize, text);
  const spaced = fontSize * 1.3;
  let cursor;
  lines.forEach((line, idx) => {
    const x = textRect[0] + 10;
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

export const coordsForLine = (textRect, fontSize, lineNo) => {
  const spaced = fontSize * 1.3;
  return { x: textRect[0] + 10, y: textRect[1] + fontSize + (lineNo * spaced) };
};

export const findPosForCursor = (ctx, cursor, fontSize, text) => {
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, fontSize, text);

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

export const findCoordsForPos = (ctx, textRect, fontSize, text, pos) => {
  const {lineNo, idxInLine, line} = pos;
  const lineText = line.map(i => text[i-1]).join('');

  const {x, y} = coordsForLine(textRect, fontSize, lineNo);
  const wd1 = ctx.measureText(lineText.slice(0, idxInLine + 1)).width;

  return { x: x+wd1, y1: y-fontSize+7, y2: y+7 };
};

export const findRectsForSelection = (ctx, textRect, cursor1, cursor2, fontSize, text) => {
  let idx1 = cursor1;
  let idx2 = cursor2;
  if (idx1 > idx2) {
    [idx1, idx2] = [idx2, idx1];
  }
  const pos1 = findPosForCursor(ctx, idx1, fontSize, text);
  const pos2 = findPosForCursor(ctx, idx2, fontSize, text);

  if (!(pos1 && pos2)) return;
  const [lines, mapIndices] = splitTextInLines(ctx, MAX_TEXT_WIDTH, fontSize, text);

  if (pos1.lineNo === pos2.lineNo) {
    const line = mapIndices.find(line => line.indexOf(idx1+1) !== -1);
    const lineText = line.map(i => text[i-1]).join('');
    const {x, y} = coordsForLine(textRect, fontSize, pos1.lineNo);
    const wd1 = ctx.measureText(lineText.slice(0, pos1.idxInLine + 1)).width;
    const wd2 = ctx.measureText(lineText.slice(pos1.idxInLine + 1, pos2.idxInLine)).width;

    return [{x1:x+wd1, x2:x+wd1+wd2, y1: y-fontSize+7, y2:y+7 }];
  } else {
    const lineNos = Array.apply(0, Array(pos2.lineNo - pos1.lineNo + 1)).map((_, idx) => idx + pos1.lineNo);

    return lineNos.map(lineNo => {
      const {x, y} = coordsForLine(textRect, fontSize, lineNo);

      let wd1, wd2;
      if (lineNo == pos1.lineNo) {
        const line = mapIndices.find(line => line.indexOf(idx1+1) !== -1);
        const lineText = line.map(i => text[i-1]).join('');
        wd1 = ctx.measureText(lineText.slice(0, pos1.idxInLine +1)).width;
        wd2 = ctx.measureText(lineText.slice(pos1.idxInLine + 1)).width;
      } else if (lineNo === pos2.lineNo) {
        const line = mapIndices.find(line => line.indexOf(idx2+1) !== -1);
        const lineText = line.map(i => text[i-1]).join('');
        wd1 = 0;
        wd2 = ctx.measureText(lineText.slice(0, pos2.idxInLine)).width;
      } else {
        wd1 = 0
        wd2 = 280;
      }
      return {x1:x+wd1, x2:x+wd1+wd2, y1: y-fontSize+7, y2:y+7 };
    });
  }
};

export const addText = (ctx, fontSize, _textRect, text) => {
  const textRect = _textRect.slice();

  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "white";
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, fontSize, text);

  const spaced = fontSize * 1.3;
  lines.forEach((line, idx) => {
    const {x, y} = coordsForLine(textRect, fontSize, idx);
    ctx.fillText(line, x, y, textRect[2]-20);
  });

  const totalHeight = lines.length * spaced;

  textRect[3] = totalHeight + 10;

  return textRect;
};
