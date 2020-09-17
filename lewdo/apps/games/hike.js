
var lewdo_hike = {
    create : function(app) {
        var hike = Object.create(lewdo_hike.lewdo_hike_prototype);
        hike.setup(app || lewdo_app());
        return hike;
    },
    app : function(_app) {
        var hike = lewdo_hike.create(_app);
        return hike;
    },
    lewdo_hike_prototype : {
        app : lewdo_app(),
        displaySize : lewdo.xyz(16,9,7),
        playerPosWorld : lewdo.xyz(8,4,2),
        viewOffset : lewdo.xyz(0,0,0),
        gradient : ".:-+*=%@#",

        setup : function(_app) {
            this.app = _app;

            var playerPos = this.playerPosWorld.clone();
            playerPos.z = 1 + this.evalHeightAtWorldXY(playerPos.x, playerPos.y);
            this.playerPosWorld.copy( playerPos );

            this.redraw();
            //this.app.app_out.copy(string3("\nhike\vlewdo"));
            this.fracalScale++;

            this.app.app_in.subscribe((input) => {
                if (!input.scroll.isZero()) {
                    this.tryDoPlayerInput(input.scroll);
                    return;
                }
                if (input.width > 0) {
                    if (input.toString() == lewdo.letter.touch) {
                        var delta = lewdo.xyz().copy( input.offset );
                        delta.select2(this.displaySize,(a,b)=>{
                            return (a - (b/2))
                        });
                        if (Math.abs(delta.x) > Math.abs(delta.y)) {
                            delta.y = 0;
                            delta.x = Math.sign(delta.x);
                        } else {
                            delta.x = 0;
                            delta.y = Math.sign(delta.y);
                        }
                        delta.z = 0;
                        this.tryDoPlayerInput(delta);
                    }
                }
            });
        },
        tryDoPlayerInput : function(scroll) {
            var offset = this.tryGetPlayerOffset( scroll );
            if (offset) {
                this.viewOffset.add(offset);
                this.playerPosWorld.add(offset);
                this.redraw();
            }
            return;
        },
        tryGetPlayerOffset : function(offset) {
            //return offset;
            var curHeight = this.playerPosWorld.z;
            var newPos = lewdo.xyz().copy(this.playerPosWorld).add(offset);
            var newHeight = this.evalHeightAtWorldXY(newPos.x, newPos.y);
            if ((newHeight+1) == curHeight) {
                return offset;
            }
            if (newHeight == curHeight) {
                var move = lewdo.xyz().copy(offset);
                move.z += 1;
                return move;
            }
            if (newHeight == (curHeight-2)) {
                var move = lewdo.xyz().copy(offset);
                move.z += -1;
                return move;
            }
            return undefined;
        },
        _temp_Draw : lewdo.xyz(),
        displayFromWorldXYZ : function(worldPos,into) {
            if (!into) into = lewdo.xyz();
            into.copy(worldPos);
            into.minus(this.viewOffset);
            into.z = (this.displaySize.z - 1) - into.z;
            return into;
        },
        redraw : function() {
            var display = this.app.app_out;
            display.resizeXYZ(this.displaySize);
            display.modifyEachXYZ((was,pos)=> {
                var h = ( this.evalHeightAtWorldXY(
                    pos.x + this.viewOffset.x, 
                    pos.y + this.viewOffset.y ) );

                var p = (this.displaySize.z - pos.z - 1) + this.viewOffset.z;
                //if (p < h) return "+";
                if (pos.z == 0) {
                    if (h >= (this.viewOffset.z + this.displaySize.z))
                        return "|";
                }
                if (pos.z == this.displaySize.z-1) {
                    if (h < this.viewOffset.z)
                        return "-";
                }
                if (p != h) return ' ';
                return String.fromCharCode("0".charCodeAt(0) + (h%10));
            });
            var t = this._temp_Draw;
            this.displayFromWorldXYZ(this.playerPosWorld, t);
            if (display.isValidXYZ(t)) {
                display.setByXYZ(lewdo.letter.touch,t);
            }
            display.frameStep();
        },
        mandelbrot : function (cx, cy, maxIter) {
            var x = 0.0;
            var y = 0.0;
            var xx = 0;
            var yy = 0;
            var xy = 0;
           
            var i = maxIter;
            while (i-- && xx + yy <= 4) {
              xy = x * y;
              xx = x * x;
              yy = y * y;
              x = xx - yy + cx;
              y = xy + xy + cy;
            }
            return maxIter - i;
        },
        defaultRangeOptions : {
            xmin : 0.1,// -2,
            xmax : 0.13,// 1,
            ymin : 0.63, //-1,
            ymax : 0.64,// 1,
            iterations : 200,
            stepSize : 10,
        },
        evalHeightAtWorldXY : function(sx, sy) {
            var ops = this.defaultRangeOptions;
            var showSize = this.displaySize;
            var x = ops.xmin + ((ops.xmax - ops.xmin)*((sx * ops.stepSize)/((showSize.x * ops.stepSize)-1)));
            var y = ops.ymin + ((ops.ymax - ops.ymin)*((sy * ops.stepSize)/((showSize.y * ops.stepSize)-1)));
            var i = this.mandelbrot(x, y, ops.iterations);
            return Math.floor((i * 20)/200);
        },
        debugUI_HTML : function() {
            var canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 90;
             

            var controlsBlock = document.createElement("p");
            controlsBlock.appendChild(canvas);
            controlsBlock.appendChild(document.createElement("br"));

            document.body.appendChild(controlsBlock);
            //this.mandelbrotIntoCanvas(canvas, -2, 1, -1, 1, 1000);

            var options = this.defaultRangeOptions;

            var _this = this;
            var refractal = function() {
                _this.mandelbrotIntoCanvas(canvas,
                    options.xmin, options.xmax,
                    options.ymin, options.ymax,
                    options.iterations, options.stepSize );
            };
            refractal();

            var makeOption = ((optionName) => {
                var label = document.createElement("span");
                label.innerHTML = optionName;
                controlsBlock.appendChild(label);

                var val = document.createElement("input");
                val.type = "text";
                val.value = options[optionName];
                val.onchange = (() => {
                    options[optionName] = 1.0 * val.value;
                    refractal();
                });
                controlsBlock.appendChild(val);

                controlsBlock.appendChild(document.createElement("br"));
            });
             
            for (var optionName in options) {
                makeOption(optionName);
            }
        },
        mandelbrotIntoCanvas : function(canvas, xmin, xmax, ymin, ymax, iterations, stepSize=1) {
            var width = canvas.width;
            var height = canvas.height;
           
            var ctx = canvas.getContext('2d');
            var img = ctx.getImageData(0, 0, 1, 1);
            var pix = img.data;
           
            for (var ix = 0; ix < width; ix += stepSize) {
                //var ix = Math.floor(rix / stepSize);
                for (var iy = 0; iy < height; iy += stepSize) {
                  //var iy = Math.floor(riy / stepSize);

                var x = xmin + (xmax - xmin) * ix / (width - 1);
                var y = ymin + (ymax - ymin) * iy / (height - 1);
                var i = this.mandelbrot(x, y, iterations);
                var ppos = 0; //4 * (width * iy + ix);
           
                if (i > iterations) {
                  pix[ppos] = 0;
                  pix[ppos + 1] = 0;
                  pix[ppos + 2] = 0;
                } else {
                  var c = 3 * Math.log(i) / Math.log(iterations - 1.0);
           
                  if (c < 1) {
                    pix[ppos] = 255 * c;
                    pix[ppos + 1] = 0;
                    pix[ppos + 2] = 0;
                  }
                  else if ( c < 2 ) {
                    pix[ppos] = 255;
                    pix[ppos + 1] = 255 * (c - 1);
                    pix[ppos + 2] = 0;
                  } else {
                    pix[ppos] = 255;
                    pix[ppos + 1] = 255;
                    pix[ppos + 2] = 255 * (c - 2);
                  }
                }
                pix[ppos + 3] = 255;

                for (var sx=0; sx<stepSize; sx++) {
                    for (var sy=0; sy<stepSize; sy++) {
                        ctx.putImageData(img, ix+sx, iy+sy);
                    }
                }
                
              }
            }
           
            //ctx.putImageData(img, 0, 0);
            //ctx.putImageData(img, 0, 0, 0, 0, stepSize, stepSize);
            //ctx.fillRect(20, 20, 150, 100);
          }
    }
};

lewdo.apps.games.hike = lewdo_hike.app;

