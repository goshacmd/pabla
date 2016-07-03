import React from 'react';
import {getImage} from 'utils/imageCache';

export default (Component) => {
  return React.createClass({
    loadImage(url) {
      if (!url) return Promise.resolve();
      if (this.props.image !== url) this.setState({ image: null });
      return getImage(url).then(img => {
        this.setState({ image: img });
      });
    },

    getInitialState() {
      return {};
    },

    componentWillReceiveProps(nextProps) {
      this.loadImage(nextProps.image).then(() => this.forceUpdate());
    },

    componentWillMount() {
      this.loadImage(this.props.image);
    },

    render() {
      const {image: _, ...rest} = this.props;
      const {image} = this.state;
      return <Component image={image} {...rest} />;
    }
  });
};
