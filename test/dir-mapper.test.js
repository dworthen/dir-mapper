var should = require('should');

describe('dir-mapper', function() {
  
  var DirMapper = require(__dirname + '/../lib/dir-mapper')
    , testDir = __dirname + '/fixtures/'
    , fileObjs;
    
  beforeEach(function() {
    fileObjs = new DirMapper();
  });

  describe('Constructor1: DirMapper()', function() {
    it('Should set some configs', function() {
      fileObjs.should.have.property('files');
//      fileObjs.should.have.property('filesLeft', 0);
//      fileObjs.should.have.property('dirsLeft', 1);
//      fileObjs.should.have.property('recurse', true);
    });  
  });
  
  describe('Walk:', function() {
    
    describe('Walk() - no arguments:', function() {
      it('should throw an error, DirMapper.walk expects a directory to walk.', function(done) {
        var test = function(err) {
          err.should.be.an.instanceOf(Error);
          err.message.should.be.eql('DirMapper.walk expects a directory to walk.');
        };
        
        // event method
        fileObjs.on('error', function(err) {
          test(err);
          done();
        });

        // callback method that calls the event based method.
        fileObjs.walk(undefined, function(err, results) {
          test(err);
          fileObjs.walk();
        });         
          
      });
    });
    
    describe('Walk(nonExistentDir):', function() {
      it('should throw an error, ENOENT, readdir nonExistentDir', function(done) {
        var test = function(err) {
          err.should.be.an.instanceOf(Error);
          err.message.should.be.eql("ENOENT, readdir '/sfg/fdasfd/fdasfd/'");
        };
        
        // Event method
        fileObjs.on('error', function(err) {
          test(err);
          done();
        });
        
        // callback method, also envokes the event method.
        fileObjs.walk('/sfg/fdasfd/fdasfd/', function(err, results) {
          test(err);
          fileObjs.walk('/sfg/fdasfd/fdasfd/');
        });
        
      });
    });
    
    describe('walk(dir, cb):', function() {
      it('should create an object that contains an array of file objects, calls cb when complete', function(done) {
        
        var test = function(results) {
          results.should.have.property('files');
          results.files.should.have.length(11);
        }
        
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          test(results);
          done();
        });
        
      });
    });

    describe('walk(dir):', function() {
      it('should create an object containing an array of file objects, emits event when complete', function(done) {
        
        var test = function(results) {
          results.should.have.property('files');
          results.files.should.have.length(11);
        }

        fileObjs.on('error', function(err) {
          throw err;
          done();
        });
        
        fileObjs.on('end', function(results) {
          // should.not.exist(err);
          // console.log(results);
          test(results);
          done();
        });

        fileObjs.walk(testDir);

      });
    });

  });

  describe('sort:', function() {

    describe('sort(order), 1 for asc, -1 for desc', function() {
      it('should organize the files by their names according to the order.', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.sort(1);
          /\/images/.test(results.files[0].file).should.be.true;
          results.sort(-1);
          /\/style2.css/.test(results.files[0].file).should.be.true;
          done();
        });
      });
    });

    describe('sort(order, field), field: property to order by', function() {
      it('should organize the files array according to the field key.', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.sort(1, 'file');
          /\/images/.test(results.files[0].file).should.be.true;
          results.sort(-1);
          done();
        });
      })
    });

  });

  describe('flag: ', function() {

    describe('flag(flagname)', function() {
      it('should return all files that return a \'true\' value for the flagname property', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          var newResults = results.flag('file');
          newResults.sort(1);
          /\/images/.test(newResults.files[0].file).should.be.true;
          done();
        });
      });
    });

    describe('flag(flag, fn(el, in, arr))', function() {
      it('should mark files according to the fn function', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.flag('cool', function(el) {
            return /\/scripts/.test(el.file);
          });
          var newResults = results.flag('cool');
          newResults.sort(1);
          /\/scripts/.test(newResults.files[0].file).should.be.true;
          done();
        });
      });
    });

    describe('flag(flag[])', function() {
      it('should check a file for several properties', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.flag('cool', function(el) {
            return /\/scripts/.test(el.file);
          });
          var flagResults = results.flag(['file', 'cool']);
          flagResults.sort(1);
          /\/scripts/.test(flagResults.files[0].file).should.be.true;
          done();
        })
      });
    });

    describe('flag(flag[], fn(el, in, arr))', function() {
      it('should mark a file with several properties at once', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.flag(['cool','nice'], function(el) {
            return [/\/scripts/.test(el.file), 'okay'];
          });
          var flagResults = results.flag(['cool', 'nice']);
          flagResults.sort(1);
          /\/scripts/.test(flagResults.files[0].file).should.be.true;
          done();
        })
      });
    });

    describe('flag(flag, match)', function() {
      it('should check a file for a flag with a property of match', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.flag('script', function(el) {
            var temp = /\/scripts/.test(el.file) ? 'yes' : 'no';
            return temp;
          });
          var flagResults = results.flag('script', 'yes');
          flagResults.sort(1);
          /\/scripts/.test(flagResults.files[0].file).should.be.true;
          done();
        })
      });
    });

    describe('flag([flag], [match])', function() {
      it('should check a file for a several properties', function(done) {
        fileObjs.walk(testDir, function(err, results) {
          should.not.exist(err);
          results.flag(['script','nice'], function(el) {
            var temp = /\/scripts/.test(el.file) ? 'yes' : 'no';
            return [temp, 'cool'];
          });
          var flagResults = results.flag(['script', 'nice'],['yes','cool']);
          flagResults.sort(1);
          /\/scripts/.test(flagResults.files[0].file).should.be.true;
          done();
        })
      });
    });

  });

  
});