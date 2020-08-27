
var lewdo_laptop = {
    create : function(app) {
        var laptop = Object.create(lewdo_laptop._lewdo_app_prototype);
        laptop.setup(app || lewdo_app());
        return laptop;
    },
    app : function(app) {
        var laptop = lewdo_laptop.create(app);
        return laptop.app;
    },
    _lewdo_app_prototype : {
        app : lewdo_app(),
        root : lewdo_app(),
        setup : function(_app) {
            this.app = _app;

            var keyboard = lewdo.apps.shapes.keyboard(lewdo_app());
            var terminal = lewdo.apps.shapes.terminal(lewdo_app());

            var stacker = lewdo.apps.shapes.stack(_app, 
                [ terminal.app, keyboard.app ]
                ,"y");
            this.root = stacker.app;
            
        },
    },
};

lewdo.apps.shapes.laptop = lewdo_laptop.app;
lewdo.apps.tools.laptop = lewdo_laptop.app;
