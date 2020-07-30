
var lewdo_connect4 = function ( app ) {
    var ans = Object.create( lewdo_connect4_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_connect4_prototype = {
    app : null,
    app_out : null,
    board : string3(),

    setup : function(_app) {
        
        this.app = _app || lewdo_app(); 
        var xyz = string3_utils.xyz;

        this.app_out = this.app.app_out;
        this.app_out.resize(12,7,5);
        this.app_out.clear(" ");

        this.board = string3();
        this.board.resize(4,4,5);
        this.board.clear(' ');
        this.board.clearPlane(4, "*");

        this.app_out.drawString3XYZ( this.board, xyz(4,0,0) );

        this.app_out.drawTextXYZ('X',xyz(5,5,4));
        this.app_out.drawTextXYZ('O',xyz(6,5,1));

        this.app.app_in.subscribe(() => {
            console.log("Terminal input frame...");
            var input = this.app.app_in;
            if (input.width > 0) {
                var letter = input.array1d[0];
                console.log("Terminal got input '" + letter + "' !");
            }
        });
    },
    
};



