
var lewdo_shapes_json = {
    create : function(app) {
        var context = Object.create( lewdo_shapes_json.lewdo_shapes_json_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_shapes_json.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_shapes_json.app(_app);

        var demo_json = "{\"type\":\"json\",\"value\":\"Hello World.\"}";

        context.app.app_in.copy( lewdo.string3( demo_json ) );
        context.app.app_in.frameStep();

        context.app.skipInputUpdates = true;
        
        return context;
    },
    lewdo_shapes_json_prototype : {
        app : lewdo.app(),
        skipInputUpdates : false,

        setup : function(_app) {
            this.app = _app;
            var _this = this;
            this.app.app_in.subscribe((input)=>{
                if (_this && _this.skipInputUpdates) return;
                _this.app.app_out.copy(input);
                _this.app.app_out.frameStep();
            });
        }
    }
};

lewdo.apps.shapes.json = lewdo_shapes_json.app;
lewdo.apps.tools.json = lewdo_shapes_json.demo;
