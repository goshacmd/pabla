import {renderCanvasLayout} from 'utils/canvas';
import {isInRect} from 'utils/pixels';

class CNode {
  constructor() {
    this._props = {};
    this.parentNode = null;
  }

  setProps(props) {
    this._props = props;
  }

  canHandleMouseEvents() {
    return false;
  }
}

export class CPrimitive extends CNode {
  constructor(type) {
    super();
    this.type = type;
  }

  canHandleMouseEvents() {
    return this.type === 'rect' || this.type === 'image';
  }

  toJSONDesc() {
    return Object.assign({ type: this.type }, this._props);
  }
}

export class CGroup extends CNode {
  constructor() {
    super();
    this._children = [];
  }

  exists(node) {
    return this._children.indexOf(node) !== -1;
  }

  insertFirst(node) {
    if (this.exists(node)) return;
    node.parentNode = this;
    this._children.unshift(node);
  }

  insertAfter(referenceNode, node) {
    const index = this._children.indexOf(node);
    const exists = index !== -1;
    const refIndex = this._children.indexOf(referenceNode);
    if (exists) {
      // move
      this._children.splice(refIndex + 1, 0, this._children.splice(index, 1)[0]);
    } else {
      // insert
      node.parentNode = this;
      this._children.splice(refIndex + 1, 0, node);
    }
  }

  ejectChild(node) {
    const index = this._children.indexOf(node);
    this._children.splice(index, 1);
    node.parentNode = null;
  }

  toJSONDesc() {
    return {
      type: 'group',
      children: this._children.map(x => x.toJSONDesc())
    };
  }
}

export class CSurface extends CGroup {
  constructor(width, height, domNode) {
    super();
    this.domNode = domNode;
    this.setDim(width, height);
  }

  setDim(width, height) {
    this.width = width;
    this.height = height;
    this.scaleCanvas();
  }

  scaleCanvas() {
    const node = this.domNode;
    const {width, height} = this;
    const ctx = node.getContext('2d');
    const scale = window.devicePixelRatio || 1;
    node.width = width*scale;
    node.height = height*scale;
    node.style.width = width + 'px';
    node.style.height = height + 'px';
    ctx.scale(scale, scale);
  }

  findNodesInPoint({x, y}) {
    const childrenOrSelf = x => {
      if (x._children) {
        return x._children.map(childrenOrSelf).reduce((acc, y) => acc.concat(y), []);
      }
      return [x];
    }

    const inPoint = childrenOrSelf(this)
      .filter(x => x._props.frame && x.canHandleMouseEvents())
      .filter(_ => {
        return isInRect({x, y}, _._props.frame);
      });

    return inPoint;
  }

  findHandlerForEvent(point, type) {
    const nodes = this.findNodesInPoint(point).filter(x => x._props[type]);
    return nodes.slice(-1)[0];
  }

  render() {
    const ctx = this.domNode.getContext('2d');
    renderCanvasLayout(ctx, this.width, this.height, this.toJSONDesc());
  }
}
