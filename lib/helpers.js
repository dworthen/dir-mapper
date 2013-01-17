function overload() {
	var types = [[]]
		, _card = arguments.length
		, _methodName = arguments[_card - 1].name
		, _function
		, _router
		, _overLoads
		, _error = 'Wrong number of arguments or invalid argument types: ' + _methodName + '()';

	_router = function() {
		var length = arguments.length
			, overLoads = eval('_' + _methodName)
			,	curFunc = overLoads[length]
			, use 
			, match
			, i, j;

		if(length > 0 && curFunc) {
			for(i=0; i<curFunc.length; i++) {
				if(curFunc[i][0].length>0) {
					use = true;
					for(j=0; j<length; j++) {
						match = typeof(curFunc[i][0][j]) === 'function'
							? arguments[j] instanceof curFunc[i][0][j]
							: typeof(arguments[j]) === curFunc[i][0][j];
						use = !match ? false : use;
					}
					if (use) return curFunc[i][1].apply(this, arguments);
				}
			}
		}
		if(overLoads[0]) {
			return overLoads[0][0][1].apply(this, arguments);
		}
		throw _error;
	};

	_function = _methodName + ' = (typeof(_' + _methodName + ') !== "undefined") ? ' + _methodName + ' : ' + _router.toString() + ';';
	eval(_function);
	
	for(var i=0; i < _card - 1; i++) {
		types[0].push(arguments[i]);
	}
	types.push(arguments[_card - 1]);

	_overLoads = '_' + _methodName + '= (typeof(_' + _methodName + ') !== "undefined") ? _' + _methodName + ': {};'; 
	_overLoads += '_' + _methodName + '[(_card - 1)] = _' + _methodName + '[(_card -1)] || [];';
	_overLoads += '_' + _methodName + '[(_card - 1)].push(types);';

	eval(_overLoads);
}

module.exports.overload = overload;