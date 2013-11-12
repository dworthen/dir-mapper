# Directory Mapper

Asynchronous directory mapping that supports callback, stream and promise based APIs. Directory mapper will map out all files within a directory and sub-directories.

## Example

This
		
		root/
			css/
				fonts.css
				style.css
			images/
				bg.png
				me.jpg
			scripts/
				jquery.js
			index.html
			readme.txt

Will become 
		
		[ '/path/to/root/css',
			'path/to/root/css/fonts.css',
			'path/to/root/css/style.css',
			'path/to/root/images',
			'path/to/root/images/bg.png', 
			'path/to/root/images/me.jpg',
			'path/to/root/index.html',
			'path/to/root/scripts',
			'path/to/root/scripts/jquery.js',
			'path/to/root/readme.txt'
		]

## Install
		
		npm install dir-mapper

## Callback Based API

		var dirMapper = require('dir-mapper');

		dirMapper.walk('path/to/root', function(error, files) {
			if (error) throw error;
      console.log(files);
		});

## Stream Based API
	  	
    var dirMapper = require('dir-mapper').createReadStream('directory');
    var files = [];
    dirMapper.setEncoding('utf8');
    dirMapper.on('data', function(path) {
      files.push(path);
    });
    dirMapper.on('error', function(err) {
      throw err;
    });
    dirMapper.on('end', function() {
      console.log(files);
    });

## Promise Based API

    dirMapper = require('dir-mapper');
    dirMapper.promiseWalk('directory')
    .then(function(files) {
      console.log(files);
    });

## Testing

First run
		
		npm install --dev

Then
		
		npm test

## Changelog

- v1.0.0 has simplified the library. Utility functions for sorting and filtering files are no longer provided. The library no longer returns an array of obscure objects, instead an array of absolute paths are returned.

## License

Copyright (c) 2012 Derek Worthen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
