
var lewdo_soduko = function ( app ) {
    var ans = Object.create( lewdo_soduko_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_soduko_prototype = {
    app : null,
    app_out : null,
    board : string3(),
    board2d : string3(),
    cursor : string3_utils.xyz(),
    sizeN : 5,

    setup : function(_app) {
    
        this.app = _app || lewdo_app(); 
    
        var sizeN = this.sizeN;
        this.app_out = this.app.app_out;
        this.app_out.resize(sizeN,sizeN+2,sizeN+1);
        this.app_out.clear(" ");

        this.cursor = string3_utils.xyz(2,2,2);

        this.board2d = string3();
        this.board2d.resize(sizeN,sizeN,1);
        this.board2d.clear();

        this.board = string3();
        this.board.resize(sizeN,sizeN,sizeN);
        this.board.clear(' ');
        
        this.randomBoard();

        this.redraw();

        var _this = this;
        this.app.app_in.subscribe(() => {
            _this.input_updated();
        });
    },

    ZToLetter : function(z) {
        console.assert(z < 10);
        console.assert(z >= 0);
        return String.fromCharCode( z + ("1".charCodeAt(0)) );
    },

    letterToZ : function(letter) {
        var z = letter.charCodeAt(0) - ("1".charCodeAt(0));
        return z;
    },

    currentLetter : function() {
        var letter = this.ZToLetter( this.cursor.z );
        return letter;
    },

    playAtCurrent : function() {
        this.board.setByXYZ(this.currentLetter(),this.cursor);
        this.redraw();
    },

    _visitTemp : string3_utils.xyz(),
    visitAllDirections : function(xyz,cb) {
        var t = this._visitTemp;
        for (var z=0; z<this.sizeN; z++) {
            t.copy(xyz); t.x = z; cb(t);
            t.copy(xyz); t.y = z; cb(t);
            //t.copy(xyz); t.z = z; cb(t);
        }
    },

    redraw : function() {
        var xyz = string3_utils.xyz;
        var t = xyz();
        var n = this.sizeN;

        this.app_out.clear(' ');
        var _this = this;

        this.app_out.drawString3XYZ( this.board2d, xyz(0,0,this.sizeN) );
        this.board2d.visitEachXYZ((letter,pos)=> {
            if (letter == " ") return;
            pos.z = _this.letterToZ(letter);
            this.app_out.drawTextXYZ("○",pos);
        });
        this.app_out.drawRangeXYZ('○',xyz(0,n+1,n),xyz(n,n+2,n+1));
        this.app_out.drawTextXYZ(
            this.ZToLetter(this.cursor.z),
            xyz(this.cursor.z,n+1,n));

        t.copy( this.cursor );
        var curLetter = this.currentLetter();
        var numbersUsed = {};
        var wasOverlap = false;
        this.visitAllDirections(t,(sidePos)=>{
            var letter = this.app_out.getByXYZ(sidePos);
            if (letter != " ") {
                if (t.equals(sidePos))
                    return;
                wasOverlap = true;
                this.app_out.drawTextXYZ("●",sidePos);
                return;
            }
            var showAs = ((sidePos.x==t.x) ? "│" : "─");
            this.app_out.drawTextXYZ(showAs,sidePos);
        });
        this.app_out.drawTextXYZ( wasOverlap ? "●" : "○", t );
        t.z = this.sizeN;
        this.app_out.drawTextXYZ( curLetter, t );

        for (var i=0; i<this.sizeN; i++) {
            t.set(i,this.sizeN+1,i);
            var num = this.ZToLetter(i);
            if (!(num in numbersUsed))
                this.app_out.drawTextXYZ(num, t );
        }

        this.app_out.frameStep();
    },

    randomInt : function() {
        return Math.floor( Math.random() * this.sizeN );
    },

    randomBoard : function() {
        var t = this.cursor.clone();
        var placed = 0;
        var tries = 0;
        var goal = 20;
        while ((placed < goal) && (tries < 100)) {
            tries++;
            t.set(this.randomInt(),this.randomInt(),this.randomInt());
            var testVal = this.ZToLetter(t.z);
            t.z = 0;
            var good = true;
            this.visitAllDirections(t, (other) => {
                var otherVal = this.board2d.getByXYZ(other);
                if (otherVal == testVal)
                    good = false;
            });
            if (!good) continue;
                
            placed++;
            this.board2d.setByXYZ(testVal,t);
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
            if (letter == 'Enter' || letter=="►" || letter==lewdo.letter.touch ) {
                this.playAtCurrent();
                return;
            }
            if (letter == lewdo.letter.hover) {
                if (this.board.isValidXYZ(input.offset)) {
                    this.cursor.x = input.offset.x;
                    this.cursor.y = input.offset.y;
                    this.redraw();
                    return;
                }
                var t = input.offset.clone();
                t.y-=2;
                if (this.board.isValidXYZ(t)) {
                    // then it's selecting which value:
                    this.cursor.z = t.x;
                    this.redraw();
                    return;
                }
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
            if (this.board.isValidXYZ(t)) {
                this.cursor.copy(t);
                this.redraw();
                return;
            }
        }
    },
};





lewdo.apps.games.soduko = lewdo_soduko;
