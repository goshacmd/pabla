export default (name, drawFn) => {
  const CanvasComp = function(el) {
    this._el = el;
  };
  CanvasComp.displayName = 'Rect';
  Object.assign(CanvasComp.prototype, {
    construct() {
    },
    mountComponent(transaction, hostParent, hostContainerInfo, context) {
      return {};
    },
    receiveComponent() {
    },
    unmountComponent() {
    },
    getNativeNode() {
      return drawFn(this._el.props);
    },
    getPublicInstance() {
      return drawFn(this._el.props);
    }
  });
  return CanvasComp;
};
