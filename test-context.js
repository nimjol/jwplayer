const testsContext = require.context('./test/unit', true);
testsContext.keys().forEach(testsContext);

const polyfillsContext = require.context('./src/js/polyfills', true);
polyfillsContext.keys().forEach(polyfillsContext);
