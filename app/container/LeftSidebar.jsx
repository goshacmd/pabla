import React from 'react';
import {connect} from 'react-redux';
import {selectImage} from 'actions';

import Card from 'components/Card';
import ImagePicker from 'components/ImagePicker';

const LeftSidebar = ({ availableImages, selectedImage, onSelectImage }) => {
  return <div className="Sidebar">
    <Card title="Images">
      <ImagePicker images={availableImages} selected={selectedImage} onSelect={onSelectImage} />
    </Card>
  </div>;
};

const mapStateToProps = (state) => ({
  availableImages: state.availableImages,
  selectedImage: state.selectedImage
});

const mapDispatchToProps = (dispatch) => ({
  onSelectImage(image) {
    dispatch(selectImage(image));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(LeftSidebar);
