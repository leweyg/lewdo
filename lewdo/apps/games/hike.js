
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
        displaySize : lewdo.xyz(16,9,5),
        gradient : ".:-+*=%@#",
        fracalScale : 1,
        maxSteps : 10,

        setup : function(_app) {
            this.app = _app;

            this.redraw();
            //this.app.app_out.copy(string3("\nhike\vlewdo"));
            this.fracalScale++;

            this.app.app_in.subscribe((input) => {
                var was = this.fracalScale;
                if (this.fracalScale != was) {
                    this.redraw();
                }
            });
        },
        redraw : function() {
            var display = this.app.app_out;
            display.resizeXYZ(this.displaySize);
            display.modifyEachXYZ((was,pos)=> {
                var fracValue = this.mandelbrot(
                    pos.x*this.fracalScale,
                    pos.y*this.fracalScale,
                    this.maxSteps) / this.maxSteps;
                if ((fracValue == 0))
                    return " ";
                var t = Math.floor(fracValue * this.gradient.length) % this.gradient.length;
                if ((this.displaySize.z - pos.z) > t) return " ";
                return this.gradient[t];
            });
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
        debugUI_HTML : function() {
            var canvas = document.createElement('canvas');
            canvas.width = 160;
            canvas.height = 90;
             

            var controlsBlock = document.createElement("p");
            controlsBlock.appendChild(canvas);
            controlsBlock.appendChild(document.createElement("br"));

            document.body.appendChild(controlsBlock);
            //this.mandelbrotIntoCanvas(canvas, -2, 1, -1, 1, 1000);

            var options = {
                xmin : 0.1,// -2,
                xmax : 0.15,// 1,
                ymin : 0.62, //-1,
                ymax : 0.65,// 1,
                iterations : 150,
                stepSize : 3,
            };

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

