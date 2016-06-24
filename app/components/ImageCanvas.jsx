import React from 'react';

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

const renderCanvasLayout = (ctx, layout) => {
  layout.children.forEach(child => {
    if (!child) return;
    const renderer = canvasComponents[child.type];
    if (!renderer) console.error(`Unknown canvas component: ${child.type}`);
    renderer(ctx, child);
  });
};

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

const splitTextInLines = (ctx, maxWidth, fontSize, text) => {
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

const findIdxForCursor = (ctx, textRect, cursorAt, fontSize, text) => {
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
  return cursor;
};

const applyMouseDiff = (textRect, mouseDiff) => {
  return [textRect[0]-mouseDiff.x, textRect[1]-mouseDiff.y, textRect[2], textRect[3]];
};

const coordsForLine = (textRect, fontSize, lineNo) => {
  const spaced = fontSize * 1.3;
  return { x: textRect[0] + 10, y: textRect[1] + fontSize + (lineNo * spaced) };
};

const findPosForCursor = (ctx, cursor, fontSize, text) => {
  const maxWidth = MAX_TEXT_WIDTH;
  const [lines, mapIndices] = splitTextInLines(ctx, maxWidth, fontSize, text);

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

const findRectsForSelection = (ctx, textRect, cursor1, cursor2, fontSize, text) => {
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

const addText = (ctx, fontSize, _textRect, text) => {
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

  const maxActual = Math.min(300, Math.max(...lines.map(line => ctx.measureText(line).width)));
  const totalHeight = lines.length * spaced;

  textRect[3] = totalHeight + 10;

  return textRect;
};

class TextEditor {
  constructor(component) {
    this.component = component;
    this.cursor = 0;
    this.cursor1 = null;
    this.cursor2 = null;
    this.showCursor = false;
  }

  getText() {
    return this.component.props.text;
  }

  toggleCursor() {
    this.showCursor = !this.showCursor;
  }

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
  }

  insertOrDeleteChar(char) {
    const currText = this.getText();
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

    return newText;
  }

  selectAll() {
    // doesn't quite select the first char
    this.cursor1 = 1;
    this.cursor2 = this.getText().length;
    this.cursor = this.cursor2;
  }
}

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
      cb();
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
    this.textEditor = new TextEditor(this);
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
    setTimeout(this.doRedraw, 100);

    setInterval(() => {
      this.textEditor.toggleCursor();
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

    const {showCursor, cursor, cursor1, cursor2} = this.textEditor;
    const {mouseHeld, textRect} = this;
    const {text} = this.props;
    const {isFocused, isEditing, mouseDiff} = this.state;

    const hasContrast = nextProps.contrast;
    const fontSize = nextProps.fontSize;

    const img = [].slice.apply(document.images).find(i => nextProps.image.url === i.src);
    if (!img) return;

    const {canvasWidth, canvasHeight} = this.state;

    let selectionRects = [];

    let setCursor;
    if (isEditing && cursor1 && cursor2) {
      const rects = findRectsForSelection(ctx, textRect, cursor1, cursor2, fontSize, text);
      if (!rects) return;

      setCursor = true;
      selectionRects = rects.map(rect => {
        const {x1,x2,y1,y2} = rect;
        return {
          type: 'rect',
          fill: 'rgba(87, 205, 255, 0.5)',
          frame: [x1, y1, x2-x1, y2-y1]
        };
      });
    }
    let cursorLine;
    if (isEditing && showCursor && !setCursor) {
      const pos = findPosForCursor(ctx, cursor, fontSize, text);
      if (pos) {
        const coords = findCoordsForPos(ctx, textRect, fontSize, text, pos);
        cursorLine = {
          type: 'line',
          color: 'rgba(255, 255, 255, 0.75)',
          width: 1,
          from: [coords.x, coords.y1],
          to: [coords.x, coords.y2]
        };
      }
    }

    const layout = {
      frame: [0, 0, canvasWidth, canvasHeight],
      children: [
        {
          type: 'image',
          image: img,
          frame: [0, 0, canvasWidth, canvasHeight],
        },
        (hasContrast ?
          {
            type: 'filter',
            name: 'contrast',
            frame: [0, 0, canvasWidth, canvasHeight]
          } : null),
        {
          type: 'text',
          frame: textRect,
          fontSize,
          text,
          onUpdateRect: (newRect) => {
            this.textRect = newRect;
          }
        },
        (isFocused ?
          {
            type: 'outline',
            width: 2,
            color: !mouseHeld ? "#0092d1" : "rgba(87, 205, 255, 0.5)",
            frame: textRect
          } : null),
        ...selectionRects,
        cursorLine
      ]
    };

    renderCanvasLayout(ctx, layout);

    this.props.onRedraw && this.props.onRedraw(this.refs.canvas.toDataURL('image/jpeg'));
  },

  cancelEditing() {
    this.setState({ isEditing: false });
    setTimeout(this.doRedraw, 50);
  },

  moveCursor(dir, shift) {
    this.textEditor.moveCursor(dir, shift);
    setTimeout(this.doRedraw, 50);
  },

  insertOrDeleteChar(char) {
    const newText = this.textEditor.insertOrDeleteChar(char);
    this.props.onTextChange(newText);
  },

  selectAll() {
    this.textEditor.selectAll();
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
        this.textEditor.cursor1 = idx1;
        this.textEditor.cursor2 = idx2;
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
        this.textEditor.cursor = findIdxForCursor(ctx, textRect, this.startPos, fontSize, text) || this.textEditor.cursor;
        this.setState({ isEditing: true });
        this.textEditor.cursor1 = null;
        this.textEditor.cursor2 = null;

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
