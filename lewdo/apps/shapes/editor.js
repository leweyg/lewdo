
var lewdo_editor = {
    create : function(app) {
        var editor = Object.create(lewdo_editor.lewdo_editor_prototype);
        editor.setup(app || lewdo.app());
        return editor;
    },
    app : function(_app) {
        var editor = lewdo_editor.create(_app);
        return editor;
    },
    lewdo_editor_prototype : {
        app : lewdo_app(),
        displaySize : lewdo.xyz(16,9,7),
        playerPosWorld : lewdo.xyz(8,4,2),
        viewOffset : lewdo.xyz(0,0,0),
        gradient : ".:-+*=%@#",

        setup : function(_app) {
            this.app = _app;

            this.app.app_in.subscribe((input)=>{
                this.app.app_out.copy(string3("lewdo\neditor"));
                this.app.app_out.frameStep();
            });
        },

        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.editor = lewdo_editor.app;
lewdo.apps.tools.editor = lewdo_editor.app;

