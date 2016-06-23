import React from 'react';

import ImageCanvas from './ImageCanvas';
import ImagePicker from './ImagePicker';
import Card from './Card';

const images = [
  { url: 'https://images.unsplash.com/photo-1458640904116-093b74971de9?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1451906278231-17b8ff0a8880?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1447969025943-8219c41ea47a?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1421749810611-438cc492b581?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1449960238630-7e720e630019?fm=jpg' },
  { url: 'https://images.unsplash.com/photo-1433190152045-5a94184895da?fm=jpg' }
];

export default React.createClass({
  getInitialState() {
    return { selected: images[0], fontSize: 32, contrast: true };
  },

  handleSelect(image) {
    this.setState({ selected: image });
  },

  updateFontSize() {
    this.setState({ fontSize: parseInt(this.refs.fontSize.value, 10) });
  },

  updateContrast() {
    this.setState({ contrast: this.refs.contrast.checked });
  },

  handleDownload(e) {
    const uri = this.state.imageDataURL;
    const link = e.target;
    link.href = uri;
    link.click();
  },

  updateDrawnImage(data) {
    if (this.state.imageDataURL === data) return;
    this.setState({ imageDataURL: data });
  },

  render() {
    return (
      <div className="Container">
        <div className="Sidebar">
          <Card title="Images">
            <ImagePicker images={images} selected={this.state.selected} onSelect={this.handleSelect} />
          </Card>
        </div>
        <div className="Main">
          <ImageCanvas image={this.state.selected} fontSize={this.state.fontSize} contrast={this.state.contrast} onRedraw={this.updateDrawnImage} />
        </div>
        <div className="Sidebar">
          <Card title="Sizes">
            To be implemented.
          </Card>
          <Card title="Filters">
            <label>
              <input ref="contrast" checked={this.state.contrast} type="checkbox" onChange={this.updateContrast} /> Contrast
            </label>
          </Card>
          <Card title="Text">
            Font size:
            <select ref="fontSize" value={this.state.fontSize} onChange={this.updateFontSize}>
              {[8, 10, 12, 14, 16, 18, 20, 22, 26, 32, 36, 42, 48, 54].map(s => <option value={s}>{s}</option>)}
            </select>
          </Card>
          <div><a className="Button" download="pabla.jpg" target="_blank" onClick={this.handleDownload}>Download</a></div>
        </div>
      </div>
    );
  }
});
