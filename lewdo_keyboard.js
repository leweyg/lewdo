
var LEWDO_KEYBOARD = {
    packing:{
        length:(42*5*2),
        width:1,
        order:["char","col","line","SHFT"],
        index_mult:[0,1,42,(5*42)],
    },
    "axes":{
        "col":{mod:42,count:42},
        "line":{pack:42,mod:5,count:5},
        "SHFT":{pack:(42*5),count:2},
        "char":{array:"" +
"`  1  2  3  4  5  6  7  8  9  0  -  = DEL\n"+     
"TAB q  w  e  r  t  y  u  i  o  p  [  ]  \\\n"+     
"CAP  a  s  d  f  g  h  j  k  l  ;  '  # R\n"+    
"SFT   z  x  c  v  b  n  m  ,  .  /  ↑ SFT\n"+    
"c  o  a  ____________________ c o ← ↓ →  \n"+
"~  !  @  #  $  %  ^  &  *  (  )  _  + del\n"+
"tab Q  W  E  R  T  Y  U  I  O  P  {  }  |\n"+    
"cap  A  S  D  F  G  H  J  K  L  :  \"  # ┘\n"+     
"sft   Z  X  C  V  B  N  M  <  >  ?  ↑ sft\n"+   
"c  o  a  ____________________ c o ← ↓ →  \n"+
""}},
};
