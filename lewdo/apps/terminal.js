
var lewdo_terminal = function ( app ) {
    var ans = Object.create( lewdo_terminal_prototype );
    ans.setup(app);
    return ans;
};

lewdo_app_prototype.all_apps.apps["terminal"] = lewdo_terminal;

var lewdo_terminal_prototype = {
    console3 : string3(),
    app : null,

    hosted_app : null,

    selected_index : 0,
    selected_app : null,
    selected_from : [],

    setup : function(_app) {
        this.app = _app || lewdo_app(); 
        

        this.redraw();

        this.app.app_in.subscribe(() => {
            console.log("Terminal input frame...");
            var input = this.app.app_in;
            if ((input.array1d.length > 0) && (input.array1d[0] == "Escape") 
                    || (input.array1d[0]=="~")
                    || (input.array1d[0]=="`")) {
                this.hosted_app = null;
                this.selected_index = 0;
                this.redraw();
                return;
            }
            if (this.hosted_app) {
                this.hosted_app.app_in.copy(input);
                this.hosted_app.app_in.frameStep();
                return;
            }
            if (input.width > 0) {
                var letter = input.array1d[0];
                if (letter == 'Enter' || letter=="►" ) {
                    this.launchSelected();
                }
            } else if (input.scroll.y != 0) {
                this.selected_index = ( this.selected_index + input.scroll.y ) % this.selected_from.length;
                this.redraw();
            }
        });
    },

    launchSelected : function() {
        var toLaunch = this.selected_from[this.selected_index];
        var name = toLaunch.name;
        var starter = toLaunch.method;

        var app_inst = lewdo_app();
        this.hosted_app = app_inst;
        var game = starter( app_inst );

        this.hosted_app.app_out.subscribe(() => {
            if (app_inst != this.hosted_app)
                return;
            this.app.app_out.copy(app_inst.app_out);
            this.app.app_out.frameStep();
        });
    },


    redraw : function() {
        var xyz = string3_utils.xyz;
        this.console3 = this.app.app_out;

        var rawApps = this.app.all_apps;
        var allApps = [];
        var folderLayer = "\n";
        var fileLayer = "\n";
        var selectLayer = "\n";
        var curIndex = 0;
        this.selected_from = [];
        for (var folder in rawApps) {
            folderLayer += "    " + folder + "\n";
            fileLayer += "\n";
            selectLayer += "\n";
            for (var app in rawApps[folder]) {
                folderLayer += "\n";
                var thisLine = "     " + "    " + app + "\n";
                
                allApps.push({name:app,depth:2,path:folder});
                var fullname = "lewdo." + folder + "." + app;
                this.selected_from.push({ name:fullname,method:(rawApps[folder][app]) } );
                if (this.selected_index == curIndex) {
                    fileLayer += " \n";
                    selectLayer += thisLine;
                } else {
                    fileLayer += thisLine;
                    selectLayer += "\n";
                }
                curIndex++;
            }
        }
        var final = selectLayer + "\v\v" + fileLayer +"\v" + folderLayer + "\vlewdo";

        this.console3.copy( string3_utils.fromString(final) );

        this.console3.frameStep();
    }
    
};



