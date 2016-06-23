(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.reset = function() {
    modules = {};
    cache = {};
    aliases = {};
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("actions.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var setFontSize = exports.setFontSize = function setFontSize(size) {
  return {
    type: 'SET_FONT_SIZE',
    size: size
  };
};

var setContrast = exports.setContrast = function setContrast(contrast) {
  return {
    type: 'SET_CONTRAST',
    contrast: contrast
  };
};

var selectImage = exports.selectImage = function selectImage(image) {
  return {
    type: 'SELECT_IMAGE',
    image: image
  };
};

var cacheDrawing = exports.cacheDrawing = function cacheDrawing(drawing) {
  return {
    type: 'CACHE_DRAWING',
    drawing: drawing
  };
};
});

require.register("components/Card.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var title = _ref.title;
  var children = _ref.children;

  return _react2.default.createElement(
    "div",
    { className: "Card" },
    _react2.default.createElement(
      "div",
      { className: "Card-header" },
      _react2.default.createElement(
        "h4",
        null,
        title
      )
    ),
    children
  );
};
});

require.register("components/DownloadButton.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({
  displayName: "DownloadButton",

  propTypes: {
    drawing: _react2.default.PropTypes.string
  },

  handleDownload: function handleDownload(e) {
    var uri = this.props.drawing;
    var link = e.target;
    link.href = uri;
    link.click();
  },
  render: function render() {
    return _react2.default.createElement(
      "div",
      null,
      _react2.default.createElement(
        "a",
        { className: "Button", download: "pabla.jpg", target: "_blank", onClick: this.handleDownload },
        "Download"
      )
    );
  }
});
});

require.register("components/FiltersPicker.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({
  displayName: "FiltersPicker",

  propTypes: {
    contrast: _react2.default.PropTypes.bool.isRequired,
    onContrastChange: _react2.default.PropTypes.func.isRequired
  },

  updateContrast: function updateContrast() {
    var val = this.refs.contrast.checked;
    this.props.onContrastChange(val);
  },
  render: function render() {
    return _react2.default.createElement(
      "div",
      null,
      _react2.default.createElement(
        "label",
        null,
        _react2.default.createElement("input", { ref: "contrast", checked: this.props.contrast, type: "checkbox", onChange: this.updateContrast }),
        " Contrast"
      )
    );
  }
});
});

require.register("components/ImageCanvas.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var keys = {
  8: 'backspace',
  27: 'escape',
  37: 'arr_left',
  39: 'arr_right'
};

var CANVAS_SIZE = 500;
var MAX_TEXT_WIDTH = CANVAS_SIZE - 40 - 10;

var getMousePos = function getMousePos(e, canvas) {
  var rect = canvas.getBoundingClientRect();
  var mousePos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return mousePos;
};

var isInRect = function isInRect(pos, rect) {
  return pos.x >= rect[0] && pos.x <= rect[0] + rect[2] && pos.y >= rect[1] && pos.y <= rect[1] + rect[3];
};

