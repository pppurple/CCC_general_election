var githubIssue = require('./github_issue');

var IP   = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;

githubIssue.createServer().listen(PORT, IP);
