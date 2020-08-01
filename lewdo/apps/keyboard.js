

var lewdo_system_keyboard = function ( app ) {
    var ans = Object.create( lewdo_system_keyboard_prototype );
    ans.setup(app);
    return ans;
};

lewdo_app_prototype.all_apps.apps["keyboard"] = lewdo_system_keyboard;

var lewdo_system_keyboard_prototype = {
    console3 : string3(),
    app : null,

    refKeyboard : string3( "`  1  2  3  4  5  6  7  8  9  0  -  = DEL\n"+     
        "TAB q  w  e  r  t  y  u  i  o  p  [  ]  \\\n"+     
        "CAP  a  s  d  f  g  h  j  k  l  ;  '  # R\n"+    
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
    },

    redraw : function() {
        this.app.app_out.copy( this.refKeyboard );
        this.app.app_out.frameStep();
    },
};