var initCanvas = function initCanvas(c) {
  // handle retina w
  // https://gist.github.com/joubertnel/870190
  var ctx = c.getContext('2d');

  if (window.devicePixelRatio) {
    var width = c.width;
    var height = c.height;
    c.width = width * window.devicePixelRatio;
    c.height = height * window.devicePixelRatio;
    window.c = c;
    c.style.width = width + 'px';
    c.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
};

var applyContrast = function applyContrast(ctx, canvasDim) {
  ctx.fillStyle = "rgba(45, 45, 45, 0.45)";
  ctx.fillRect(0, 0, canvasDim, canvasDim);
};

var drawImage = function drawImage(ctx, canvasDim, img) {
  var imgWidth = img.naturalWidth;
  var imgHeight = img.naturalHeight;
  var imgMin = imgWidth > imgHeight ? imgHeight : imgWidth;
  var imgMax = imgWidth < imgHeight ? imgHeight : imgWidth;
  var imageSlice = imgMin;
  ctx.drawImage(img, (imgMax - imgMin) / 2, 0, imageSlice, imageSlice, 0, 0, canvasDim, canvasDim);
};

var splitTextInLines = function splitTextInLines(ctx, maxWidth, text) {
  var words = text.split(' ');
  var lines = [''];
  var indices = [[]];

  var lastGlobIdx = 0;
  words.forEach(function (word, idx) {
    var lastIdx = lines.length - 1;
    var lastLine = lines[lastIdx];
    var newText = lastLine.length === 0 ? word : lastLine + ' ' + word;
    if (ctx.measureText(newText).width <= maxWidth || lastLine.length === 0) {
      lines[lastIdx] = newText;
      var empty = lastLine.length === 0;
      indices[lastIdx] = indices[lastIdx].concat(word.split('').map(function (_, i) {
        return lastGlobIdx + 1 + i;
      }));
    } else {
      indices.push(word.split('').map(function (_, i) {
        return lastGlobIdx + 1 + i;
      }));
      lines.push(word);
    }
    indices[lines.length - 1].push(lastGlobIdx + 1 + word.length);
    lastGlobIdx = lastGlobIdx + 1 + word.length;
  });

  return [lines, indices];
};

var findIdxForCursor = function findIdxForCursor(ctx, textRect, cursorAt, fontSize, text) {
  ctx.font = fontSize + 'px Georgia';
  ctx.fillStyle = "white";
  var maxWidth = MAX_TEXT_WIDTH;

  var _splitTextInLines = splitTextInLines(ctx, maxWidth, text);

  var _splitTextInLines2 = _slicedToArray(_splitTextInLines, 2);

  var lines = _splitTextInLines2[0];
  var mapIndices = _splitTextInLines2[1];

  var spaced = fontSize * 1.3;
  var cursor = void 0;
  lines.forEach(function (line, idx) {
    var x = textRect[0] + 10;
    var y = textRect[1] + fontSize + idx * spaced;
    // find cursor
    if (cursorAt && cursorAt.y <= y && cursorAt.y >= y - spaced) {
      line.split('').forEach(function (char, idx) {
        var wd0 = ctx.measureText(line.slice(0, idx)).width;
        var wd1 = ctx.measureText(line.slice(0, idx + 1)).width;
        var curX = cursorAt.x - x;
        if (curX >= wd0 && curX <= wd1) {
          cursor = text.indexOf(line) + idx;
        }
      });
    }
  });
  return cursor;
};

var applyMouseDiff = function applyMouseDiff(textRect, mouseDiff) {
  return [textRect[0] - mouseDiff.x, textRect[1] - mouseDiff.y, textRect[2], textRect[3]];
};

var coordsForLine = function coordsForLine(textRect, fontSize, lineNo) {
  var spaced = fontSize * 1.3;
  return { x: textRect[0] + 10, y: textRect[1] + fontSize + lineNo * spaced };
};

var findPosForCursor = function findPosForCursor(ctx, cursor, text) {
  var maxWidth = MAX_TEXT_WIDTH;

  var _splitTextInLines3 = splitTextInLines(ctx, maxWidth, text);

  var _splitTextInLines4 = _slicedToArray(_splitTextInLines3, 2);

  var lines = _splitTextInLines4[0];
  var mapIndices = _splitTextInLines4[1];


  var line = mapIndices.find(function (line) {
    return line.indexOf(cursor + 1) !== -1;
  });
  var pos = void 0;
  if (line) {
    var lineNo = mapIndices.indexOf(line);
    var idxInLine = line.indexOf(cursor + 1);
    var lineText = line.map(function (i) {
      return text[i - 1];
    }).join('');

    pos = { lineNo: lineNo, idxInLine: idxInLine, line: line };
  }
  return pos;
};

var findCoordsForPos = function findCoordsForPos(ctx, textRect, fontSize, text, pos) {
  var lineNo = pos.lineNo;
  var idxInLine = pos.idxInLine;
  var line = pos.line;

  var lineText = line.map(function (i) {
    return text[i - 1];
  }).join('');

  var _coordsForLine = coordsForLine(textRect, fontSize, lineNo);

  var x = _coordsForLine.x;
  var y = _coordsForLine.y;

  var wd1 = ctx.measureText(lineText.slice(0, idxInLine + 1)).width;

  return { x: x + wd1, y1: y - fontSize + 7, y2: y + 7 };
};

var drawCursor = function drawCursor(ctx, coords) {
  var x = coords.x;
  var y1 = coords.y1;
  var y2 = coords.y2;


  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
  ctx.strokeStyle = null;
};

var findRectsForSelection = function findRectsForSelection(ctx, textRect, cursor1, cursor2, fontSize, text) {
  var idx1 = cursor1;
  var idx2 = cursor2;
  if (idx1 > idx2) {
    var _ref = [idx2, idx1];
    idx1 = _ref[0];
    idx2 = _ref[1];
  }
  var pos1 = findPosForCursor(ctx, idx1, text);
  var pos2 = findPosForCursor(ctx, idx2, text);

  if (!(pos1 && pos2)) return;

  var _splitTextInLines5 = splitTextInLines(ctx, MAX_TEXT_WIDTH, text);

  var _splitTextInLines6 = _slicedToArray(_splitTextInLines5, 2);

  var lines = _splitTextInLines6[0];
  var mapIndices = _splitTextInLines6[1];


  if (pos1.lineNo === pos2.lineNo) {
    var line = mapIndices.find(function (line) {
      return line.indexOf(idx1 + 1) !== -1;
    });
    var lineText = line.map(function (i) {
      return text[i - 1];
    }).join('');

    var _coordsForLine2 = coordsForLine(textRect, fontSize, pos1.lineNo);

    var x = _coordsForLine2.x;
    var y = _coordsForLine2.y;

    var wd1 = ctx.measureText(lineText.slice(0, pos1.idxInLine + 1)).width;
    var wd2 = ctx.measureText(lineText.slice(pos1.idxInLine + 1, pos2.idxInLine)).width;

    return [{ x1: x + wd1, x2: x + wd1 + wd2, y1: y - fontSize + 7, y2: y + 7 }];
  } else {
    var lineNos = Array.apply(0, Array(pos2.lineNo - pos1.lineNo + 1)).map(function (_, idx) {
      return idx + pos1.lineNo;
    });

    return lineNos.map(function (lineNo) {
      var _coordsForLine3 = coordsForLine(textRect, fontSize, lineNo);

      var x = _coordsForLine3.x;
      var y = _coordsForLine3.y;


      var wd1 = void 0,
          wd2 = void 0;
      if (lineNo == pos1.lineNo) {
        var _line = mapIndices.find(function (line) {
          return line.indexOf(idx1 + 1) !== -1;
        });
        var _lineText = _line.map(function (i) {
          return text[i - 1];
        }).join('');
        wd1 = ctx.measureText(_lineText.slice(0, pos1.idxInLine + 1)).width;
        wd2 = ctx.measureText(_lineText.slice(pos1.idxInLine + 1)).width;
      } else if (lineNo === pos2.lineNo) {
        var _line2 = mapIndices.find(function (line) {
          return line.indexOf(idx2 + 1) !== -1;
        });
        var _lineText2 = _line2.map(function (i) {
          return text[i - 1];
        }).join('');
        wd1 = 0;
        wd2 = ctx.measureText(_lineText2.slice(0, pos2.idxInLine)).width;
      } else {
        wd1 = 0;
        wd2 = 280;
      }
      return { x1: x + wd1, x2: x + wd1 + wd2, y1: y - fontSize + 7, y2: y + 7 };
    });
  }
};

var addText = function addText(ctx, canvasDim, fontSize, isFocused, mouseHeld, textRect, text) {
  ctx.font = fontSize + 'px Georgia';
  ctx.fillStyle = "white";
  var maxWidth = MAX_TEXT_WIDTH;

  var _splitTextInLines7 = splitTextInLines(ctx, maxWidth, text);

  var _splitTextInLines8 = _slicedToArray(_splitTextInLines7, 2);

  var lines = _splitTextInLines8[0];
  var mapIndices = _splitTextInLines8[1];

  //const corners = (canvasDim-maxActual)/2 - 10;
  //if (!textRect) textRect = [corners, 100-fontSize, maxActual+20, totalHeight+10];

  var spaced = fontSize * 1.3;
  lines.forEach(function (line, idx) {
    var _coordsForLine4 = coordsForLine(textRect, fontSize, idx);

    var x = _coordsForLine4.x;
    var y = _coordsForLine4.y;

    ctx.fillText(line, x, y, textRect[2] - 20);
  });

  var maxActual = Math.min(300, Math.max.apply(Math, _toConsumableArray(lines.map(function (line) {
    return ctx.measureText(line).width;
  }))));
  var totalHeight = lines.length * spaced;

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
exports.default = _react2.default.createClass({
  displayName: 'ImageCanvas',
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.redraw(nextProps);
  },
  getInitialState: function getInitialState() {
    return { text: '“Others have seen what is and asked why. I have seen what could be and asked why not. ” - Pablo Picasso' };
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    var c = this.refs.canvas;
    initCanvas(c);
    document.addEventListener('keypress', this.handleKeyUp);
    document.addEventListener('keydown', this.handleKeyDown);
    this.textRect = [20, 20, CANVAS_SIZE - 40, CANVAS_SIZE - 40];
    this.cursor = 0;
    setTimeout(this.doRedraw, 100);

    setInterval(function () {
      _this.showCursor = !_this.showCursor;
      setTimeout(_this.doRedraw, 100);
    }, 450);
  },
  doRedraw: function doRedraw() {
    this.redraw(this.props);
  },
  redraw: function redraw(nextProps) {
    if (!nextProps) nextProps = this.props;

    var canvas = this.refs.canvas;
    var ctx = canvas.getContext('2d');

    var mouseHeld = this.mouseHeld;
    var showCursor = this.showCursor;
    var textRect = this.textRect;
    var cursor = this.cursor;
    var _state = this.state;
    var text = _state.text;
    var isFocused = _state.isFocused;
    var isEditing = _state.isEditing;
    var mouseDiff = _state.mouseDiff;


    var hasContrast = nextProps.contrast;
    var fontSize = nextProps.fontSize;

    var img = [].slice.apply(document.images).find(function (i) {
      return nextProps.image.url === i.src;
    });
    if (!img) return;
    var canvasDim = CANVAS_SIZE;

    drawImage(ctx, canvasDim, img);
    if (hasContrast) applyContrast(ctx, canvasDim);
    this.textRect = addText(ctx, canvasDim, fontSize, isFocused, mouseHeld, textRect, text);
    var setCursor = void 0;
    if (isEditing && this.cursor1 && this.cursor2) {
      var rects = findRectsForSelection(ctx, textRect, this.cursor1, this.cursor2, fontSize, text);
      if (!rects) return;

      setCursor = true;
      rects.forEach(function (rect) {
        var x1 = rect.x1;
        var x2 = rect.x2;
        var y1 = rect.y1;
        var y2 = rect.y2;

        ctx.fillStyle = "rgba(87, 205, 255, 0.5)";
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      });
    }
    if (isEditing && showCursor && !setCursor) {
      var pos = findPosForCursor(ctx, this.cursor, text);
      if (pos) {
        var coords = findCoordsForPos(ctx, textRect, fontSize, text, pos);
        drawCursor(ctx, coords);
      }
    }

    this.props.onRedraw && this.props.onRedraw(this.refs.canvas.toDataURL('image/jpeg'));
  },
  cancelEditing: function cancelEditing() {
    this.setState({ isEditing: false });
    setTimeout(this.doRedraw, 50);
  },
  moveCursor: function moveCursor(dir, shift) {
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
  insertOrDeleteChar: function insertOrDeleteChar(char) {
    var currText = this.state.text;
    var newText = void 0;
    if (!this.cursor1 && !this.cursor2) {
      var globalCurrIdx = this.cursor;
      var beforeCurr = currText.slice(0, globalCurrIdx + 1);
      var afterCurr = currText.slice(globalCurrIdx + 1);
      if (!char) {
        newText = beforeCurr.slice(0, -1) + afterCurr;
        this.cursor = globalCurrIdx - 1;
      } else {
        newText = beforeCurr + char + afterCurr;
        this.cursor = globalCurrIdx + 1;
      }
    } else {
      var idx1 = this.cursor1;
      var idx2 = this.cursor2;

      var _beforeCurr = currText.slice(0, idx1 + 1);
      var _afterCurr = currText.slice(idx2);
      if (!char) {
        newText = _beforeCurr + _afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1;
      } else {
        newText = _beforeCurr + char + _afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1 + 1;
      }
    }

    this.setState({ text: newText });
    setTimeout(this.doRedraw, 50);
  },
  selectAll: function selectAll() {
    // doesn't quite select the first char
    this.cursor1 = 1;
    this.cursor2 = this.state.text.length;
    this.cursor = this.cursor2;
    setTimeout(this.doRedraw, 150);
  },
  handleKeyDown: function handleKeyDown(e) {
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
  handleKeyUp: function handleKeyUp(e) {
    if (e.keyIdentifier === 'Meta' || e.keyIdentifier === 'Alt' || e.keyIdentifier === 'Control') return;

    if (this.state.isEditing) {
      if (keys[e.which] === 'backspace') {
        this.insertOrDeleteChar();
      } else {
        var char = String.fromCharCode(e.charCode);
        if (!e.shiftKey) char = char.toLowerCase();
        this.insertOrDeleteChar(char);
      }
    }
  },
  handleMouseDown: function handleMouseDown(e) {
    var mousePos = getMousePos(e, this.refs.canvas);
    this.startPos = mousePos;

    var textRect = this.textRect;
    var isInTextRect = isInRect(mousePos, textRect);

    if (isInTextRect) {
      this.mouseHeld = true;
      if (this.state.isFocused) {
        this.mouseDown = new Date();
      }
      this.setState({ isFocused: true });
      setTimeout(this.doRedraw, 100);
    } else {
      this.setState({ isFocused: false, isEditing: false });
      setTimeout(this.doRedraw, 100);
    }
  },
  handleMouseMove: function handleMouseMove(e) {
    if (this.mouseHeld) {
      // move

      var mousePos = getMousePos(e, this.refs.canvas);

      var mouseDiff = {
        x: this.startPos.x - mousePos.x,
        y: this.startPos.y - mousePos.y
      };

      if (this.state.isFocused && !this.state.isEditing) {
        this.textRect = applyMouseDiff(this.textRect, mouseDiff);
        this.setState({ mouseDiff: mouseDiff });
        this.startPos = mousePos;
      } else if (this.state.isFocused && this.state.isEditing) {
        var cursor1 = this.startPos;
        var cursor2 = mousePos;

        var canvas = this.refs.canvas;
        var ctx = canvas.getContext('2d');
        var textRect = this.textRect;
        var text = this.state.text;

        var fontSize = this.props.fontSize;
        var idx1 = findIdxForCursor(ctx, textRect, cursor1, fontSize, text);
        var idx2 = findIdxForCursor(ctx, textRect, cursor2, fontSize, text);
        this.cursor1 = idx1;
        this.cursor2 = idx2;
      }

      setTimeout(this.doRedraw, 50);
    }
  },
  handleMouseUp: function handleMouseUp(e) {
    if (this.mouseDown) {
      if (new Date() - this.mouseDown < 200) {
        var canvas = this.refs.canvas;
        var ctx = canvas.getContext('2d');
        var textRect = this.textRect;
        var text = this.state.text;

        var fontSize = this.props.fontSize;
        this.cursor = findIdxForCursor(ctx, this.textRect, this.startPos, fontSize, text) || this.cursor;
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
  render: function render() {
    var image = this.props.image || {};
    return _react2.default.createElement(
      'div',
      { className: 'ImageCanvas' },
      _react2.default.createElement('canvas', { ref: 'canvas', width: CANVAS_SIZE, height: CANVAS_SIZE, onMouseDown: this.handleMouseDown, onMouseMove: this.handleMouseMove, onMouseUp: this.handleMouseUp })
    );
  }
});
});

require.register("components/ImagePicker.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({
  displayName: 'ImagePicker',

  propTypes: {
    images: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.shape({ url: _react2.default.PropTypes.string })).isRequired,
    selected: _react2.default.PropTypes.shape({ url: _react2.default.PropTypes.string }),
    onSelect: _react2.default.PropTypes.func
  },

  handleSelect: function handleSelect(image) {
    this.props.onSelect && this.props.onSelect(image);
  },
  render: function render() {
    var _this = this;

    var selected = this.props.selected || {};
    return _react2.default.createElement(
      'div',
      { className: 'ImagePicker' },
      this.props.images.map(function (image) {
        var sel = image.url === selected.url;
        var className = 'ImagePicker-image' + (sel ? ' ImagePicker-image--selected' : '');
        return _react2.default.createElement(
          'div',
          { className: className, onClick: function onClick() {
              return _this.handleSelect(image);
            }, key: image.url },
          _react2.default.createElement(
            'div',
            { className: 'ImagePicker-wrapper' },
            _react2.default.createElement('img', { src: image.url, crossOrigin: 'anonymous' })
          )
        );
      })
    );
  }
});
});

