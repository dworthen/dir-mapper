var should = require('chai').should();

describe('dirMapper', function() {
  
  var DirMapper = require(__dirname + '/../lib/dir-mapper')
    , testDir = __dirname + '/fixtures/'
    , fileObjs;

  describe('walk(dir)', function() {
    it('Should return a list of all files in a dir recursively', function(done) {
      DirMapper.walk(testDir, function(err, files) {
        if (err) throw err;
        //console.log(files);
        files.should.have.length(12);
        done();
      });
    });
  });

  describe('createReadStream(dir, options)', function() {
    it('Should return a readstream, pushing individual file paths', function(done) {
      var dirMapper = DirMapper.createReadStream(testDir);
      var files = [];
      dirMapper.setEncoding('utf8');
      dirMapper.on('data', function(path) {
        //console.log(path);
        files.push(path);
      });
      dirMapper.on('end', function() {
        //console.log('end');
        files.should.have.length(12);
        done();
      });
    });
  });

  describe('promiseWalk', function() {
    it('should return a promise', function(done) {
      DirMapper.promiseWalk(testDir).then(function(files) {
        files.should.have.length(12);
        done();
      });
    });
  });
    
});
