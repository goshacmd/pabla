import React from 'react';
import {connect} from 'react-redux';
import {selectImage, searchImages, resetSearch} from 'actions';

import Card from 'components/Card';
import ImagePicker from 'components/ImagePicker';

const LeftSidebar = ({ availableImages, selectedImage, onSelectImage, onSearch, onSearchReset}) => {
  return <div className="Sidebar">
    <Card title="Images">
      <ImagePicker images={availableImages} selected={selectedImage} onSelect={onSelectImage} onSearch={onSearch} onSearchReset={onSearchReset} />
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
  },

  onSearch(query) {
    dispatch(searchImages(query));
  },

  onSearchReset() {
    dispatch(resetSearch());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(LeftSidebar);
