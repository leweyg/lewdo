
import { lewdo2 } from '../../core/lewdo2.js'

export var openvdb = {
    reader : function(path) {
        var app = lewdo2.process();
        app.namedInputToOutput(app.in, app.out,(filename)=>{
            
        });
        return app;
    },
};



