/*
---
name: Locale.API
description: Provide a localized MooTools API so you can code in your native language
requires: [More/Locale]
provides: Locale.API
...
*/

(function(){

var translateMethods = function(func, method, translate) {
	var methods = {};
	methods[method] = function(){
		var args = Array.map(arguments, function(value, i){
			if(typeOf(value) == 'object') {
				var obj = {};
				Object.each(value, function(v, key) {
					obj[(translate.arguments[i] && Object.keyOf(translate.arguments[i], key)) || key] = v;
				});
				return obj;
			}
			return (translate.arguments[i] && Object.keyOf(translate.arguments[i], value)) || value;
		});
		return func.apply(this, args);
	}.extend({$origin: func});
	if (translate.method) methods[translate.method] = methods[method];
	return methods;
}

var translateArguments = function(type, method, translate){
	var origin, methods;
	origin = type.prototype[method]
	if (origin.$origin) origin = origin.$origin;

	methods = translateMethods(origin, method, translate);
	
	type.implement(methods);
};

var translateStatic = function(type, translate){
	for (var old in translate) {
		if(typeOf(translate[old]) == 'object') {
			var methods = translateMethods(type[old], old, translate[old]);
			Object.each(methods, function(v, k) {
				type[k] = v;
			});
		}
		else type[translate[old]] = type[old];
	}
};

var alias = function(name, existing){
	this.prototype[name] = this.prototype[existing];
}.overloadSetter();

Locale.API = function(){

	var set = Locale.get('API');

	Object.each(set, function(methods, _type){

		if (_type == 'initialize' && typeOf(methods) == 'function'){
			methods();
			return;
		}

		var aliasses = {}, type = this[_type];

		Object.each(methods, function(translate, method){

			if (method == 'static') translateStatic(type, translate);
			else if (typeOf(translate) == 'object') translateArguments(type, method, translate);
			else aliasses[translate] = method;

		});

		(type.alias || alias).call(type, aliasses);

	});

};

Locale.addEvent('change', Locale.API.bind(Locale));

})();
