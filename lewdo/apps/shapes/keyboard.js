
var lewdo_system_keyboard = function ( app ) {
    var ans = Object.create( lewdo_system_keyboard_prototype );
    ans.setup(app);
    return ans;
};

var lewdo_system_keyboard_prototype = {
    console3 : string3(),
    app : null,

    isShiftHeld : false,

    refKeyboard : string3( "" +
        "`  1  2  3  4  5  6  7  8  9  0  -  = DEL\n"+     
        "TAB q  w  e  r  t  y  u  i  o  p  [  ]  \\\n"+     
        "CAP  a  s  d  f  g  h  j  k  l  ;  '  # ┘\n"+    
        "SFT   z  x  c  v  b  n  m  ,  .  /  ↑ SFT\n"+    
        "c  o  a  ____________________ c o ← ↓ →  \n\v"+
        "~  !  @  #  $  %  ^  &  *  (  )  _  + del\n"+
        "tab Q  W  E  R  T  Y  U  I  O  P  {  }  |\n"+    
        "cap  A  S  D  F  G  H  J  K  L  :  \"  # ┘\n"+     
        "sft   Z  X  C  V  B  N  M  <  >  ?  ↑ sft\n"+   
        "c  o  a  ____________________ c o ← ↓ →  \n"+
        "" ),
    refKeyboardWidth : 42,
    refKeyboardHeight : 5,
    refKeyboardDepth : 2,


    setup : function(_app) {
        this.app = _app;
        this.redraw();
        this.app.app_in.subscribe((input) => {
            if (input.width > 0) {
                if (input.array1d[0] == "Shift") {
                    this.isShiftHeld = true;
                } else {
                    this.isShiftHeld = false;
                }
            } else {
                this.isShiftHeld = false;
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
        this.app.app_out.copy( layer );
        this.app.app_out.frameStep();
    },
};

lewdo.all_apps.shapes.keyboard = lewdo_system_keyboard;


