// lewdo for node.js:
//console.log(process.argv);

var lewdo_node = require('./lewdo/js/system/platforms/node/lewdo_node');
lewdo_node.makeTerminal();

var isShellService = false;
if (isShellService) {
    var local_shell = require('./lewdo/js/system/platforms/node/local_shell');
    local_shell.command_line_shell();
}

