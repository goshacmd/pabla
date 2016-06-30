import React from 'react';

export default React.createClass({
  propTypes: {
    query: React.PropTypes.string.isRequired,
    onSearch: React.PropTypes.func.isRequired,
    onSearchReset: React.PropTypes.func.isRequired,
    onQueryChange: React.PropTypes.func.isRequired
  },

  search(e) {
    e.preventDefault();

    const value = this.props.query;

    if (value && value.length > 0) {
      this.props.onSearch(value);
    } else {
      this.props.onSearchReset();
    }
  },

  setQuery(e) {
    e.preventDefault();
    const value = e.target.value;
    this.props.onQueryChange && this.props.onQueryChange(value);
  },

  render() {
    return <form onSubmit={this.search}>
      <input type="text" className="SearchBar" placeholder="Search images" onChange={this.setQuery} value={this.props.query} />
    </form>;
  }
});
