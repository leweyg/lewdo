
var lewdo_app = function() {
    var app = Object.create( lewdo_app_prototype );
    app.setup();
    return app;
};

var lewdo_app_prototype = {
    app_in : string3(),
    app_out : string3(),
    all_apps : {apps:{games:{},shapes:{}},system:{}},
    setup : function() {
        this.app_in = string3();
        this.app_in.offset = string3_utils.xyz();
        this.app_in.scroll = string3_utils.xyz();
        this.app_out = string3();
        this.app_out.max = string3_utils.xyz(80,24,6);
    },
    app_in_reset : function(size=0) {
        this.app_in.offset.set(0,0,0);
        this.app_in.scroll.set(0,0,0);
        this.app_in.resize(size,size,size);
    },
};

var lewdo_this_app = null;

