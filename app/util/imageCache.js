const _cache = {};

const _get = (src) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
  });
};

export const getImage = (src) => {
  if (src in _cache) {
    return _cache[src];
  } else {
    const img = _get(src);
    _cache[src] = img;
    return img;
  }
};
