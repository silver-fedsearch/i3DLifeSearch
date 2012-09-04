/*
 * The MIT License
 * 
 * Copyright (c) 2012 MetaBroadcast
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial 
 * portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */
var rest = require('restler');
var util = require('util');
var SearchResults = require('../modules/SearchResults');
var SearchResult = require('../modules/SearchResult');

var i3DLife = function(q, config, fn) {
	this.q = q;
	this.config = config;
	this.fn = fn; // callback function
};

i3DLife.prototype.run = function() {
	//console.log("Doing search for: " + this.q);
	var url = "http://va.i3dlife.com/search/query.php?term=" + this.q;

	var o = this;
	
	var request = rest.get(url);
	
	var i3dlife_timeout = setTimeout(function () {
		request.abort("timeout");
	}, this.config.timeout);
	
	request.on('complete', function(data) {
		clearTimeout(i3dlife_timeout);
		var resultnum = 0;
		var data = JSON.parse(data); // Manually convert to JSON as server sends back wrong content type
		if (data.r) {
			for ( var i in data.r) {
				var content = data.r[i];
				var result = new SearchResult();
				result.addId("va", content.id);
				result.title = content.title;
				result.thumbnail_url = content.thumbnail ? content.thumbnail : "";
				result.source = "i3dlife";
				result.type = 'artistic';
				o.fn(result, false);
				resultnum++;
				if (resultnum > o.config.limit) {
					break;
				}
			}
		} else {
			util.error("i3dlife: Cannot understand response");
			util.error(data);
			util.error("=====");
		}
		o.fn("i3dlife", true);
	});
};

module.exports = i3DLife;