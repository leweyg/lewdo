
// using hacky eval(file) approach to allow non-module code:
var fs = require('fs');
eval( fs.readFileSync('./lewdo/system/string3.js', 'utf8') );
eval( fs.readFileSync('./lewdo/system/lewdo.js', 'utf8') );

eval( fs.readFileSync('./lewdo/apps/shapes/flat.js', 'utf8') );
eval( fs.readFileSync('./lewdo/apps/shapes/terminal.js', 'utf8') );

var lewdo_node = {
    lewdo : lewdo,
    string3 : lewdo.string3,
    
    makeTerminal : function() {
        var mainAppInst = lewdo_terminal().app.pipedInto( lewdo_flat.app() );
        
        console.log( mainAppInst.app_out.toString() );
    }
};

module.exports = lewdo_node;

