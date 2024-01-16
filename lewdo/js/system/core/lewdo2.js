
import { string3 } from './string3.js'
import { observe } from './observe.js'

export var lewdo = {
    main : null, // main lewdo.app()
    types : {
        observe : observe,
        string3 : string3,
        string3utils : string3.string3utils,
        app : function () {
            var a = observe.process();
            a.in.setValue(new string3());
            a.out.setValue(new string3());
            return a;
        },
        
    },
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

function lewdo_initialize() {
    lewdo.main = lewdo.types.app();
}
lewdo_initialize();
