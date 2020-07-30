
var lewdo_terminal = function ( app ) {
    var ans = Object.create( lewdo_terminal_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_terminal_prototype = {
    console3 : string3(),
    app : null,

    setup : function(_app) {
        this.app = _app || lewdo_app(); 
        var xyz = string3_utils.xyz;
        this.console3 = this.app.app_out;
        this.console3.resize(16,9,3);
        this.console3.clearPlane(2,'*');
        this.console3.clearPlane(1,' ');
        this.console3.drawTextXYZ('lewdo',xyz(0,0,1));
        this.console3.clearPlane(0,' ');
        this.console3.drawTextXYZ('>',xyz(5,0,0));
    },
    
};



