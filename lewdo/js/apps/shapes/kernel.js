
var lewdo_kernel = {
    create : function(app) {
        var context = Object.create( lewdo_kernel.kernel_system_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_kernel.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_kernel.create(_app);
        context.app.app_out.copy(lewdo.string3("lewdo_kernel"));
        return context;
    },

    kernel_system_prototype : {
        app : lewdo.app(),

        setup : function(_app) {
            this.app = _app;

        },
    }
};

//lewdo.apps.shapes.kernel = lewdo_kernel.app;
//lewdo.apps.tools.kernel = lewdo_kernel.demo;
