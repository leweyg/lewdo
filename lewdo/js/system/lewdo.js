

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
    app : lewdo_app,
    lewdo_app : lewdo_app, // deprecated
    string3 : string3,
    string3_utils : string3_utils,
    xyz : string3_utils.xyz,
    lewey : true,
    apps : {
        games:{},
        tools:{},
        shapes:{},
    },
    letter:{
        hover:"○",
        touch:"●",
        play:"►",
        left:"←",
        right:"→",
        up:"↑",
        down:"↓",
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
        this.app_in.subscribe(()=>{}, ()=>{
            // when the input is done, also finish the output.
            this.app_out.dispose();
        });
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
        }, () => {
            otherApp.app_in.dispose();
        });
        return otherApp;
    },
    pipeThrough : function(otherApp) {
        this.app_in.pipeInto(otherApp.app_in);
        otherApp.app_out.pipeInto(this.app_out);
    },
};

var lewdo_this_app = null;

try {
    module.exports = { 
        lewdo : lewdo,
        lewdo_app:lewdo_app,
    };
} catch {
    
}

