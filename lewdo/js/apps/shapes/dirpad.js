

var lewdo_dirpad = {
    create : function(app) {
        var laptop = Object.create(lewdo_dirpad._lewdo_dirpad_prototype);
        laptop.setup(app || lewdo_app());
        return laptop;
    },
    source : string3("x↑\n←►→\n-↓+"),
    app : function(app) {
        var pad = lewdo_dirpad.create(app);
        return pad.app;
    },
    _lewdo_dirpad_prototype : {
        app : lewdo_app(),
        root : lewdo_app(),
        setup : function(_app) {
            this.app = _app;

            var src = lewdo_dirpad.source;

            var stackUpDown = lewdo.apps.shapes.stack( _app, 
                [], "y" );

            for (var y=0; y<src.height; y++) {
                var stackLeftRight = lewdo.apps.shapes.stack(lewdo_app(),[],"x");
                stackUpDown.pushApp( stackLeftRight.app, "start" );
                for (var x=0; x<src.width; x++) {
                    var letter = src.getBySeperateXYZ(x,y,0);
                    if (letter == " ") continue;

                    var button = lewdo.apps.shapes.button(lewdo_app(),string3(letter),()=>{
                        // clicked callback
                        console.log("Clicked " + letter + "!");
                    });
                    
                    stackLeftRight.pushApp( button.app );
                    //stackUpDown.pushApp( button.app );
                }
            }
            
            stackUpDown.redraw();
            this.root = stackUpDown.app;
            
        },
    },
};

lewdo.apps.shapes.dirpad = lewdo_dirpad.app;
lewdo.apps.tools.dirpad = lewdo_dirpad.app;

