// TODO: query a real API

const images = [
  { url: 'https://images.unsplash.com/photo-1461016951828-c09537329b3a?fm=jpg', tags: ['field', 'landscape', 'sunlight'] },
  { url: 'https://images.unsplash.com/photo-1461295025362-7547f63dbaea?fm=jpg', tags: ['crops'] },
  { url: 'https://images.unsplash.com/photo-1465326117523-6450112b60b2?fm=jpg', tags: ['forest', 'hill'] },
  { url: 'https://images.unsplash.com/photo-1458640904116-093b74971de9?fm=jpg', tags: ['dark', 'field'] },
  //{ url: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?fm=jpg' },
  //{ url: 'https://images.unsplash.com/photo-1451906278231-17b8ff0a8880?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1447969025943-8219c41ea47a?fm=jpg', tags: ['cat', 'kitten'] },
  { url: 'https://images.unsplash.com/photo-1421749810611-438cc492b581?fm=jpg', tags: ['water', 'landscape'] },
  { url: 'https://images.unsplash.com/photo-1449960238630-7e720e630019?fm=jpg', tags: ['water', 'seaside'] },
  { url: 'https://images.unsplash.com/photo-1433190152045-5a94184895da?fm=jpg', tags: ['water', 'cliff'] },
  { url: 'https://images.unsplash.com/9/fields.jpg?ixlib=rb-0.3.5&q=80&fm=jpg', tags: ['field', 'stack'] }
];

export const getPopularImages = () => Promise.resolve(images);

export const searchImages = (query) => {
  const filteredImages = images.filter(img => {
    return img.tags.some(tag => {
      return tag.indexOf(query) !== -1;
    });
  });
  return Promise.resolve(filteredImages);
};
