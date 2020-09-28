
var lewdo_cache = {
    create : function(app) {
        var context = Object.create( lewdo_cache.lewdo_cache_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_cache.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_cache.app( _app );
        return context;
    },
    lewdo_cache_prototype : {
        app : lewdo.app(),

        setup : function(_app) {
            this.app = _app;

            this.app.app_out.copy(lewdo.string3("cache\ndemo"));
            this.app.app_out.frameStep();
        },
    }
};

lewdo.apps.shapes.cache = lewdo_cache.app;
lewdo.apps.tools.cache = lewdo_cache.demo;

