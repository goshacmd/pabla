const images = [
  { url: 'https://images.unsplash.com/photo-1458640904116-093b74971de9?fm=jpg' },
  //{ url: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?fm=jpg' },
  //{ url: 'https://images.unsplash.com/photo-1451906278231-17b8ff0a8880?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1447969025943-8219c41ea47a?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1421749810611-438cc492b581?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1449960238630-7e720e630019?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1433190152045-5a94184895da?fm=jpg' }
];

export const getPopularImages = () => Promise.resolve(images);
