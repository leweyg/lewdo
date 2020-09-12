
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
        topStack : lewdo_app(),
        allApps : [],

        setup : function(_app) {
            this.app = _app;
            var all_shapes = lewdo.apps.shapes;

            var keyboard = all_shapes.keyboard();
            var fileList = all_shapes.text(null,"\ntest.js\vFiles");
            var textEditor = all_shapes.text(null,"Hello World!\n-lewdo");
            var aroundText = all_shapes.cube(null, textEditor.app );
            var blades = all_shapes.stack(null,[ fileList.app, aroundText.app ],"x");

            this.topStack = all_shapes.stack(this.app, [ 
                blades.app,
                keyboard.app
            ], "y" );
        
        },

        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.editor = lewdo_editor.app;
lewdo.apps.tools.editor = lewdo_editor.app;

