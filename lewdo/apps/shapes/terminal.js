
var lewdo_terminal = function ( app ) {
    var ans = Object.create( lewdo_terminal_prototype );
    ans.setup(app);
    return ans;
};

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
            //console.log("Terminal input frame...");
            var input = this.app.app_in;
            if ((input.array1d.length > 0) && (input.array1d[0] == "Escape") 
                    || (input.array1d[0]=="~")
                    || (input.array1d[0]=="x")
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
            input = input.trim();
            if (input.width > 0) {
                var letter = input.array1d[0];
                if ((letter == 'Enter') || (letter==lewdo.letter.play) 
                    || (letter == lewdo.letter.touch )) {
                    this.launchSelected();
                }
                if (letter == lewdo.letter.hover) {
                    var row_y = input.offset.y;
                    for (var si in this.selected_from) {
                        var entry = this.selected_from[si];
                        if (row_y == entry.row_y) {
                            this.selected_index = si;
                            this.redraw();
                            return;
                        }
                    }
                }
            } else if (input.scroll && !input.scroll.isZero()) {
                var n = this.selected_from.length;
                this.selected_index = ( this.selected_index + input.scroll.y + input.scroll.x + input.scroll.z + n ) % n;
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

        var rawApps = {apps:lewdo.apps,system:{}};
        var allApps = [];
        var folderLayer = "\n";
        var fileLayer = "\n";
        var selectLayer = "\n";
        var genreLayer = "\n";
        var curIndex = 0;
        this.selected_from = [];
        var row_y = 0;
        var prefix = "";
        for (var folder in rawApps) {
            folderLayer += "    " + folder + "\n";
            fileLayer += "\n";
            selectLayer += "\n";
            genreLayer += "\n";
            row_y++;
            for (var genre in rawApps[folder]) {
                
                prefix = "   ";
                genreLayer += "    " + prefix + genre + "\n";
                folderLayer += "\n";
                fileLayer += "\n";
                selectLayer += "\n";
                row_y++;
                if (genre == "shapes") continue;
                prefix = "           ";
                for (var app in rawApps[folder][genre]) {
                    folderLayer += "\n";
                    genreLayer += "\n";
                    var isSelected = (this.selected_index == curIndex);
                    var showAppAs = ( isSelected ? "●": " ") + app;
                    var thisLine = "" + prefix + showAppAs + "\n";
                    
                    allApps.push({name:app,depth:2,path:folder});
                    var fullname = "lewdo." + folder + "." + genre + "." + app;
                    this.selected_from.push({ 
                        name:fullname,
                        method:(rawApps[folder][genre][app]),
                        row_y:row_y,
                    } );
                    if (this.selected_index == curIndex) {
                        fileLayer += " \n";
                        selectLayer += thisLine;
                    } else {
                        fileLayer += thisLine;
                        selectLayer += "\n";
                    }
                    curIndex++;
                    row_y++;
                }
            }
        }
        var final = selectLayer + "\v" + fileLayer + "\v" + genreLayer + "\v" + folderLayer + "\vlewdo";

        this.console3.copy( string3_utils.fromString(final) );

        this.console3.frameStep();
    }
    
};

lewdo.apps.shapes.terminal = lewdo_terminal;





