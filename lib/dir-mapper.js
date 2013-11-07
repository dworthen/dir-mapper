var fs        = require('fs')
  , path      = require('path')
  , util      = require('util')
  , events    = require('events')
  , helpers   = require('./helpers')
  , dirsLeft  = 1
  , filesLeft = 0
  , recurse   = true
  , walking   = false
  , cb        = null;
//  , walked = false;

var DirMapper = function(dir, _recurse, callback) {
  if (!(this instanceof DirMapper)) 
    return new DirMapper(dir, _recurse, callback);
  
  dirsLeft = 1;

  this.files = [];
  
  if(dir) return this.walk(dir, _recurse, callback);
  return this;
  
};

util.inherits(DirMapper, events.EventEmitter);

DirMapper.prototype.walk = function(dir, _recurse, callback) {
  var self = this;
  
  if(!walking) {
    cb = callback;
    if(_recurse && typeof(_recurse) === 'function') {
      cb = _recurse;
    } else if (typeof(_recurse) !== 'undefined'){
      recurse = _recurse;
    }
    walking = true;
  }

  if(!dir) {
    walking = false;
    if (cb) return cb((new Error('DirMapper.walk expects a directory to walk.')), undefined);
      return self.emit('error', (new Error('DirMapper.walk expects a directory to walk.')));
  }
  
  fs.readdir(dir, function(err, files) {
  	if (err) {
      walking = false;
      if(cb) return cb(err);
        return self.emit('error', err); 
  	}
		dirsLeft--;
		if(!files) {
     walking = false;
 	  if (cb) return cb(undefined, self);
       return self.emit('end', self);
		}
    
		files.forEach(function(file) {
			file = path.join(dir, file);
			
			filesLeft++; 
			fs.lstat(file, function(err, stats) {
				if(err) {
          walking = false;
  			  if(cb) return cb(err);
            return self.emit('error', err);
				}
				if(!stats) {
          walking = false;
 			    if (cb) return cb(undefined, self);
            return self.emit('end', self);
				}
				if(stats.isDirectory()) {
					dirsLeft++;
  				self.walk(file);
				} 
        self.add(file);
				// self.files.push({file: file});
				filesLeft--;
        if(filesLeft === 0 && dirsLeft === 0) {
          walking = false;
          process.nextTick(function() {
						if (cb) return cb(undefined, self);
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

helpers.overload('string', function flag(_flag) {
  
});

DirMapper.prototype.flag = function(flag, fn) {
  var self = this
    , newDirMapper
    , newList
    , opt = true
    , options = {
      match: false,
      filter: false
    }
    , i, j, temp;

  if(!self.files) return;


  if(!fn || fn instanceof Array || typeof(fn) === 'string') {
    newDirMapper = new DirMapper();
    newList = self.files.filter(function(el) {
      if(fn instanceof Array) {
        if(!(flag instanceof Array) || flag.length !== fn.length) 
          throw new Error('Flag and fn need to be arrays of the same length');
        opt = true;
        for(i=0; i<flag.length; i++) {
          opt = el[flag[i]] !== fn[i] ? false : opt;
        }
        return opt;
      } else if (typeof(fn) === 'string') {
        if(typeof(flag) !== 'string') throw new Error('When fn is a string, flag should be a string');
        return el[flag] === fn;
      } else if(flag instanceof Array) {
        opt = true;
        for(i=0; i<flag.length; i++) {
          opt = !el[flag[i]] ? false : opt;
        }
        return opt;
      }
      return el[flag] ? true : false;
    });
    newDirMapper.add(newList);
    return newDirMapper;
  } else if(typeof(fn) === 'function') {
    self.files = self.files.map(function(el, i, arr) {
      temp = fn(el, i, arr);
      if(temp instanceof Array) {
        if(!(flag instanceof Array)) throw new Error('flag and fn need to be same data type.');
        for(i=0; i < flag.length; i++) {
          el[flag[i]] = temp[i];
        }
      } else if(!(temp instanceof Array) && typeof(flag) === 'string') {
        el[flag] = temp;
      }
      return el;
    });
    return self;
  }
};


module.exports = DirMapper;
