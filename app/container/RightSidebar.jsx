import React from 'react';
import {connect} from 'react-redux';
import {setFilter, setFont, setFontSize, setColor, setBold, setItalic, setSize} from 'actions';

import Card from 'components/Card';
import FiltersPicker from 'components/FiltersPicker';
import TextPropertiesPicker from 'components/TextPropertiesPicker';
import SizePicker from 'components/SizePicker';
import DownloadButton from 'components/DownloadButton';

const RightSidebar = ({ drawing, filter, onFilterChange, textAttrs, onFontChange, onFontSizeChange, onColorChange, onBoldChange, onItalicChange, size, onSizeSelect }) => {
  return <div className="Sidebar">
    <Card title="Sizes">
      <SizePicker size={size} onSizeSelect={onSizeSelect} />
    </Card>
    <Card title="Filters">
      <FiltersPicker filter={filter} onFilterChange={onFilterChange} />
    </Card>
    <Card title="Text">
      <TextPropertiesPicker
        textAttrs={textAttrs}
        onFontChange={onFontChange}
        onFontSizeChange={onFontSizeChange}
        onColorChange={onColorChange}
        onBoldChange={onBoldChange}
        onItalicChange={onItalicChange} />
    </Card>
    <DownloadButton drawing={drawing} />
    <p className="Credit">
      Made by <a href="http://goshakkk.name">Gosha Arinich</a>. <a href="https://github.com/goshakkk/pabla">Repo</a>.
      Learn about rendering to canvas with React <a href="http://goshakkk.name/react-custom-renderers/">here</a>.
    </p>
  </div>;
};

const mapStateToProps = (state) => ({
  textAttrs: state.textAttrs,
  filter: state.filter,
  size: state.size,
  drawing: state.drawing
});

const mapDispatchToProps = (dispatch) => ({
  onFontChange(font) {
    dispatch(setFont(font));
  },

  onFontSizeChange(size) {
    dispatch(setFontSize(size));
  },

  onColorChange(color) {
    dispatch(setColor(color));
  },

  onBoldChange(bold) {
    dispatch(setBold(bold));
  },

  onItalicChange(italic) {
    dispatch(setItalic(italic));
  },

  onFilterChange(filter) {
    dispatch(setFilter(filter));
  },

  onSizeSelect(size) {
    dispatch(setSize(size));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RightSidebar);
