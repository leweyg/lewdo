// lewdo for node.js:

console.log("lewdo");

var fs = require('fs');

eval( fs.readFileSync('lewdo/system/string3.js', 'utf8') );
eval( fs.readFileSync('lewdo/system/app.js', 'utf8') );

var app = string3("Hello\v\nWorld.");
console.log(app.toString());

console.log("Done.");