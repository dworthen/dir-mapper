# Asynchronous Directory Mapper

Like the title implies, it asynchronously and recursively maps out directories. This library also contains tools for organizing and filtering files.

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
		
		[ {file: '/path/to/root/css'},
			{file: 'path/to/root/css/fonts.css'},
			{file: 'path/to/root/css/style.css'},
			{file: 'path/to/root/images'},
			{file: 'path/to/root/images/bg.png'}, 
			{file: 'path/to/root/images/me.jpg'},
			{file: 'path/to/root/index.html'},
			{file: 'path/to/root/scripts'},
			{file: 'path/to/root/scripts/jquery.js'},
			{file: 'path/to/root/readme.txt'}
		]

## Install
		
		npm install dir-mapper

## API

Directory Mapper supports both a callback based api and an event driven api.

### Callback
		
		var DirMapper = require('dir-mapper'),
				root = new DirMapper();

		root.walk('path/to/root', function(error, results) {
			if (error) throw error;
			// results.files is an array of objects, as demonstrated above
		});

### Event
		
		var root = new (require('dir-mapper'));

		root.on('error', function(err) {
			// we have an error
		});

		root.on('end', function(results) {
			// do stuff
		});

		root.walk('path/to/root');

### Methods

#### DirMapper([dir], [recurse], [cb])

- dir: string, directory to walk.
- recurse: boolean, to map all sub-directories or not. Defaults to true (Note: Currently this parameter has no effect.)
- cb: a callback function to call once all directories have been walked, otherwise may listen for the end event. 
		
		var DirMapper = require('dir-mapper');
		new DirMapper('path/to/root', function(err, results) {
			// do stuff
		});

#### DirMapper.prototype.walk(dir, [recurse], [cb]) 
		
		var DirMapper = require('dir-mapper'),
			root = new DirMapper();

		root.walk('path/to/root');

#### DirMapper.prototype.sort(order, [field])

Since Directory Mapper maps a directory structure asynchronously there is no garuanteed ordered. This method will organize the resulting list in ascending or descending order.

- order: number, 1 for ascending and -1 for descending.
- field: the field to order the array of objects by, defaults to 'file'.
		
		var DirMapper = require('dir-mapper'),
			root = new DirMapper();

		root.walk('path/to/root', function(err, results) {
			results.sort(1);
			// same as results.sort(1, 'file');
			// results.files will be in the same order as the example above. 
		});

#### DirMapper.prototype.flag(field, [fn])

This method, when provided both the field and fn arguments, acts just like the Array.prototype.map method. If only provided the field parameter then this method acts like Array.prototype.filter, returning an array of file objects where each object contains a 'true' value for the field.

- field: string, the field to filter by or add to each file object.
- fn: function to mark each file object with, receives three arguments fn(el, i, arr)
	- el: current array element.
	- i: the current key of the array.
	- arr: the files array itself.
		
		var DirMapper = require('dir-mapper'),
			root = new DirMapper();
		
		root.walk('path/to/root', function(err, results) {
			// find which files are in the images directory
			results.flag('images', function(el) {
				// true if its in the images directory
				// it is not necessary to return a boolean, may return a string
				return /\/images/.test(el.file); 
			}); 
			var images = results.flag('images');
			// sort the new images list in descending order
			images.sort(-1);
		});	

#### DirMapper.prototype.flag(field[], [fn])

Returns all files that satisfy all of the properties of field[]. If fn is present, then files will be marked with the several properties of field[].

		results.flag(['isImage','isJpeg'], function(el) {
      return [/\/images/.test(el.file), /.*\.jpeg$/.test(el.file)];
    });
    // later
    var flagResults = results.flag(['isImage', 'isJpeg']);

#### DirMapper.prototype.flag(field[], match)

		results.flag('script', function(el) {
      return /\/scripts/.test(el.file) ? 'yes' : 'no';
    });
    // later
    var flagResults = results.flag('script', 'yes');

    // or 

    results.flag(['script', 'size'], function(el) {
      var temp = /\/scripts/.test(el.file) ? 'yes' : 'no';
      var temp2 = /.*\.min\..*/.test(el.file) ? 'minified' : 'source'
      return [temp, temp2];
    });
    // later
    var flagResults = results.flag(['script', 'size'], ['yes', 'minified']);

## Example 

Lets say we have a directory of posts that start with the date in the file name like so:
		
		posts/
			- 2012-01-10-bananaz
			- 2012-01-27-arizona
			- 2012-03-20-zebras
			- 2012-04-10-cats
			- 2012-05-20-apples

The following code will sort the files based on the name at the end of the file:
		
		var DirMapper = require('dir-mapper'),
			root = new DirMapper();

		root.walk('path/to/posts', function(err, results) {
			if (err) throw err;
			results.flag('name', function(el) {
				var temp = el.files.split('-');
				return temp[temp.length - 1];
			});

			// Will result in
			// [
			// {file: '2012-01-10-bananaz', name: 'bananaz'}, 
			// ...
			// {file: '2012-05-20-apples', name: 'apples'}]

			console.log(results.sort(1, 'name'));
			// Will print the files in order based on the name, ie 'apples'
		});

## Testing

First run
		
		npm install --dev

Then
		
		npm test

## TODO:

- refractor
- Add the ability to either recurse or not
- Add synchronous version?
- Since there is an event driven api maybe convert to a stream??
- Add a data event for every file added to the list

## License

Copyright (c) 2012 Derek Worthen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.