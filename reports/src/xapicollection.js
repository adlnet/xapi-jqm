/***********************************************************************
 * collection.js: Run queries on Experience API data
 *
 * Initialize the ADL.Collection class with a list of xAPI statements,
 * then run SQL-style queries over the data, e.g. where, select, count.
 *
 * Comes in two versions: CollectionSync and CollectionAsync.
 ***********************************************************************/
"use strict";

// guarantee window.ADL, even in a worker
try {
	window.ADL = window.ADL || {};
}
catch(e){
	var window = {'ADL': {}};
}

// figure out script path if available
try {
	var workerScript = document.querySelector('script[src*="xapicollection"]').src;
}
catch(e){}

// poly-fill array checking
if(!Array.isArray){
	Array.isArray = function(obj){
		return obj.length >= 0 && !obj['length'];
	}
}

/*
 * Client scope
 */

(function(ADL){

	/*
	 * Retrieves some deep value at path from an object
	 */
	function getVal(path,obj)
	{
		// if nothing to search, return null
		if(obj === undefined){
			return null;
		}

		// if no descent, just return object
		else if(path.length === 0){
			return obj;
		}

		else {
			//var parts = /^([^\.]+)(?:\.(.+))?$/.exec(path);
			var parts;
			if(Array.isArray(path)){
				parts = path;
			}
			else {
				parts = path.split('.');
				var i=0;
				while(i<parts.length){
					if(parts[i].charAt(parts[i].length-1) === '\\')
						parts.splice(i, 2, parts[i].slice(0,-1)+'.'+parts[i+1]);
					else
						i++;
				}
			}

			var scoped = parts[0], rest = parts.slice(1);
			return getVal(rest, obj[scoped]);
		}
	}


	/*************************************************************
	 * CollectionSync - the core processor of statements
	 *
	 * This is where the magic happens. CollectionSync is initialized
	 * with an array of statements, processes those statements
	 * based on the method called, and returns a new CollectionSync
	 * object containing the results of the query.
	 *************************************************************/

	function CollectionSync(data){
		if(Array.isArray(data)){
			this.contents = data.slice();
		}
		else if(data instanceof CollectionSync){
			this.contents = data.contents.slice();
			this.parent = data;
		}
		else {
			this.contents = [];
		}
	}

	CollectionSync.prototype.exec = function(cb){
		cb(this.contents);
		return this.parent;
	}

	CollectionSync.prototype.save = function(){
		return new CollectionSync(this);
	}

	CollectionSync.prototype.append = function(data){
		this.contents.push.apply(this.contents, data);
		return this;
	}


	/*
	 * Filter out data entries not matching the query expression
	 */
	CollectionSync.prototype.where = function(query)
	{
		/*
		 * Query format example
		 *   stmts.where('verb.id = passed or verb.id = failed and result.score.raw >= 50');
		 * 
		 * Query grammar:
		 *   value := parseInt | parseFloat | "(.*)" | /(.*)/i?
		 *   xpath := [A-Za-z0-9_]+(\.[A-za-z0-9_]+)*
		 *   cond := <xpath> (=|!=|>|<|>=|<=) <value>
		 *   andGrp := <expr> 'and' <expr> | <cond>
		 *   orGrp := <expr> 'or' <expr> | <andGrp>
		 *   expr := '(' <expr> ')' | <orGrp>
		 */

		var PARSE_ERROR = NaN;

		function parseWhere(str)
		{
			// expr := '(' <expr> ')' | <orGrp>
			function expr(str)
			{
				// check for parens
				var match = /^\s*\((.*)\)\s*$/.exec(str);
				if(match){
					return expr(match[1]);
				}
				else {
					return orGrp(str);
				}
			}
		
			// check if a string has the same number of left and right parens
			function matchedParens(str){
				var level = 0;
				for(var i=0; i<str.length; i++){
					if(str[i] === '('){
						level++;
					}
					else if(str[i] === ')'){
						level--;
					}
				}
				return level === 0;
			}
		
			// orGrp := <expr> 'or' <expr> | <andGrp>
			function orGrp(str)
			{
				// loop over each possible combo of or arguments
				var parts = str.split(/\bor\b/);
				var expr1 = '', expr2 = '';
				for(var i=1; i<parts.length; i++)
				{
					var tempexpr1 = parts.slice(0,i).join('or');
					var tempexpr2 = parts.slice(i).join('or');
		
					// if both args have matched parens, continue
					if( tempexpr1 != '' && matchedParens(tempexpr1)
						&& tempexpr2 != '' && matchedParens(tempexpr2)
					){
						expr1 = tempexpr1;
						expr2 = tempexpr2;
						break;
					}
				}
		
				// parse the two operands
				if( expr1 && expr2 )
				{
					var part1 = expr(expr1);
					var part2 = expr(expr2);
		
					if( part1 && part2 )
						return {or: [part1, part2]};
					else
						return PARSE_ERROR;
				}
				// or was not found, so try ands
				else {
					var ret = andGrp(str);
					if(ret) return ret;
					else return PARSE_ERROR;
				}
			}
		
			// andGrp := <expr> 'and' <expr> | <cond>
			function andGrp(str)
			{
				// loop over each possible combo of and arguments
				var parts = str.split(/\band\b/);
				var expr1 = '', expr2 = '';
				for(var i=1; i<parts.length; i++)
				{
					var tempexpr1 = parts.slice(0,i).join('and');
					var tempexpr2 = parts.slice(i).join('and');
		
					// if both args have matched parens, continue
					if( tempexpr1 != '' && matchedParens(tempexpr1)
						&& tempexpr2 != '' && matchedParens(tempexpr2)
					){
						expr1 = tempexpr1;
						expr2 = tempexpr2;
						break;
					}
				}
		
				// parse operands
				if( expr1 && expr2 )
				{
					var part1 = expr(expr1);
					var part2 = expr(expr2);
		
					if( part1 && part2 )
						return {and: [part1, part2]};
					else
						return PARSE_ERROR;
				}
				// no and found, try cond
				else {
					var ret = cond(str);
					if(ret) return ret;
					else return PARSE_ERROR;
				}
			}
		
			// cond := <xpath> (=|!=|>|<|>=|<=) <value>
			function cond(str)
			{
				// check for an operator
				var match = /^\s*(.*?)\s*(!=|>=|<=|=|>|<)\s*(.*)\s*$/.exec(str);
				if(match)
				{
					// parse operands
					var part1 = xpath(match[1]);
					var part2 = value(match[3]);
					if( part1 )
					{
						if( part2 instanceof RegExp ){
							if( match[2] === '=' )
								return {op:'re',xpath:part1,value:part2};
							else if( match[2] === '!=' )
								return {op:'nre',xpath:part1,value:part2};
							else {
								console.error('Regex comparison only supports = and !=');
								return PARSE_ERROR;
							}
		
						}
						else {
							// parse operator
							switch(match[2]){
								case  '=':  return {op: 'eq',xpath:part1,value:part2};
								case '!=':  return {op:'neq',xpath:part1,value:part2};
								case  '<':  return {op: 'lt',xpath:part1,value:part2};
								case '<=':  return {op:'leq',xpath:part1,value:part2};
								case  '>':  return {op: 'gt',xpath:part1,value:part2};
								case '>=':  return {op:'geq',xpath:part1,value:part2};
								default: return PARSE_ERROR;
							}
						}
					}
					// fail if operator or operand doesn't parse
					else return PARSE_ERROR;
				}
				else return PARSE_ERROR;
			}
		
			// xpath := [A-Za-z0-9_]+(\.[A-za-z0-9_]+)*
			function xpath(str){
				var match = /^\s*([^\.]+(?:\.[^\.]+)*)\s*$/.exec(str);
				if(match)
					return match[1];
				else return PARSE_ERROR;
			}
		
			// value := parseInt | parseFloat | "(.*)"
			function value(str){
				var val = null;
				var cacheTrim = str.trim();
				if(val = parseInt(str,10)){
					return val;
				}
				else if(val = parseFloat(str)){
					return val;
				}
				else if(val = /^\s*"(.*)"\s*$/.exec(str)){
					return val[1];
				}
				else if(val = /^\s*\/(.*)\/(i?)\s*$/.exec(str)){
					return new RegExp(val[1], val[2]);
				}
				else if(cacheTrim === 'null'){
					return null;
				}
				else if(cacheTrim === 'true' || cacheTrim === 'false'){
					return cacheTrim === 'true';
				}
				else return PARSE_ERROR;
			}
		
			var ret = expr(str);
			return ret != PARSE_ERROR ? ret : null;
		}
		
		/*
		 * Evaluate the parse tree generated by parseWhere
		 */

		function evalConditions(parse, stmt)
		{
			// check for missing logical operands
			if(Array.isArray(parse.and) && parse.and.length === 0){
				return true;
			}
			else if(Array.isArray(parse.or) && parse.or.length === 0){
				return false;
			}
		
			// check for conditions, and if so evaluate
			else if(parse.op){
				switch(parse.op){
					case 'eq': return getVal(parse.xpath,stmt) === parse.value;
					case 'neq': return getVal(parse.xpath,stmt) !== parse.value;
					case 'geq': return getVal(parse.xpath,stmt) >= parse.value;
					case 'leq': return getVal(parse.xpath,stmt) <= parse.value;
					case 'lt': return getVal(parse.xpath,stmt) < parse.value;
					case 'gt': return getVal(parse.xpath,stmt) > parse.value;
					case 're': return parse.value.test( getVal(parse.xpath,stmt) );
					case 'nre': return !parse.value.test( getVal(parse.xpath,stmt) );
					default: return false;
				}
			}
			// check for and, and if so evaluate
			else if(parse.and){
				// evaluate first operand
				if( !evalConditions(parse.and[0], stmt) )
					return false;
				// evaluate remaining operands
				else
					return evalConditions({and: parse.and.slice(1)}, stmt);
			}
			// check for or, and if so evaluate
			else if(parse.or){
				// evaluate first operand
				if( evalConditions(parse.or[0], stmt) )
					return true;
				// evaluate remaining operands
				else
					return evalConditions({or: parse.or.slice(1)}, stmt);
			}
			// fail for any other structures. shouldn't happen
			else {
				return false;
			}
		}

		/*
		 * Execute the giant functions above
		 */

		// no-op if no query
		if( !query ) return;
	
		// parse the query, abort filter if query didn't parse
		var parse = parseWhere(query);
		if( !parse ){
			console.error('Invalid where expression: '+query);
			return;
		}
	
		// for each entry in the dataset
		for(var i=0; i<this.contents.length; i++)
		{
			// remove from dataset if it doesn't match the conditions
			if( !evalConditions(parse, this.contents[i]) ){
				this.contents.splice(i--,1);
			}
		}
	
		// return the filtered data
		return this;
	}
	
	/*
	 * Pick out certain fields from each entry in the dataset
	 * syntax of selector := xpath ['as' alias] [',' xpath ['as' alias]]*
	 */
	CollectionSync.prototype.select = function(selector, level)
	{
		// check for recursive depth
		if(level && level > 0)
		{
			var data = this.contents;
			for(var i=0; i<data.length; i++){
				var subdata = new CollectionSync(data[i].data);
				subdata.select(selector, level-1);
				data[i].data = subdata.contents;
			}
		}
		else
		{
			// parse selector
	
			// for each field to be selected
			var cols = [];
			var xpaths = selector.split(',');
			for( var i=0; i<xpaths.length; i++ )
			{
				// break into an xpath and an optional alias
				var parts = xpaths[i].split(' as ');
				cols.push({
					'xpath': parts[0].trim(),
					'alias': parts[1] ? parts[1].trim() : null
				});
			}
	
			// pick out selected fields
	
			// loop over entries in dataset
			var data = this.contents;
			var ret = [];
			for(var i=0; i<data.length; i++)
			{
				var row = {};
				// for each selection field
				for(var j=0; j<cols.length; j++){
					// save as old name, or alias if provided
					if(cols[j].alias)
						row[cols[j].alias] = getVal(cols[j].xpath, data[i]);
					else
						row[cols[j].xpath] = getVal(cols[j].xpath, data[i]);
				}
				ret.push(row);
			}
	
			// return the selection
			this.contents = ret;
		}

		return this;
	}

	/*
	 * Perform a series of disjoint queries, and merge results
	 */
	CollectionSync.prototype.join = function(keypath, valuepath, level)
	{
		var data = this.contents;

		// check for recursion
		if( level && level > 0 )
		{
			// loop over datasets
			for(var i=0; i<data.length; i++){
				var subdata = new CollectionSync(data[i].data);
				subdata.join(keypath, valuepath, level-1);
				data[i].data = subdata.contents;
			}
		}
		else
		{
			// loop over datasets
			for(var i=0; i<data.length; i++)
			{
				for(var j=0; j<data[i].data.length; j++){
					var key = getVal(keypath, data[i].data[j]);
					var val = getVal(valuepath, data[i].data[j]);
					data[i][key] = val;
				}
			}
		}

		return this;
	}

	/*
	 * Exactly what it sounds like
	 * Return some continuous subset of the data
	 */
	CollectionSync.prototype.slice = function(start,end)
	{
		if(end === null)
			end = undefined;
		this.contents = this.contents.slice(start,end);
		return this;
	}
	
	/*
	 * Sort dataset by given path
	 */
	CollectionSync.prototype.orderBy = function(path, direction)
	{
		var data = this.contents;

		// figure out ascending or descending
		if(direction === 'descending' || direction === 'desc')
			direction = -1;
		else
			direction = 1;

		data.sort(function(a,b){
			var aVal = getVal(path,a), bVal = getVal(path,b);

			// any value is greater than null
			if(aVal!=null && bVal==null)
				return 1 * direction;
			else if(aVal==null && bVal!=null)
				return -1 * direction;

			// check equivalence
			else if(aVal == bVal)
				return 0;

			// all else fails, do a simple comparison
			else
				return (aVal<bVal ? -1 : 1) * direction;
		});

		return this;
	}

	/*
	 * Group with continuous values
	 */
	CollectionSync.prototype._groupByRange = function(path, range)
	{
		// validate range
		if( !(Array.isArray(range) && range.length === 3 && range[2]%1 === 0) )
			return this.groupBy(path);

		/*
		 * Generate range dividers
		 */

		// determine type of values
		var start = range[0], end = range[1], increment = range[2];
		var value, next;
		// values are date strings
		if( typeof(start) === 'string' && typeof(end) === 'string' && Date.parse(start) && Date.parse(end) ){
			value = function(x){
				return Date.parse(x);
			};
			next = function(x,i){
				var d = new Date(Date.parse(x)+i);
				return d.toISOString();
			};
		}
		// values are generic strings
		else if( typeof(start) === 'string' && typeof(end) === 'string' ){
			value = function(x){
				return x.charAt(0).toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0);
			};
			next = function(x,i){
				return String.fromCharCode(x.charAt(0).toLowerCase().charCodeAt(0) + i);
			};
		}
		// all other types
		else {
			value = function(x){
				return x;
			};
			next = function(x,i){
				return x+i;
			};
		}

		// make sure bounds are reachable
		var bounds = [];
		if( (value(end)-value(start))*increment <= 0 ){
			console.error('Group range is open, cannot generate groups!');
			console.log(JSON.stringify(range));
			bounds = [start,end];
		}
		// flip bounds if end < start
		else if( value(start) > value(end) ){
			groupByRange(path, [end,start,-increment]);
			dataStack.push( dataStack.pop().reverse() );
			return;
		}
		else {
			// create boundary array
			for(var i=start; value(i)<value(end); i=next(i,increment)){
				bounds.push(i);
			}
			bounds.push(end);
		}

		/*
		 * Group by range
		 */

		// create groups by boundary
		var ret = [];
		for(var i=0; i<bounds.length-1; i++){
			ret.push({
				'group': bounds[i]+'-'+bounds[i+1],
				'groupStart': bounds[i],
				'groupEnd': bounds[i+1],
				'data': []
			});
		}

		// divide up data by group
		var data = this.contents;
		for(var i=0; i<data.length; i++)
		{
			var groupVal = value(getVal(path,data[i]));
			for(var j=0; j<ret.length; j++){
				if( value(ret[j].groupStart) <= groupVal && (
					groupVal < value(ret[j].groupEnd) || j==ret.length-1 && groupVal==value(ret[j].groupEnd)
				) )
					ret[j].data.push(data[i]);
			}
		}

		this.contents = ret;
		return this;
	}


	/*
	 * Group with discrete values
	 */
	CollectionSync.prototype.groupBy = function(path, range)
	{
		if(range)
			return this._groupByRange(path, range);

		var data = this.contents;

		// if data is already grouped, group the groups
		if( data[0] && data[0].group && data[0].data )
		{
			for(var i=0; i<data.length; i++)
			{
				var subgroup = new CollectionSync(data[i].data);
				subgroup.groupBy(path);
				data[i].data = subgroup.contents;
			}
		}
		else
		{
			// add each data entry to its respective group
			var groups = {};
			for(var i=0; i<data.length; i++)
			{
				var groupVal = getVal(path,data[i]);
	
				// if group field isn't found, 
				if( !groupVal ){
					continue;
				}
				// no group for found value, create one
				else if( !groups[groupVal] ){
					groups[groupVal] = [data[i]];
				}
				// add to existing group
				else {
					groups[groupVal].push(data[i]);
				}
			}
	
			// flatten groups
			var ret = [];
			for(var i in groups){
				ret.push({
					'group': i,
					'data': groups[i]
				});
			}
	
			this.contents = ret;
		}

		return this;
	}


	/*
	 * Take grouped data and return number of entries in each group
	 */
	CollectionSync.prototype.count = function()
	{
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}

		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add count and sample
			group.count = group.data.length;
			group.sample = group.data[0];
			ret.push(group);
		}
		
		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return total of values of entries in each group
	 */
	CollectionSync.prototype.sum = function(path)
	{
		if( !path )
			return this;

		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}

		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var sum = 0;
			for(var j=0; j<data[i].data.length; j++){
				sum += getVal(path, data[i].data[j]);
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add sum and sample
			group.sum = sum;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return average of values of entries in each group
	 */
	CollectionSync.prototype.average = function(path)
	{
		if( !path )
			return this;

		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}

		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var sum = 0;
			for(var j=0; j<data[i].data.length; j++){
				sum += getVal(path, data[i].data[j]);
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add average and sample
			group.average = group.data.length>0 ? sum/group.data.length : 0;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return minimum of values of entries in each group
	 */
	CollectionSync.prototype.min = function(path)
	{
		if( !path ) return this;
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		var ret = [];
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}

		// loop over each group
		for(var i=0; i<data.length; i++)
		{
			var min = Infinity;
			for(var j=0; j<data[i].data.length; j++){
				min = Math.min(min, getVal(path, data[i].data[j]));
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add min and sample
			group.min = min === Infinity ? 0 : min;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}

	/*
	 * Take grouped data and return maximum of values of entries in each group
	 */
	CollectionSync.prototype.max = function(path)
	{
		if( !path ) return this;
		var data = this.contents;

		// if the data isn't grouped, treat as one large group
		if(!data[0] || !data[0].group || !data[0].data){
			data = [{
				'group': 'all',
				'data': data
			}];
		}

		// loop over each group
		var ret = [];
		for(var i=0; i<data.length; i++)
		{
			var max = -Infinity;
			for(var j=0; j<data[i].data.length; j++){
				max = Math.max(max, getVal(path, data[i].data[j]));
			}

			// copy group id fields to new object
			var group = {};
			for(var j in data[i]){
				group[j] = data[i][j];
			}
			// add max and sample
			group.max = max === -Infinity ? 0 : max;
			group.sample = group.data[0];
			ret.push(group);
		}

		this.contents = ret;
		return this;
	}


	/*****************************************************************
	 * Collection class - asynchronous version of CollectionSync
	 *
	 * For any decently-sized dataset, CollectionSync will lock up the
	 * UI for an unnecessary amount of time. The CollectionAsync class
	 * exposes the same API, but wraps that functionality in a thread
	 * so the UI remains responsive.
	 *****************************************************************/


	function CollectionAsync(data)
	{
		this._callbacks = {};

		if( !window.Worker ){
			throw new Error('Your browser does not support WebWorkers, and cannot use the CollectionAsync class. Use CollectionSync instead.');
		}

		this._worker = new Worker(workerScript);
		this._worker.onmessage = function(evt)
		{
			var data = CollectionAsync.deserialize(evt.data);
			if( this._callbacks[data[0]] ){
				this._callbacks[data[0]](data[1]);
				delete this._callbacks[data[0]];
			}
		}.bind(this);

		var payload = CollectionAsync.serialize(['push',data]);
		try {
			this._worker.postMessage(payload, [payload]);
		}
		catch(e){
			this._worker.postMessage(payload);
		}

		if( payload.byteLength > 0 ){
			console.log('Warning: Your browser does not support WebWorker transfers. Performance of this site may suffer as a result.');
		}
	}

	CollectionAsync.serialize = function(obj)
	{
		var json = JSON.stringify(obj);
		var buf = new ArrayBuffer(2*json.length);
		var view = new Uint16Array(buf);
		for(var offset=0; offset<json.length; offset++){
			view[offset] = json.charCodeAt(offset);
		}
		return buf;
	};

	CollectionAsync.deserialize = function(buffer)
	{
		var json = '';
		var intBuffer = new Uint16Array(buffer);
		for(var i=0; i<intBuffer.length; i+=1000)
			json += String.fromCharCode.apply(null, intBuffer.subarray(i,i+1000));
		return JSON.parse(json);
	}

	CollectionAsync.prototype.exec = function(cb)
	{
		// generate random callback id, check for duplicates
		var id;
		while( this._callbacks[id = Math.floor( Math.random() * 65536 )] );

		this._callbacks[id] = cb;
		this._worker.postMessage(CollectionAsync.serialize(['exec', id]));
		return this;
	}

	CollectionAsync.prototype.append = function(data)
	{
		var payload = CollectionAsync.serialize(['append',data]);
		try {
			this._worker.postMessage(payload, [payload]);
		}
		catch(e){
			this._worker.postMessage(payload);
		}

		return this;
	}

	function proxyFactory(name){
		return function(){
			var args = Array.prototype.slice.call(arguments);
			this._worker.postMessage(CollectionAsync.serialize([name].concat(args)));
			return this;
		}
	}

	CollectionAsync.prototype.save    = proxyFactory('save');
	CollectionAsync.prototype.where   = proxyFactory('where');
	CollectionAsync.prototype.select  = proxyFactory('select');
	CollectionAsync.prototype.join    = proxyFactory('join');
	CollectionAsync.prototype.slice   = proxyFactory('slice');
	CollectionAsync.prototype.orderBy = proxyFactory('orderBy');
	CollectionAsync.prototype.groupBy = proxyFactory('groupBy');
	CollectionAsync.prototype.count   = proxyFactory('count');
	CollectionAsync.prototype.sum     = proxyFactory('sum');
	CollectionAsync.prototype.average = proxyFactory('average');
	CollectionAsync.prototype.min     = proxyFactory('min');
	CollectionAsync.prototype.max     = proxyFactory('max');

	ADL.CollectionSync = CollectionSync;
	ADL.CollectionAsync = CollectionAsync;
	ADL.Collection = window.Worker ? CollectionAsync : CollectionSync;

}(window.ADL));


/*
 * Thread-specific scope
 */
(function(CollectionAsync, CollectionSync){

	var db = null;

	try {
		onmessage = function(evt)
		{
			var data = CollectionAsync.deserialize(evt.data);

			if( data[0] === 'exec' )
			{
				var cbHandle = data[1];
				if(db){
					db = db.exec(function(data){
						var payload = CollectionAsync.serialize([cbHandle, data]);
						try {
							postMessage(payload, [payload]);
						}
						catch(e){
							postMessage(payload);
						}
					});
				}
				else {
					postMessage(CollectionAsync.serialize([cbHandle, 'error','nodata']));
				}
			}
			else if( data[0] === 'push' ){
				var newdb = new CollectionSync(data[1], db);
				db = newdb;
			}
			else {
				// execute the function at [0] with [1-n] as args
				db = db[data[0]].apply(db, data.slice(1));
			}
		};
	}
	catch(e){
		if( e.message !== 'onmessage is not defined' ){
			throw e;
		}
	}

}(window.ADL.CollectionAsync, window.ADL.CollectionSync));

