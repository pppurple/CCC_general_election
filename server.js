const githubIssue = require('./github_issue');

const IP   = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
const PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;

githubIssue.createServer().listen(PORT, IP);
