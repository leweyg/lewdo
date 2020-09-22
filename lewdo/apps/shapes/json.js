
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
        catchExceptions : false,

        setup : function(_app) {
            this.app = _app;
            var _this = this;
            this.app.app_in.subscribe((input)=>{
                if (_this && _this.skipInputUpdates) return;
                var json = input.toString();
            
                var obj = null;
                if (json == "") {
                    obj = "";
                } else if (this.catchExceptions) {
                    try {
                        obj = JSON.parse( json );
                        
                    } catch (ex) {
                        obj = ex.toString();
                    }
                } else {
                    obj = JSON.parse( json );
                }

                var codifier = lewdo.apps.shapes.code();
                var into = codifier.string3fromObject(obj);

                _this.app.app_out.copy(into);
                _this.app.app_out.frameStep();
            });
        }
    }
};

lewdo.apps.shapes.json = lewdo_shapes_json.app;
lewdo.apps.tools.json = lewdo_shapes_json.demo;
