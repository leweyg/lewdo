
var lewdo_app = function() {
    var app = Object.create( lewdo_app_prototype );
    app.setup();
    return app;
};

var lewdo_app_prototype = {
    app_in : string3(),
    app_out : string3(),
    setup : function() {
        this.app_in = string3();
        this.app_out = string3();
    }
};

