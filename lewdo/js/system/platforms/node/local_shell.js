const child_process = require('child_process');

// Eventually make this a service to a local bash shell,
// that is then passed into a 3d lewdo context

var local_shell = {
    command_line_shell : function() {
        console.log("Shell test...");
        var childShell = child_process.spawn("/bin/bash");
        childShell.stdin.setEncoding('utf-8');

        // listen for commands and pass them to shell:
        process.stdin.on("data", function (data) {
            var str = data.toString().trim();
            if (str == "exit") {
                childShell.kill();
                process.exit();
            }
            childShell.stdin.cork();
            childShell.stdin.write(str + "\n");
            childShell.stdin.uncork();
        });

        // listen for shell output:
        var printPrompt = (() => {
            process.stdout.write("cmd:$ ");
        });
        childShell.stdout.on("data",function(data){
            console.log(("" + data).trim());
            printPrompt();
        });
        printPrompt();
    }
};

module.exports = local_shell;


