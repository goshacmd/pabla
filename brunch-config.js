module.exports = {
  files: {
    javascripts: {
      joinTo: 'app.js'
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {
      presets: ['es2015', 'react', 'stage-0'],
      plugins: ['syntax-object-rest-spread']
    },

    postcss: {
      processors: [
        require('autoprefixer')
      ]
    }
  }
};
