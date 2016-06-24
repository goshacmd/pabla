import React from 'react';

const keys = {
  8:  'backspace',
  27: 'escape',
  37: 'arr_left',
  39: 'arr_right'
};

const TALL = [500, 750];
const SQUARE = [500, 500];
const WIDE = [500, 250];

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 250;
const MAX_TEXT_WIDTH = CANVAS_WIDTH - 40 - 10;

const getMousePos = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return mousePos;
};

const isInRect = (pos, rect) => {
  return (pos.x >= rect[0] && pos.x <= rect[0] + rect[2]) && (pos.y >= rect[1] && pos.y <= rect[1] + rect[3]);
}

const initCanvas = (c, width, height) => {
  // handle retina w
  // https://gist.github.com/joubertnel/870190
  const ctx = c.getContext('2d');

  if (window.devicePixelRatio) {
    c.width = width * window.devicePixelRatio;
    c.height = height * window.devicePixelRatio;
    window.c = c;
    c.style.width = `${width}px`;
    c.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }
};

const applyContrast = (ctx, canvasWidth, canvasHeight) => {
  ctx.fillStyle = "rgba(45, 45, 45, 0.45)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const drawImage = (ctx, canvasWidth, canvasHeight, img) => {
  const imgWidth = img.naturalWidth;
  const imgHeight = img.naturalHeight;

  const origRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let zoneWidth, zoneHeight;
  if (canvasRatio >= origRatio) {
    zoneWidth = imgWidth;
    zoneHeight = imgWidth / canvasRatio;
  } else {
    zoneWidth = imgHeight * canvasRatio;
    zoneHeight = imgHeight;
  }

  const xPad = (imgWidth - zoneWidth) / 2;
  const yPad = (imgHeight - zoneHeight) / 2;

  ctx.drawImage(img, xPad, yPad, zoneWidth, zoneHeight, 0, 0, canvasWidth, canvasHeight);
};

const splitTextInLines = (ctx, maxWidth, text) => {
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

const findIdxForCursor = (ctx, textRect, cursorAt, fontSize, text) => {
  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "white";
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, text);
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
  return cursor;
};

const applyMouseDiff = (textRect, mouseDiff) => {
  return [textRect[0]-mouseDiff.x, textRect[1]-mouseDiff.y, textRect[2], textRect[3]];
};

const coordsForLine = (textRect, fontSize, lineNo) => {
  const spaced = fontSize * 1.3;
  return { x: textRect[0] + 10, y: textRect[1] + fontSize + (lineNo * spaced) };
};

const findPosForCursor = (ctx, cursor, text) => {
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, text);

  const line = mapIndices.find(line => line.indexOf(cursor+1) !== -1);
  let pos;
  if (line) {
    const lineNo = mapIndices.indexOf(line);
    const idxInLine = line.indexOf(cursor+1);
    const lineText = line.map(i => text[i-1]).join('');

    pos = {lineNo, idxInLine, line};
  }
  return pos;
};

const findCoordsForPos = (ctx, textRect, fontSize, text, pos) => {
  const {lineNo, idxInLine, line} = pos;
  const lineText = line.map(i => text[i-1]).join('');

  const {x, y} = coordsForLine(textRect, fontSize, lineNo);
  const wd1 = ctx.measureText(lineText.slice(0, idxInLine + 1)).width;

  return { x: x+wd1, y1: y-fontSize+7, y2: y+7 };
};

const drawCursor = (ctx, coords) => {
  const {x, y1, y2} = coords;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
  ctx.strokeStyle = null;
};

const findRectsForSelection = (ctx, textRect, cursor1, cursor2, fontSize, text) => {
  let idx1 = cursor1;
  let idx2 = cursor2;
  if (idx1 > idx2) {
    [idx1, idx2] = [idx2, idx1];
  }
  const pos1 = findPosForCursor(ctx, idx1, text);
  const pos2 = findPosForCursor(ctx, idx2, text);

  if (!(pos1 && pos2)) return;
  const [lines, mapIndices] = splitTextInLines(ctx, MAX_TEXT_WIDTH, text);

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

const addText = (ctx, fontSize, isFocused, mouseHeld, textRect, text) => {
  ctx.font = `${fontSize}px Georgia`;
  ctx.fillStyle = "white";
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, text);

  const spaced = fontSize * 1.3;
  lines.forEach((line, idx) => {
    const {x, y} = coordsForLine(textRect, fontSize, idx);
    ctx.fillText(line, x, y, textRect[2]-20);
  });

  const maxActual = Math.min(300, Math.max(...lines.map(line => ctx.measureText(line).width)));
  const totalHeight = lines.length * spaced;

  textRect[3] = totalHeight + 10;

  if (isFocused) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = !mouseHeld ? "#0092d1" : "rgba(87, 205, 255, 0.5)";
    ctx.strokeRect(textRect[0], textRect[1], textRect[2], textRect[3]);
  }
  return textRect;
};

