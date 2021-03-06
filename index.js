'use strict';

const path = require('path');
const View = require("express/lib/view");
const ExpressHandlebars = require("express-handlebars/lib/express-handlebars");

function ExpressHandlebarsMemoryFs(memoryFs) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (!memoryFs) {
    throw new Error('express-handlebars-memory-fs expects 1 arguments, webpack outputFileSystem. such as: `compiler.outputFileSystem`.');
  }

  const viewResolve = View.prototype.resolve;
  View.prototype.resolve = function resolve(dir, file) {
    var ext = this.ext;
    // <path>.<ext>
    var viewPath = path.join(dir, file);
    var viewStat = tryStat(viewPath);

    if (viewStat && viewStat.isFile()) {
      return viewPath;
    }

    // <path>/index.<ext>
    viewPath = path.join(dir, path.basename(file, ext), 'index' + ext);
    viewStat = tryStat(viewPath);

    if (viewStat && viewStat.isFile()) {
      return viewPath;
    }

    return viewResolve.call(this, dir, file);
  };

  function tryStat(path) {
    try {
      return memoryFs.statSync(path);
    } catch (e) {
      return undefined;
    }
  }

  const ExpressHandlebars_getFile = ExpressHandlebars.prototype._getFile;
  ExpressHandlebars.prototype._getFile = function (filePath, options) {
    filePath = path.resolve(filePath);
    options || (options = {});

    let cache = this._fsCache;
    let file = options.cache && cache[filePath];

    if (file) {
      return file;
    }
    let fileStat = tryStat(filePath);
    if (fileStat && fileStat.isFile()) {
      file = cache[filePath] = new Promise(function (resolve, reject) {
        memoryFs.readFile(filePath, 'utf8', function (err, file) {
          if (err) {
            reject(err);
          } else {
            resolve(file);
          }
        });
      });
      return file.catch(function (err) {
        delete cache[filePath];
        throw err;
      });
    }

    return ExpressHandlebars_getFile.call(this, filePath, options);
  };

  const ExpressHandlebars_getDir = ExpressHandlebars.prototype._getDir;
  ExpressHandlebars.prototype._getDir = function (dirPath, options) {
    dirPath = path.resolve(dirPath);
    options || (options = {});

    let cache = this._fsCache;
    let dir = options.cache && cache[dirPath];

    if (dir) {
      return dir.then(function (dir) {
        return dir.concat();
      });
    }
    let extname = this.extname;
    // Optimistically cache dir promise to reduce file system I/O, but remove
    // from cache if there was a problem.
    dir = cache[dirPath] = new Promise(function (resolve, reject) {
      memoryFs.stat(dirPath, function (err, stat) {
        if (err) {
          reject(err);
        } else {
          let relativeFileNams = [];
          let files = readdirSync(dirPath, extname);
          for (let m = 0; m < files.length; m++) {
            let file = files[m];
            let fileName = path.relative(dirPath, file);
            // home\partial.hbs  →  home/partial.hbs
            fileName = fileName.split(path.sep).join('/');
            relativeFileNams.push(fileName);
          }
          resolve(relativeFileNams);
        }
      });
    });
    if (dir) {
      return dir.then(function (dir) {
        return dir.concat();
      });
    }

    return ExpressHandlebars_getDir.call(this, dirPath, options);
  };

  function readdirSync(dirPath, ext) {
    let filePaths = [];
    let childrenFilePaths = memoryFs.readdirSync(dirPath);
    for (let i = 0; i < childrenFilePaths.length; i++) {
      let tempFile = childrenFilePaths[i];
      tempFile = path.join(dirPath, tempFile);
      let tempFileStat = memoryFs.statSync(tempFile);
      if (!tempFileStat) {
        continue;
      }
      if (tempFileStat.isFile()) {
        let fileExt = path.extname(tempFile);
        if (fileExt !== ext) {
          continue;
        }
        filePaths.unshift(tempFile);
      } else {
        let childFilePaths = readdirSync(tempFile, ext);
        filePaths.push(...childFilePaths);
      }
    }
    return filePaths;
  }
}

module.exports = ExpressHandlebarsMemoryFs;
