var http      = require("http");
var util      = require('util');
var client    = require('cheerio-httpcli');
var GitHubApi = require("github");
var path      = require('path');
var fs        = require('fs');
var ECT       = require('ect');
var renderer  = ECT({ root : __dirname + '/views' , ext : '.ect'});

var github = new GitHubApi({
	version: "3.0.0",
	debug: false
});

github.authenticate();

var options = {
	user : 'jjug-ccc',
	repo : 'call-for-paper-2016spring',
	state: 'all'
};

exports.createServer = function() {

	var server = http.createServer();

	server.on('request', function(req, res) {
		if(req.url == '/'){
			index(res);
		}else if(path.extname(req.url) == '.js'){
			static(req, res);
		}else if(path.extname(req.url) == '.css'){
			static(req, res);
		}else if(path.extname(req.url) == '.png'){
			static(req, res);
		}
	});

	return server; 
};

function index (res){

	var issues = [];

	github.issues.repoIssues(options, function(err, datas) {
		var done = 0;
		Array.prototype.forEach.call(datas, function(data, index, array) {
			var issue = {};
			issue.num   = data.number;
			issue.title = data.title;
			client.fetch(data.html_url, {}, function(err, $, fres) {
				var thumbup = $("button.btn-link.reaction-summary-item.tooltipped.tooltipped-se.tooltipped-multiline").text();
				thumbup = thumbup.replace(/(^\s+)|(\s+$)/g, "");
				var reg = /\d+/;
				var num = 0;
				if (reg.test(thumbup)) {
					num = reg.exec(thumbup);
				}
				issue.thumbup = num;
				issues.push(issue);
				done++;
				if (done === array.length) {
					var html = renderer.render('index', {issues: issues});
					res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
					res.end(html);
				}
			});
		});
	});
}

function static (req, res){
	var mimeTypes = {
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.png': 'image/png'
	};

	var filepath = './public' + path.dirname(req.url) + '/' + path.basename(req.url);

	fs.readFile(filepath, function(err, data){
		if(err){
			res.writeHead(500);
			return res.end('Error loading file');
		}
		res.writeHead(200, {
			'Content-Type': mimeTypes[path.extname(req.url)]
		});
		res.end(data);
	});
}
