
var lewdo_soduko = function ( app ) {
    var ans = Object.create( lewdo_soduko_prototype );
    ans.setup(app);
    return ans;
};

lewdo_app_prototype.all_apps.games["soduko"] = lewdo_soduko;

var lewdo_soduko_prototype = {
    app : null,
    app_out : null,
    board : string3(),
    cursor : string3_utils.xyz(),
    sizeN : 9,

    setup : function(_app) {
    
        this.app = _app || lewdo_app(); 
    
        var sizeN = this.sizeN;
        this.app_out = this.app.app_out;
        this.app_out.resize(sizeN,sizeN+2,sizeN+1);
        this.app_out.clear(" ");

        this.cursor = string3_utils.xyz(5,5,5);

        this.board = string3();
        this.board.resize(sizeN,sizeN,sizeN+1);
        this.board.clear(' ');
        this.board.clearPlane(sizeN, '●'); // ○
        this.randomBoard();

        this.redraw();

        var _this = this;
        this.app.app_in.subscribe(() => {
            _this.input_updated();
        });
    },

    _visitTemp : string3_utils.xyz(),
    visitAllDirections : function(xyz,cb) {
        var t = this._visitTemp;
        for (var z=0; z<this.sizeN; z++) {
            t.copy(xyz); t.x = z; cb(t);
            t.copy(xyz); t.y = z; cb(t);
            t.copy(xyz); t.z = z; cb(t);
        }
    },

    redraw : function() {
        var xyz = string3_utils.xyz;
        var t = string3_utils._tempVec1;

        this.app_out.clear(' ');

        this.app_out.drawString3XYZ( this.board, xyz(0,0,0) );

        t.copy( this.cursor );
        this.app_out.drawTextXYZ( "*", t );
        this.visitAllDirections(t,(loc) => {
            var cur = this.app_out.getByXYZ(loc);
            if (cur != ' ') return;
            this.app_out.setByXYZ("+",loc);
        });

        for (var i=1; i<10; i++) {
            t.set(i-1,10,i-1);
            this.app_out.drawTextXYZ(""+i, t );
        }

        this.app_out.frameStep();
    },

    randomInt : function() {
        return Math.floor( Math.random() * 8 );
    },

    randomBoard : function() {
        var t = this.cursor.clone();
        for (var i=0; i<this.sizeN-1; i++) {
            t.set(this.randomInt(),this.randomInt(),this.randomInt());
            this.board.setByXYZ("" + t.z,t);
        }
    },

    take_turn : function() {
        throw "TODO";
    },

    input_updated : function() {
        //console.log("Terminal input frame...");
        var input = this.app.app_in;
        if (input.width > 0) {
            var letter = input.array1d[0];
            //console.log("Terminal got input '" + letter + "' !");
            if (letter == 'Enter' || letter=="►" ) {
                //this.take_turn();
                return;
            }
            if (letter != letter.trim()) {
                this.board.setByXYZ(this.cursor, letter);
                this.redraw();
                return;
            }
        } else if (!input.scroll.isZero()) {
            var t = string3_utils._tempVec1;
            t.copy(this.cursor);
            t.add(this.app.app_in.scroll);
            if (!this.board.isValidXYZ(t))
                return;

            if (this.board.isValidXYZ(t)) {
                this.cursor.copy(t);
                this.redraw();
                return;
            }
        }
    },


    
};



