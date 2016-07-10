import React from 'react';
import ReactDOM from 'react-dom';

import ReactUpdates from 'react/lib/ReactUpdates';
import ReactMultiChild from 'react/lib/ReactMultiChild';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';

import {CPrimitive, CGroup, CSurface} from 'utils/objectCanvas';
import {getMousePos} from 'utils/pixels';
import debounce from 'utils/debounce';

const createComponent = (name, ...mixins) => {
  function C(element) {
    this.node = null;
    this.subscriptions = null;
    this.listeners = null;
    this._mountImage = null;
    this._renderedChildren = null;
    this._currentElement = null;
    this.construct(element);
  };

  C.displayName = name;

  mixins.forEach(mixin => Object.assign(C.prototype, mixin));

  return C;
};

function injectAfter(parentNode, referenceNode, node) {
  if (referenceNode === null) {
    parentNode.insertFirst(node);
  } else {
    parentNode.insertAfter(referenceNode, node);
  }
}

const ContainerMixin = Object.assign({}, ReactMultiChild.Mixin, {
  moveChild(child, afterNode, toIndex, lastIndex) {
    const childNode = child._mountImage;
    injectAfter(this.node, afterNode, childNode);
  },

  createChild(child, afterNode, childNode) {
    child._mountImage = childNode;
    injectAfter(this.node, afterNode, childNode);
  },

  removeChild(child) {
    const childNode = child._mountImage;
    child._mountImage = null;
    this.node.ejectChild(childNode);
  },

  updateChildrenAtRoot(nextChildren, transaction) {
    this.updateChildren(nextChildren, transaction, {});
  },

  mountAndInjectChildrenAtRoot(children, transaction) {
    this.mountAndInjectChildren(children, transaction, {});
  },

  updateChildren(nextChildren, transaction, context) {
    this._updateChildren(nextChildren, transaction, context);
  },

  mountAndInjectChildren(children, transaction, context) {
    const mountedImages = this.mountChildren(
      children,
      transaction,
      context
    );
    let i = 0;
    for (let key in this._renderedChildren) {
      if (this._renderedChildren.hasOwnProperty(key)) {
        const child = this._renderedChildren[key];
        child._mountImage = mountedImages[i];
        injectAfter(this.node, mountedImages[i - 1], mountedImages[i]);
        i++;
      }
    }
  }
});

const Surface = React.createClass({
  mixins: [ContainerMixin],

  componentWillMount() {
    this.passRendered = debounce(this._passRendered, 500);
  },

  componentDidMount() {
    try {
    this._debugID = this._reactInternalInstance._debugID;

    const {width, height} = this.props;
    this.node = new CSurface(width, height, ReactDOM.findDOMNode(this));

    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.mountAndInjectChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    this.node.render();
    this.passRendered();
    } catch(e) { console.error(e); }
  },

  componentDidUpdate(oldProps) {
    try {
    const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
    transaction.perform(
      this.updateChildren,
      this,
      this.props.children,
      transaction,
      ReactInstanceMap.get(this)._context
    );
    ReactUpdates.ReactReconcileTransaction.release(transaction);

    if (oldProps.height !== this.props.height || oldProps.width !== this.props.width) {
      this.node.setDim(this.props.width, this.props.height);
    }

    this.node.render();
    this.passRendered();
    } catch(e) { console.error(e); }
  },

  _passRendered() {
    if (!this.isMounted) return;
    const cb = this.props.onRedraw;
    const {canvas} = this.refs;
    if (!cb || !canvas) return;

    const data = canvas.toDataURL('image/jpeg');
    cb(data);
  },

  _findAndCallEventHandler(e, type) {
    const mousePos = getMousePos(e, this.refs.canvas);

    const handler = this._handler ? this._handler : this.node.findHandlerForEvent(mousePos, type);
    if (handler) {
      if (handler._props.mouseSnap && type === 'onMouseDown') this._handler = handler;
      handler._props[type](e, mousePos);
    }
  },

  onMouseDown(e) {
    this._findAndCallEventHandler(e, 'onMouseDown');
  },

  onMouseMove(e) {
    this._findAndCallEventHandler(e, 'onMouseMove');
  },

  onMouseUp(e) {
    this._findAndCallEventHandler(e, 'onMouseUp');
    this._handler = null;
  },

  render() {
    const {onMouseDown, onMouseMove, onMouseUp} = this;
    return <canvas ref="canvas" {...{onMouseDown, onMouseMove, onMouseUp}} />;
  }
});

const NodeMixin = {
  construct(element) {
    this._currentElement = element;
  },

  getNativeNode() {
    return this.node;
  },

  getPublicInstance() {
    return this.node;
  },

  applyNodeProps(oldProps, props) {
    const {node} = this;
    node.setProps(props);
  }
};

const Group = createComponent('Group', NodeMixin, ContainerMixin, {
  mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
    this.node = new CGroup();
    this.applyNodeProps({}, this._currentElement.props);
    this.mountAndInjectChildren(this._currentElement.props.children, transaction, context);
    return this.node;
  },

  receiveComponent(nextComponent, transaction, context) {
    this.applyNodeProps(this._currentElement.props, nextComponent.props);
    this.updateChildren(nextComponent.props.children, transaction, context);
    this._currentElement = nextComponent;
  },

  unmountComponent() {
    this.unmountChildren();
  }
});

const RenderableMixin = Object.assign({}, NodeMixin, {
  unmountComponent() {
  }
});

const createPrimitive = (name, primName) => {
  return createComponent(name, RenderableMixin, {
    mountComponent(transaction, nativeParent, nativeContainerInfo, context) {
      this.node = new CPrimitive(primName);
      this.applyNodeProps({}, this._currentElement.props);
      return this.node;
    },

    receiveComponent(nextComponent, transaction, context) {
      this.applyNodeProps(this._currentElement.props, nextComponent.props);
      this._currentElement = nextComponent;
    }
  });
};

const Rect = createPrimitive('Rect', 'rect');
const Filter = createPrimitive('Filter', 'filter');
const Image = createPrimitive('Image', 'image');
const Text = createPrimitive('Text', 'text');
const Outline = createPrimitive('Outline', 'outline');
const Line = createPrimitive('Line', 'line');

export const CanvasRect = Rect;
export const CanvasFilter = Filter;
export const CanvasImage = Image;
export const CanvasText = Text;
export const CanvasOutline = Outline;
export const CanvasLine = Line;
export const Canvas = Surface;
export const CanvasGroup = Group;
