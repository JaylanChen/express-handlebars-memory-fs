Enhances [express-handlebars](https://github.com/ericf/express-handlebars) to support read hanblebars files from memory
========================================

P.S：webpack 4.x please use version 1.x

Installation
------------
You must be running express, express-handlebars, webpack, webpack-dev-middleware on node.

Install the plugin with npm:
```shell
$ npm install --save-dev express-handlebars-memory-fs
```

Usage
-----------
Use the plugin in your node server.js:
```javascript
const express = require('express');
const webpackDevMiddleware = require("webpack-dev-middleware");

const expressHandlebarsMemoryFs = require('express-handlebars-memory-fs');

const app = express();
// express-handlebars and other code

let webpackConfig = require("./build");
let compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
    // webpack-dev-middleware options
  })
);

expressHandlebarsMemoryFs(compiler.outputFileSystem);
```

This plugin does not do anything in the following cases.

1、It will do anything if in a production environment(process.env.NODE_ENV === 'production')
