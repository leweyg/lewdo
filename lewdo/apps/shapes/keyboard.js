
var lewdo_system_keyboard = function ( app ) {
    var ans = Object.create( lewdo_system_keyboard_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_system_keyboard_prototype = {
    console3 : string3(),
    app : null,
    text : string3(),
    cursor : string3_utils.xyz(),
    cursor_active : false,
    cursor_down : false,

    isShiftHeld : false,

    refKeyboard : string3( "" +
        "`  1  2  3  4  5  6  7  8  9  0  -  = DEL\n"+     
        "TAB q  w  e  r  t  y  u  i  o  p  [  ]  \\\n"+     
        "CAP  a  s  d  f  g  h  j  k  l  ;  '  # ►\n"+    
        "SFT   z  x  c  v  b  n  m  ,  .  /  ↑ SFT\n"+    
        "c  o  a  ____________________ c o ← ↓ →  \n\v"+
        "~  !  @  #  $  %  ^  &  *  (  )  _  + del\n"+
        "tab Q  W  E  R  T  Y  U  I  O  P  {  }  |\n"+    
        "cap  A  S  D  F  G  H  J  K  L  :  \"  # ►\n"+     
        "sft   Z  X  C  V  B  N  M  <  >  ?  ↑ sft\n"+   
        "c  o  a  ____________________ c o ← ↓ →  \n"+
        "" ),
    refKeyboardWidth : 42,
    refKeyboardHeight : 5,
    refKeyboardDepth : 2,


    setup : function(_app) {
        this.app = _app;
        this.text = string3();
        this.text.scroll = string3_utils.xyz();
        this.redraw();
        this.app.app_in.subscribe((input) => {
            var wasDown = this.cursor_down;
            var isDown = false;
            if (input.width > 0) {
                if (input.array1d[0] == "Shift") {
                    this.isShiftHeld = true;
                } else {
                    this.isShiftHeld = false;
                }
                isDown = (input.array1d[0] == lewdo.letter.touch);
                if (input.array1d[0] == lewdo.letter.hover
                    || isDown ) {
                    if (this.refKeyboard.isValidXYZ(input.offset)) {
                        this.cursor_active = true;
                        this.cursor_down = isDown;
                        this.cursor.copy( input.offset );
                    }
                } else {
                    this.cursor_active = false;
                    this.cursor_down = false;
                }
            } else {
                this.isShiftHeld = false;
                this.cursor_down = false;
            }
            if (isDown != wasDown) {
                this.text.scroll.set(0,0,0);
                this.text.resize(0,0,0);
                if (isDown) {
                    var raise = this.refKeyboard.getByXYZ(this.cursor);
                    if (raise != " ") {
                        var arrowKey = string3_utils.letterToXYZ(raise);
                        if (arrowKey) {
                            this.text.resize(0,0,0);
                            this.text.scroll.copyIf(arrowKey);
                        } else {
                            this.text.copy(string3(raise));
                        }
                    }
                }
                this.text.frameStep();
            }
            this.redraw();
        });
    },

    redraw : function() {
        var xyz = string3_utils.xyz;
        var start = xyz(0,0,this.isShiftHeld?1:0);
        var end = this.refKeyboard.sizeXYZ().clone();
        end.z = start.z + 1;
        var layer = this.refKeyboard.subString3XYZ(start,end);
        var into = this.app.app_out;
        into.resize(layer.width, layer.height, 3);
        into.drawString3XYZ(layer,string3_utils.xyz(0,0,0));
        if (this.cursor_active) {
            this.cursor.z = 0;
            var raise = layer.getByXYZ(this.cursor);
            into.drawTextXYZ( " ",this.cursor);
            this.cursor.z = this.cursor_down ? 2 : 1;
            into.drawTextXYZ(raise,this.cursor);
            
            
            
        }
        into.frameStep();
    },
};

lewdo.apps.shapes.keyboard = lewdo_system_keyboard;
lewdo.apps.tools.keyboard = lewdo_system_keyboard;


