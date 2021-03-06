

var lewdo_flat = {
    flatten : function(input,into) {
        into = (into || string3());
        into.resize(input.width,input.height,1);
        for (var y=0; y<input.height; y++) {
            for (var x=0; x<input.width; x++) {
                var val = " ";
                for (var z=0; z<input.depth; z++) {
                    var cur = input.getBySeperateXYZ(x,y,z);
                    if (cur != " ") {
                        val = cur;
                        break;
                    }
                }
                into.setBySeperateXYZ(val, x, y, 0);
            }
        }
        return into;
    },
    app : function(_app) {
        _app = (_app || lewdo_app());
        _app.app_in.subscribe((input) => {
            var into = _app.app_out;
            lewdo_flat.flatten( input, into );
            into.frameStep();
        });
        return _app;
    }
};

lewdo.apps.shapes.flat = lewdo_flat.app;
