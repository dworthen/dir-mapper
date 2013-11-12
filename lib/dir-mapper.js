var fs        = require('fs')
  , path      = require('path')
  , util      = require('util')
  , Readable  = require('stream').Readable
  , _         = require('lodash')
  , RSVP      = require('rsvp');
  //, events    = require('events')
  //, helpers   = require('./helpers')
  //, dirsLeft  = 1
  //, filesLeft = 0
  //, recurse   = true
  //, walking   = false
  //, cb        = null;
//  , walked = false;

function walk(dir, cb) {
  var filesLeft = 0
    , files = [];

  _walk(dir, function() {});

  function _walk(dir, _cb) {
    var err;
    fs.readdir(dir, function(err, _files) {
      if(err) return cb(err);
      filesLeft += _files.length;
      _files = _.map(_files, function(file) {
        return path.join(dir, file);
      });
      _.each(_files, stats);
      _cb();
    });
  }

  function stats(path) {
    files.push(path);
    fs.stat(path, function(err, stats) {
      if(err) return cb(err);
      if(stats.isDirectory()) {
        filesLeft++;
        _walk(path, function() {
          filesLeft--; 
        });
      }
      filesLeft--;
      if(filesLeft < 1) {
        return cb(undefined, files);
      }
    });
  }

}

function promiseWalk(dir) {
  var promise = new RSVP.Promise(function(resolve, reject) {
    walk(dir, function(err, files) {
      if(err) reject(err);
      else resolve(files);
    });
  });
  return promise;
}

function DirMapper(dir, opts) {
  this.dir = dir;
  this.filesLeft = 0;
  this.files = [];
  this.current = 0;
  Readable.call(this, opts);
}

util.inherits(DirMapper, Readable);

DirMapper.prototype._read = function() {
  var self = this;

  if(self.dir) {
    _walk(self.dir, stat);
    self.dir = undefined;
  } else {
    stat();
  }

  function stat() {
    var file;
    if((file = self.files[self.current])) {
      fs.stat(file, function(err, stats) {
        if(err) self.emit('error', err);
        if(stats.isDirectory()) {
          self.dir = file;
        }
        self.current++;
        self.push(file);
      });
    } else {
      self.push(null);
    }
  }
 
  function _walk(dir, _cb) {
    fs.readdir(dir, function(err, _files) {
      if(err) self.emit('error', err);
      self.filesLeft += _files.length;
      _files = _.map(_files, function(file) {
        return path.join(dir, file);
      });
      self.files = self.files.concat(_files);
      _cb();
    });
  }

};

function createReadStream(dir, opts) {
  return new DirMapper(dir, opts);
}

module.exports = {
  walk: walk,
  createReadStream: createReadStream,
  promiseWalk: promiseWalk
};
