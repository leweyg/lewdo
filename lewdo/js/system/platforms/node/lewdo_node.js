
// using hacky eval(file) approach to allow non-module code:
var fs = require('fs');

var string3_system = require('../../core/string3');
var string3 = string3_system.string3;
var string3_utils = string3_system.string3_utils;

eval( fs.readFileSync('./lewdo/js/system/lewdo.js', 'utf8') );

eval( fs.readFileSync('./lewdo/js/apps/shapes/flat.js', 'utf8') );
eval( fs.readFileSync('./lewdo/js/apps/shapes/text.js', 'utf8') );
eval( fs.readFileSync('./lewdo/js/apps/shapes/terminal.js', 'utf8') );

var lewdo_node = {
    lewdo : lewdo,
    string3 : lewdo.string3,
    
    makeTerminal : function() {

        var mainAppInst = lewdo_terminal().app;
        var needsFlatten = true;
        for (var k in process.argv) {
            if (process.argv[k] == "-3d") {
                needsFlatten = false;
            }
            if (process.argv[k] == "-app") {
                var toRun = process.argv[(1*k)+1];
                var appStarter = lewdo.apps.tools[toRun];
                mainAppInst = appStarter().app;
            }
        }
        if (needsFlatten) {
            mainAppInst = mainAppInst.pipedInto( lewdo_flat.app() );
        }
        process.stdout.write( mainAppInst.app_out.toString() + "\n" );

        if (false) {
            var srcFile = "lewdo/system/script/examples/helloworld.js";// './lewdo/system/lewdo.js';
            var textContent = fs.readFileSync(srcFile, 'utf8');
            var test = lewdo_text.toString3( textContent );
            var jsonContent = test.toJSON();
            console.log(jsonContent);
            fs.writeFileSync( "./out.js", "var example_string3_json = " + jsonContent );
        }

        if (false) {
            var textContent = fs.readFileSync('./out.js', 'utf8');
            var val = JSON.parse( textContent );
            var str3 = string3( val );
            var flat = lewdo_flat.flatten( str3 );
            console.log( flat.toString() );
        }
        
    }
};

module.exports = lewdo_node;

