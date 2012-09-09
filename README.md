# Asynchronous Directory Mapper

Asyncronously recursively maps out a directory structure. Contains tools for organizing and filtering files too.

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

#### DirMapper([dir ], [recurse], [cb])

- dir: string, directory to walk, if provided.
- recurse: boolean, to map all sub-directories or not. Defaults to true (Note: this parameter does not make a difference at this time, Directory Mapper will map all sub directories.)
- cb: a callback function to call once all directories have been walked, otherwise may listen for the end event. 
		
		var DirMapper = require('dir-mapper');
		new DirMapper('path/to/root', function(err, results) {
			// do stuff
		});

#### DirMapper.prototype.walk(dir, [recurse], [cb])

Same as the constructor method except dir is required. 

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

## Example 

Lets say we have a directory of posts that start with the date in the file name like so:

		posts/
			- 2012-01-10-bananaz
			- 2012-01-27-arizona
			- 2012-03-20-zebras
			- 2012-04-10-cats
			- 2012-05-20-apples

The following code will sort the files based on the filename:

		var DirMapper = require('dir-mapper'),
			root = new DirMapper();

		root.walk('path/to/posts', function(err, results) {
			if (err) throw err;
			results.flag('name', function(el) {
				var temp = el.files.split('-');
				return temp[temp.length - 1];
			});
			console.log(results.sort(1, 'name'));
			// Will print the files in order based on the 
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
- more tests, tests are not comprehensive
- comment code.  