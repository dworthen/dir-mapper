var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , events = require('events');
  // , dirsLeft
//  , filesLeft
//  , recurse
//  , cb = null
//  , walking = false
//  , walked = false;

var DirMapper = function(dir, _recurse, callback) {
  if (!(this instanceof DirMapper)) 
    return new DirMapper(dir, _recurse, callback);
    
  this.files = [];
  this.filesLeft = 0;
  this.dirsLeft = 1;
  this.recurse = true;
  this.walking = false;
  this.cb = null;
  
  if(dir) return this.walk(dir, _recurse, callback);
  return this;
  
};

util.inherits(DirMapper, events.EventEmitter);

DirMapper.prototype.walk = function(dir, _recurse, callback) {
  var self = this;
  
  if(!this.walking) {
    this.cb = callback;
    if(_recurse && typeof(_recurse) === 'function') {
      this.cb = _recurse;
    } else if (typeof(_recurse) !== 'undefined'){
      this.recurse = _recurse;
    }
    this.walking = true;
  }

  if(!dir) {
    this.walking = false;
    if (this.cb) return this.cb((new Error('DirMapper.walk expects a directory to walk.')), undefined);
      return self.emit('error', (new Error('DirMapper.walk expects a directory to walk.')));
  }
  
  fs.readdir(dir, function(err, files) {
  	if (err) {
      self.walking = false;
      if(self.cb) return self.cb(err);
        return self.emit('error', err); 
  	}
		self.dirsLeft--;
		if(!files) {
     walking = false;
 	  if (cb) return cb(undefined, self);
       return self.emit('end', self);
		}
    
		files.forEach(function(file) {
			file = path.join(dir, file);
			
			self.filesLeft++; 
			fs.lstat(file, function(err, stats) {
				if(err) {
          self.walking = false;
  			  if(self.cb) return self.cb(err);
            return self.emit('error', err);
				}
				if(!stats) {
          walking = false;
 			    if (cb) return cb(undefined, self);
            return self.emit('end', self);
				}
				if(stats.isDirectory()) {
					self.dirsLeft++;
  				self.walk(file);
				} 
        self.add(file);
				// self.files.push({file: file});
				self.filesLeft--;
        if(self.filesLeft === 0 && self.dirsLeft === 0) {
          self.walking = false;
          process.nextTick(function() {
						if (self.cb) return self.cb(undefined, self);
              return self.emit('end', self);
          });
				}
			});
		});
	});
};

DirMapper.prototype.add = function(files, field) {
  var self = this
    , obj = {};
  field = field || 'file';
  if (files instanceof Array) {
    for(var i = 0; i < files.length; i++) {
      // obj[field] = files[i];
      self.files.push(files[i]);
    }
  } else if ( typeof(files) === "string") {
    obj[field] = files;
    self.files.push(obj);
  } else {
    throw new Error("Can only add a file or an array of files.");
  }
};

DirMapper.prototype.sort = function(order, field) {
  field = field || 'file';

  if(!this.files) return;

  var compare = function(a, b) {
    if (a[field] && b[field]) {
      if (a[field] < b[field]) return -order;
      if (a[field] > b[field]) return order;
    }
      return 0;
  }
  
  this.files.sort(compare);
  
  return this;
};

DirMapper.prototype.flag = function(flag, fn) {
  var self = this
    , newDirMapper
    , newList
    , opt = true
    , i, j, temp;

  if(!self.files) return;

  function flag() {
    
  }

  if(flag instanceof Array) {
    
  }

  if(!fn) {
    newDirMapper = new DirMapper();
    newList = self.files.filter(function(el) {
      opt = true;
      if (flag instanceof Array) {
        for(i=0; i < flag.length; i++) {
          opt = !el[flag[i]] ? false : opt;
        }
      } else {
        opt = !el[flag] ? false : opt;
      }
      return opt;
    });
    newDirMapper.add(newList);
    return newDirMapper;
  } else if (typeof(fn) === "function") {

    if(flag instanceof Array) {
      for(i=0; i < self.files.length; i++) {
        temp = fn(self.files[i], i, self.files);
        if(!(temp instanceof Array) || temp.length !== flag.length) 
          throw new Error('fn needs to return an array with same number of elements in flag; |fn| = |flag|.');
        for(j=0; j < flag.length; j++) {
          self.files[i][flag[j]] = temp[j];
        }
      }
    } else {
      for(var i = 0; i < self.files.length; i++) {
        self.files[i][flag] = fn(self.files[i], i, self.files);
      }
    }
    return self;

  } else if(typeof(fn) === 'string' && typeof(flag) === 'string') { 
    newDirMapper = new DirMapper();
    newList = self.files.filter(function(el) {
      return el[flag] === fn;
    });
    newDirMapper.add(newList);
    return newDirMapper;
  } else if(flag instanceof Array && fn instanceof Array && flag.length === fn.length) {
    newDirMapper = new DirMapper();
    newList = self.files.filter(function(el) {
      opt = true;
      for(i=0; i<flag.length; i++) {
        opt = el[flag[i]] !== fn[i] ? false : opt;
      }
      return opt;
    });
    newDirMapper.add(newList);
    return newDirMapper;
  } else {
    throw new Error("fn is not a function");
  }
};


module.exports = DirMapper;