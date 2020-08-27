

/*
var string3_system = require("./string3.js");
var string3 = string3_system.string3;
var string3_utils = string3_system.string3.string3_utils;
*/

var lewdo_app = function() {
    var app = Object.create( lewdo_app_prototype );
    app.setup();
    return app;
};

var lewdo = {
    lewdo_app : lewdo_app,
    string3 : string3,
    xyz : string3_utils.xyz,
    all_apps : {games:{},tools:{},shapes:{}},
    letter:{
        hover:"○",
        touch:"●",
        play:"►",
    },
};

var lewdo_app_prototype = {
    app_in : string3(),
    app_out : string3(),
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
    pipedInto : function(otherApp) {
        otherApp = ( otherApp || lewdo_app() );
        this.app_out.subscribe((output) => {
            otherApp.app_in.copy(output);
            otherApp.app_in.frameStep();
        });
        return otherApp;
    }
};

var lewdo_this_app = null;

try {
    module.exports = { 
        lewdo : lewdo,
        lewdo_app:lewdo_app, 
        lewdo_app_prototype:lewdo_app_prototype,
    };
} catch {
    
}

