
var lewdo_connect4 = function ( app ) {
    var ans = Object.create( lewdo_connect4_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_connect4_prototype = {
    app : null,
    app_out : null,
    board : string3(),
    cursor : string3_utils.xyz(),
    cursor_display : string3(),
    sides_names : [ "X", "O" ],
    sides_turn : 0,

    setup : function(_app) {
    
        this.app = _app || lewdo_app(); 
    
        this.app_out = this.app.app_out;
        this.app_out.resize(12,7,5);
        this.app_out.clear(" ");

        this.cursor_display = string3();
        this.cursor_display.resize(4,4,4);

        this.board = string3();
        this.board.resize(4,4,5);
        this.board.clear(' ');
        this.board.clearPlane(4, '#');

        this.redraw();

        var _this = this;
        this.app.app_in.subscribe(() => {
            _this.input_updated();
        });
    },

    redraw : function() {
        var xyz = string3_utils.xyz;
        var t = string3_utils._tempVec1;

        this.app_out.clear(' ');

        this.app_out.drawString3XYZ( this.board, xyz(4,0,0) );

        this.cursor_display.clear(' ');
        this.cursor_display.drawTextXYZ("*", this.cursor );

        t.copy( this.cursor );
        t.add(xyz(4,0,0));
        this.app_out.drawTextXYZ( this.sides_names[ this.sides_turn ], t );

        this.app_out.drawTextXYZ(this.sides_names[0],xyz(5,5,(this.sides_turn==0)?0:4 ));
        this.app_out.drawTextXYZ(this.sides_names[1],xyz(6,5,(this.sides_turn==1)?0:4 ));

        this.app_out.frameStep();
    },

    input_updated : function() {
        //console.log("Terminal input frame...");
        var input = this.app.app_in;
        if (input.width > 0) {
            var letter = input.array1d[0];
            //console.log("Terminal got input '" + letter + "' !");
            if (letter == 'Enter') {
                this.sides_turn = (this.sides_turn + 1) % 2;
                this.redraw();
            }
        } else if (!input.scroll.isZero()) {
            var t = string3_utils._tempVec1;
            t.copy(this.cursor);
            t.add(this.app.app_in.scroll);
            if (this.cursor_display.isValidXYZ(t)) {
                this.cursor.copy(t);
                this.redraw();
            }
        }
    },


    
};



