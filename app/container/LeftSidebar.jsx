import React from 'react';
import {connect} from 'react-redux';
import {selectImage, searchImages, resetSearch, setQuery} from 'actions';

import Card from 'components/Card';
import SearchBar from 'components/SearchBar';
import ImagePicker from 'components/ImagePicker';

const LeftSidebar = ({ query, availableImages, selectedImage, onSelectImage, onSearch, onSearchReset, onQueryChange}) => {
  return <div className="Sidebar">
    <Card title="Images">
      <SearchBar
        query={query}
        onSearch={onSearch}
        onSearchReset={onSearchReset}
        onQueryChange={onQueryChange} />
      <ImagePicker
        images={availableImages}
        selected={selectedImage}
        onSelect={onSelectImage} />
    </Card>
  </div>;
};

const mapStateToProps = (state) => ({
  availableImages: state.availableImages,
  selectedImage: state.selectedImage,
  query: state.query
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
  },

  onQueryChange(query) {
    dispatch(setQuery(query));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(LeftSidebar);
