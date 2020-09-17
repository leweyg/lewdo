
var lewdo_grid = {
    app : function(_app) {
        var result = Object.create( lewdo_grid.grid_prototype );
        result.setup(_app);
        return result;
    },
    demo : function(_app) {
        var grid = lewdo_grid.app(_app);

        var into = lewdo.string3();

        into.resize(3,3,3,"*");
        
        
        grid.app.app_in.copy(into);
        grid.app.app_in.frameStep();

        return grid;
    },
    grid_prototype : {
        app : null, 

        setup : function(_app) {
            this.app = (_app || lewdo.app() );

            this.app.app_in.subscribe((input)=>{
                this.app.app_out.copy(input);
            });
        }
    },
};

lewdo.apps.shapes.grid = lewdo_grid.app;
lewdo.apps.tools.grid = lewdo_grid.demo;
