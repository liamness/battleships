const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const postcssSimpleVars = require('postcss-simple-vars');
const postcssCalc = require('postcss-calc');
const autoPrefixer = require('autoprefixer');

const variables = {
  gridSpacing: '32px',
  gridLineSize: '1px',
  gridOpponentLineColor: '#eca',
  gridPlayerLineColor: '#ace',
};

module.exports = {
  plugins: [
    postcssImport(),
    postcssNested(),
    postcssSimpleVars({ variables }),
    postcssCalc(),
    autoPrefixer(),
  ],
};