require.register("components/SizePicker.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({
  displayName: 'SizePicker',
  render: function render() {
    return _react2.default.createElement(
      'span',
      null,
      'To be implemented.'
    );
  }
});
});

require.register("components/TextPropertiesPicker.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createClass({
  displayName: "TextPropertiesPicker",

  propTypes: {
    fontSize: _react2.default.PropTypes.number.isRequired,
    onFontSizeChange: _react2.default.PropTypes.func.isRequired
  },

  updateFontSize: function updateFontSize() {
    var val = parseInt(this.refs.fontSize.value, 10);
    this.props.onFontSizeChange(val);
  },
  render: function render() {
    return _react2.default.createElement(
      "div",
      null,
      "Font size:",
      _react2.default.createElement(
        "select",
        { ref: "fontSize", value: this.props.fontSize, onChange: this.updateFontSize },
        [8, 10, 12, 14, 16, 18, 20, 22, 26, 32, 36, 42, 48, 54].map(function (s) {
          return _react2.default.createElement(
            "option",
            { key: s, value: s },
            s
          );
        })
      )
    );
  }
});
});

require.register("container/App.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('actions');

var _LeftSidebar = require('./LeftSidebar');

var _LeftSidebar2 = _interopRequireDefault(_LeftSidebar);

var _RightSidebar = require('./RightSidebar');

var _RightSidebar2 = _interopRequireDefault(_RightSidebar);

var _ImageCanvas = require('components/ImageCanvas');

var _ImageCanvas2 = _interopRequireDefault(_ImageCanvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = _react2.default.createClass({
  displayName: 'App',
  updateDrawnImage: function updateDrawnImage(data) {
    if (this.props.drawing === data) return;
    this.props.onCacheDrawing(data);
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      { className: 'Container' },
      _react2.default.createElement(_LeftSidebar2.default, null),
      _react2.default.createElement(
        'div',
        { className: 'Main' },
        _react2.default.createElement(
          'h4',
          { className: 'Main-subtitle' },
          'Canvas'
        ),
        _react2.default.createElement(_ImageCanvas2.default, { image: this.props.selected, fontSize: this.props.fontSize, contrast: this.props.contrast, onRedraw: this.updateDrawnImage })
      ),
      _react2.default.createElement(_RightSidebar2.default, null)
    );
  }
});

var mapStateToProps = function mapStateToProps(state) {
  return {
    fontSize: state.fontSize,
    contrast: state.contrast,
    selected: state.selectedImage,
    drawing: state.drawing
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    onCacheDrawing: function onCacheDrawing(drawing) {
      dispatch((0, _actions.cacheDrawing)(drawing));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(App);
});

require.register("container/LeftSidebar.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('actions');

var _Card = require('components/Card');

var _Card2 = _interopRequireDefault(_Card);

var _ImagePicker = require('components/ImagePicker');

var _ImagePicker2 = _interopRequireDefault(_ImagePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LeftSidebar = function LeftSidebar(_ref) {
  var availableImages = _ref.availableImages;
  var selectedImage = _ref.selectedImage;
  var onSelectImage = _ref.onSelectImage;

  return _react2.default.createElement(
    'div',
    { className: 'Sidebar' },
    _react2.default.createElement(
      _Card2.default,
      { title: 'Images' },
      _react2.default.createElement(_ImagePicker2.default, { images: availableImages, selected: selectedImage, onSelect: onSelectImage })
    )
  );
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    availableImages: state.availableImages,
    selectedImage: state.selectedImage
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    onSelectImage: function onSelectImage(image) {
      dispatch((0, _actions.selectImage)(image));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LeftSidebar);
});

require.register("container/RightSidebar.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('actions');

var _Card = require('components/Card');

var _Card2 = _interopRequireDefault(_Card);

var _FiltersPicker = require('components/FiltersPicker');

var _FiltersPicker2 = _interopRequireDefault(_FiltersPicker);

var _TextPropertiesPicker = require('components/TextPropertiesPicker');

var _TextPropertiesPicker2 = _interopRequireDefault(_TextPropertiesPicker);

var _SizePicker = require('components/SizePicker');

var _SizePicker2 = _interopRequireDefault(_SizePicker);

var _DownloadButton = require('components/DownloadButton');

var _DownloadButton2 = _interopRequireDefault(_DownloadButton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RightSidebar = function RightSidebar(_ref) {
  var drawing = _ref.drawing;
  var contrast = _ref.contrast;
  var onContrastChange = _ref.onContrastChange;
  var fontSize = _ref.fontSize;
  var onFontSizeChange = _ref.onFontSizeChange;

  return _react2.default.createElement(
    'div',
    { className: 'Sidebar' },
    _react2.default.createElement(
      _Card2.default,
      { title: 'Sizes' },
      _react2.default.createElement(_SizePicker2.default, null)
    ),
    _react2.default.createElement(
      _Card2.default,
      { title: 'Filters' },
      _react2.default.createElement(_FiltersPicker2.default, { contrast: contrast, onContrastChange: onContrastChange })
    ),
    _react2.default.createElement(
      _Card2.default,
      { title: 'Text' },
      _react2.default.createElement(_TextPropertiesPicker2.default, { fontSize: fontSize, onFontSizeChange: onFontSizeChange })
    ),
    _react2.default.createElement(_DownloadButton2.default, { drawing: drawing }),
    _react2.default.createElement(
      'p',
      { className: 'Credit' },
      'Made by ',
      _react2.default.createElement(
        'a',
        { href: 'http://goshakkk.name' },
        'Gosha Arinich'
      ),
      '. ',
      _react2.default.createElement(
        'a',
        { href: 'https://github.com/goshakkk/pabla' },
        'Repo'
      ),
      '.'
    )
  );
};

var mapStateToProps = function mapStateToProps(state) {
  return {
    fontSize: state.fontSize,
    contrast: state.contrast
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    onFontSizeChange: function onFontSizeChange(size) {
      dispatch((0, _actions.setFontSize)(size));
    },
    onContrastChange: function onContrastChange(contrast) {
      dispatch((0, _actions.setContrast)(contrast));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(RightSidebar);
});

require.register("initialize.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reducer = require('reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _App = require('container/App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _redux.createStore)(_reducer2.default);

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(_App2.default, null)
  ), document.querySelector('#app'));
});
});

require.register("reducer.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case 'SET_FONT_SIZE':
      return Object.assign({}, state, { fontSize: action.size });
    case 'SET_CONTRAST':
      return Object.assign({}, state, { contrast: action.contrast });
    case 'SELECT_IMAGE':
      return Object.assign({}, state, { selectedImage: action.image });
    case 'CACHE_DRAWING':
      return Object.assign({}, state, { drawing: action.drawing });
    default:
      return state;
  }
};

var images = [{ url: 'https://images.unsplash.com/photo-1458640904116-093b74971de9?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1451906278231-17b8ff0a8880?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1447969025943-8219c41ea47a?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1421749810611-438cc492b581?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1449960238630-7e720e630019?fm=jpg' }, { url: 'https://images.unsplash.com/photo-1433190152045-5a94184895da?fm=jpg' }];

var initialState = {
  fontSize: 32,
  contrast: true,
  availableImages: images,
  selectedImage: images[0],
  drawing: null
};
});

;
//# sourceMappingURL=app.js.map