// TODO:
// wait for image loading
export default React.createClass({
  initSize(size, cb) {
    const obj = {};
    [obj.canvasWidth, obj.canvasHeight] = {
      'tall': TALL,
      'wide': WIDE,
      'square': SQUARE
    }[size];
    const state = this.state;
    if (state.canvasWidth === obj.canvasWidth && state.canvasHeight === obj.canvasHeight) {
    } else {
      this.setState(obj, cb);
    }
  },

  componentWillReceiveProps(nextProps) {
    this.initSize(nextProps.size, () => {
      initCanvas(this.refs.canvas, this.state.canvasWidth, this.state.canvasHeight);
      this.redraw(nextProps);
    });
  },

  getInitialState() {
    return {};
  },

  componentWillMount() {
    this.initSize(this.props.size || 'square');
  },

  componentDidMount() {
    const c = this.refs.canvas;
    initCanvas(c, this.state.canvasWidth, this.state.canvasHeight);
    document.addEventListener('keypress', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
    this.textRect = [20, 20, this.state.canvasWidth - 40, this.state.canvasHeight - 40];
    this.cursor = 0;
    setTimeout(this.doRedraw, 100);

    setInterval(() => {
      this.showCursor = !this.showCursor;
      setTimeout(this.doRedraw, 100)
    }, 450);
  },

  doRedraw() {
    this.redraw(this.props);
  },

  redraw(nextProps) {
    if (!nextProps) nextProps = this.props;

    const canvas = this.refs.canvas;
    const ctx = canvas.getContext('2d');

    const {mouseHeld, showCursor, textRect, cursor} = this;
    const {text} = this.props;
    const {isFocused, isEditing, mouseDiff} = this.state;

    const hasContrast = nextProps.contrast;
    const fontSize = nextProps.fontSize;

    const img = [].slice.apply(document.images).find(i => nextProps.image.url === i.src);
    if (!img) return;

    drawImage(ctx, this.state.canvasWidth, this.state.canvasHeight, img);
    if (hasContrast) applyContrast(ctx, this.state.canvasWidth, this.state.canvasHeight)
    this.textRect = addText(ctx, fontSize, isFocused, mouseHeld, textRect,  text);
    let setCursor;
    if (isEditing && this.cursor1 && this.cursor2) {
      const rects = findRectsForSelection(ctx, textRect, this.cursor1, this.cursor2, fontSize, text);
      if (!rects) return;

      setCursor = true;
      rects.forEach(rect => {
        const {x1,x2,y1,y2} = rect;
        ctx.fillStyle = "rgba(87, 205, 255, 0.5)";
        ctx.fillRect(x1,y1,x2-x1,y2-y1);
      });
    }
    if (isEditing && showCursor && !setCursor) {
      const pos = findPosForCursor(ctx, this.cursor, text);
      if (pos) {
        const coords = findCoordsForPos(ctx, textRect, fontSize, text, pos);
        drawCursor(ctx, coords);
      }
    }

    this.props.onRedraw && this.props.onRedraw(this.refs.canvas.toDataURL('image/jpeg'));
  },

  cancelEditing() {
    this.setState({ isEditing: false });
    setTimeout(this.doRedraw, 50);
  },

  moveCursor(dir, shift) {
    // TODO: implement shift-selection
    shift = false;

    if (shift && !this.cursor1 && !this.cursor2) {
      this.cursor1 = this.cursor2 = this.cursor;
    }

    if (!shift) {
      this.cursor1 = this.cursor2 = null;
    }

    if (dir === 'left') {
      this.cursor = this.cursor - 1;
      if (shift) {
        this.cursor2 = this.cursor;
      }
    } else if (dir === 'right') {
      this.cursor = this.cursor + 1;
      if (shift) {
        this.cursor2 = this.cursor;
      }
    } else {
      return;
    }

    setTimeout(this.doRedraw, 50);
  },

  insertOrDeleteChar(char) {
    const currText = this.props.text;
    let newText;
    if (!this.cursor1 && !this.cursor2) {
      const globalCurrIdx = this.cursor;
      const beforeCurr = currText.slice(0, globalCurrIdx + 1);
      const afterCurr = currText.slice(globalCurrIdx+1);
      if (!char) {
        newText = beforeCurr.slice(0, -1) + afterCurr;
        this.cursor = globalCurrIdx - 1;
      } else {
        newText = beforeCurr + char + afterCurr;
        this.cursor = globalCurrIdx + 1;
      }
    } else {
      const idx1 = this.cursor1;
      const idx2 = this.cursor2;

      const beforeCurr = currText.slice(0, idx1 + 1);
      const afterCurr = currText.slice(idx2);
      if (!char) {
        newText = beforeCurr + afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1;
      } else {
        newText = beforeCurr + char + afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1 + 1;
      }
    }

    this.props.onTextChange(newText);
  },

  selectAll() {
    // doesn't quite select the first char
    this.cursor1 = 1;
    this.cursor2 = this.props.text.length;
    this.cursor = this.cursor2;
    setTimeout(this.doRedraw, 150);
  },

  handleKeyDown(e) {
    if (this.state.isEditing) {
      if (e.which === 65 && e.metaKey === true) {
        e.preventDefault();
        return this.selectAll();

      }
      switch (keys[e.which]) {
        case 'escape':
          this.cancelEditing();
          break;
        case 'arr_left':
          this.moveCursor('left', e.shiftKey);
          break;
        case 'arr_right':
          this.moveCursor('right', e.shiftKey);
          break;
      }
    }
  },

  handleKeyUp(e) {
    if (e.keyIdentifier === 'Meta' || e.keyIdentifier === 'Alt' || e.keyIdentifier === 'Control') return;

    if (this.state.isEditing) {
      if (keys[e.which] === 'backspace') {
        this.insertOrDeleteChar();
      } else {
        let char = String.fromCharCode(e.charCode);
        if (!e.shiftKey) char = char.toLowerCase();
        if (e.keyCode === 13) char = '\n';
        this.insertOrDeleteChar(char);
      }
    }
  },

  handleMouseDown(e) {
    const mousePos = getMousePos(e, this.refs.canvas);
    this.startPos = mousePos;

    const textRect = this.textRect;
    const isInTextRect = isInRect(mousePos, textRect);

    if (isInTextRect) {
      this.mouseHeld = true;
      if (this.state.isFocused) {
        this.mouseDown = new Date;
      }
      this.setState({ isFocused: true });
      setTimeout(this.doRedraw, 100);
    } else {
      this.setState({ isFocused: false, isEditing: false });
      setTimeout(this.doRedraw, 100);
    }
  },

  handleMouseMove(e) {
    if (this.mouseHeld) {
      // move

      const mousePos = getMousePos(e, this.refs.canvas);

      const mouseDiff = {
        x: this.startPos.x - mousePos.x,
        y: this.startPos.y - mousePos.y
      };

      if (this.state.isFocused && !this.state.isEditing) {
        this.textRect = applyMouseDiff(this.textRect, mouseDiff);
        this.setState({ mouseDiff });
        this.startPos = mousePos;
      } else if (this.state.isFocused && this.state.isEditing) {
        const cursor1 = this.startPos;
        const cursor2 = mousePos;


        const canvas = this.refs.canvas;
        const ctx = canvas.getContext('2d');
        const {textRect} = this;
        const {text, fontSize} = this.props;
        let idx1 = findIdxForCursor(ctx, textRect, cursor1, fontSize, text);
        let idx2 = findIdxForCursor(ctx, textRect, cursor2, fontSize, text);
        this.cursor1 = idx1;
        this.cursor2 = idx2;
      }

      setTimeout(this.doRedraw, 50);
    }
  },

  handleMouseUp(e) {
    if (this.mouseDown) {
      if ((new Date - this.mouseDown) < 200) {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext('2d');
        const {textRect} = this;
        const {text, fontSize} = this.props;
        this.cursor = findIdxForCursor(ctx, textRect, this.startPos, fontSize, text) || this.cursor;
        this.setState({ isEditing: true });
        this.cursor1 = null;
        this.cursor2 = null;

        setTimeout(this.doRedraw, 50);
      }
    }
    this.setState({ mouseDiff: null });
    this.mouseDown = null;
    this.mouseHeld = false;
    setTimeout(this.doRedraw, 50);
  },

  render() {
    const image = this.props.image || {};
    return <div className="ImageCanvas">
      <canvas ref="canvas" width={this.state.canvasWidth} height={this.state.canvasHeight} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp} />
    </div>
  }
});
