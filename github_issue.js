const http      = require("http");
const util      = require('util');
const client    = require('cheerio-httpcli');
const GitHubApi = require("github");
const path      = require('path');
const fs        = require('fs');
const nunjucks  = require('nunjucks');

nunjucks.configure('views', { autoescape: true });

const github = new GitHubApi({
  version: "3.0.0",
  debug: false
});

github.authenticate({
  type: "basic",
  username: "your github username",
  password: "your github password"
});

const options = {
  user : 'jjug-ccc',
  repo : 'call-for-paper-2016fall',
  state: 'open',
  per_page: 100
};

exports.createServer = () => {

  let server = http.createServer();

  // routing
  server.on('request', (req, res) => {
    if (req.url == '/'){
      index(res);
    } else if (path.extname(req.url) == '.js'){
      static(req, res);
    } else if (path.extname(req.url) == '.css'){
      static(req, res);
    } else if (path.extname(req.url) == '.png'){
      static(req, res);
    } else {
      res404(req, res);
    }
  });

  return server;
};

let index = res => {

  let issues = [];

  github.issues.getForRepo(options, (err, datas) => {
    let done = 0;
    datas.forEach((data, index, array) => {
      let issue = {};
      issue.num   = data.number;
      issue.title = data.title;
      issue.user  = data.user.login;
      issue.html_url = data.html_url;
      client.fetch(data.html_url, {}, (err, $, fres) => {
        let thumbup = $("button.btn-link.reaction-summary-item.tooltipped.tooltipped-se.tooltipped-multiline").text();
        thumbup = thumbup.replace(/(^\s+)|(\s+$)/g, "");
        let reg = /\d+/;
        let num = 0;
        if (reg.test(thumbup)) {
          num = reg.exec(thumbup);
        }
        issue.thumbup = num;
        issues.push(issue);
        done++;
        if (done === array.length) {
          issues.sort((a, b) => {
            if ((a.thumbup * 1) < (b.thumbup * 1)) return 1;
            if ((a.thumbup * 1) > (b.thumbup * 1)) return -1;
            return 0;
          });
          let html = nunjucks.render('index.html', { issues: issues });
          res.writeHead(200, {'Content-Type': 'text/html; charset=UTF-8'});
          res.end(html);
        }
      });
    });
  });
};

// static files
let static = (req, res) => {
  let mimeTypes = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png'
  };

  let filepath = './public' + path.dirname(req.url) + '/' + path.basename(req.url);

  fs.readFile(filepath, (err, data) => {
    if (err){
      res.writeHead(500);
      return res.end(`Error loading file ${filepath}`);
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(req.url)]
    });
    res.end(data);
  });
};

let res404 = (req, res) => {
  res.writeHead(404);
  res.end('page not found.');
};
