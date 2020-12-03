增强 [express-handlebars](https://github.com/ericf/express-handlebars) 以便支持从内存中读取handlebars文件
========================================

P.S：webpack 4.x 请使用 1.x 版本

安装
------------
你的应用需要是一个使用 express, express-handlebars, webpack, webpack-dev-middleware 的 node 应用.

npm 安装:
```shell
$ npm install --save-dev express-handlebars-memory-fs
```

使用
-----------
使用此插件在node服务文件中：
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

这个插件在以下情况将不会做任何事情

1、生产环境(process.env.NODE_ENV === 'production')下不支持任何更改
