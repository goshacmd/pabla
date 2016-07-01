import React from 'react';
import {connect} from 'react-redux';
import {setFilter, setFontSize, setSize} from 'actions';

import Card from 'components/Card';
import FiltersPicker from 'components/FiltersPicker';
import TextPropertiesPicker from 'components/TextPropertiesPicker';
import SizePicker from 'components/SizePicker';
import DownloadButton from 'components/DownloadButton';

const RightSidebar = ({ drawing, filter, onFilterChange, fontSize, onFontSizeChange, size, onSizeSelect }) => {
  return <div className="Sidebar">
    <Card title="Sizes">
      <SizePicker size={size} onSizeSelect={onSizeSelect} />
    </Card>
    <Card title="Filters">
      <FiltersPicker filter={filter} onFilterChange={onFilterChange} />
    </Card>
    <Card title="Text">
      <TextPropertiesPicker fontSize={fontSize} onFontSizeChange={onFontSizeChange} />
    </Card>
    <DownloadButton drawing={drawing} />
    <p className="Credit">
      Made by <a href="http://goshakkk.name">Gosha Arinich</a>. <a href="https://github.com/goshakkk/pabla">Repo</a>.
    </p>
  </div>;
};

const mapStateToProps = (state) => ({
  fontSize: state.fontSize,
  filter: state.filter,
  size: state.size,
  drawing: state.drawing
});

const mapDispatchToProps = (dispatch) => ({
  onFontSizeChange(size) {
    dispatch(setFontSize(size));
  },

  onFilterChange(filter) {
    dispatch(setFilter(filter));
  },

  onSizeSelect(size) {
    dispatch(setSize(size));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RightSidebar);
