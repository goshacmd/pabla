import React from 'react';
import {connect} from 'react-redux';
import {setContrast, setFontSize} from 'actions';

import Card from 'components/Card';
import FiltersPicker from 'components/FiltersPicker';
import TextPropertiesPicker from 'components/TextPropertiesPicker';
import SizePicker from 'components/SizePicker';
import DownloadButton from 'components/DownloadButton';

const RightSidebar = ({ drawing, contrast, onContrastChange, fontSize, onFontSizeChange }) => {
  return <div className="Sidebar">
    <Card title="Sizes">
      <SizePicker />
    </Card>
    <Card title="Filters">
      <FiltersPicker contrast={contrast} onContrastChange={onContrastChange} />
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
  contrast: state.contrast
});

const mapDispatchToProps = (dispatch) => ({
  onFontSizeChange(size) {
    dispatch(setFontSize(size));
  },

  onContrastChange(contrast) {
    dispatch(setContrast(contrast));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(RightSidebar);
