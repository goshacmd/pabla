import {renderCanvasLayout} from 'utils/canvas';

class CNode {
  constructor() {
    this._props = {};
  }

  setProps(props) {
    this._props = props;
  }
}

export class CPrimitive extends CNode {
  constructor(type) {
    super();
    this.type = type;
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
      this._children.splice(refIndex + 1, 0, node);
    }
  }

  ejectChild(node) {
    const index = this._children.indexOf(node);
    this._children.splice(index, 1);
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

  render() {
    const ctx = this.domNode.getContext('2d');
    renderCanvasLayout(ctx, this.width, this.height, this.toJSONDesc());
  }
}
