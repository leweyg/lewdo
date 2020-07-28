
var string3_prototype = {
    array1d : "",
    width : 0,
    height : 0,
    depth : 0,

    setSize : function(w,h,d,fill) {
        this.width = w;
        this.height = h;
        this.depth = d;
        this.array1d = string3_utils.repeat_array(fill?fill:":", w * h * d);
        return this;
    },
    resize : function(w,h,d,fill) {
        return this.setSize(w,h,d,fill);
    },
    indexFromXYZ : function(x,y,z) {
        return (x + (y * this.width) + (z * this.width * this.height));
    },
    visitEach : function(cb) {
        for (var d=0; d<this.depth; d++) {
            for (var h=0; h<this.height; h++) {
                for (var w=0; w<this.width; w++) {
                    var let = this.array1d[this.indexFromXYZ(w,h,d)];
                    cb(let, w, h, d);
                }
            }
        }
        return this;
    },
    fromString : function(str) {
        return string3_utils.fromString(str);
    },
    toHTML : function() {
        var ans = "<div><p><pre><code>";
        var x=0, y=0, z=0;
        this.visitEach((c,fx,fy,fz) => { 
            if (z != fz) {

                ans += "\n--layer--\n";

                z = fz;
                y = fy;
            }
            else if (y != fy) {
                ans += "\n";
                y = fy;
            }
            ans += c; 
        });
        ans += "</code></pre></p></div>";
        

        ans += "<div class='page_top' onmousemove='string3_ui.onMouseMoveTop(event,this)' >";
        x=-1; y=-1; z=-1;
        for (var fz=this.depth-1; fz>=0; fz--) {
            var clr = (fz == 0) ? 'black' : 'lightgray';

            ans += "<div class='page_slice' data-zdepth=" + fz + " style='color:" + clr + "' ><p><pre><code>";
            for (var fy=0; fy<this.height; fy++) {
                for (var fx=0; fx<this.width; fx++) {
                    var c = this.array1d[this.indexFromXYZ(fx,fy,fz)];
                    ans += c;
                }
                ans += "<br/>";
            }
            ans += "</code></pre></p></div>";
        }
        ans += "</div>";
        for (var fy=0; fy<this.height; fy++) {
            ans += "<br/><br/>";
        }
        
        return ans;
    },
    
};

var string3_utils = {
    xyz : function(x,y,z) {
        return { x:x, y:y, z:z };
    },
    repeat_array : function(c,n) {
        var ans = [];
        for (var i=0; i<n; i++) {
            ans.push(c);
        }
        return ans;
    },
    arrayFromString : function(str) {
        var ans = [];
        for (var i=0; i<str.length; i++) {
            ans.push(str[i]);
        }
        return ans;
    },
    max2 : function(a,b) {
        a *= 1;
        b *= 1;
        return ((a > b) ? a : b);
    },
    fromString : function(text) {
        var page_lines = string3_utils.split_page_lines(text);
        var size = string3_utils.max_page_lines(page_lines);
        var ans = string3().resize( size.x, size.y, size.z, ":" );
        for (var pi=0; pi<page_lines.length; pi++) {
            var pages = page_lines[pi];
            for (var li=0; li<pages.length; li++) {
                var line = pages[li];
                for (var ci=0; ci<line.length; ci++) {
                    var c = line[ci];
                    var to = ans.indexFromXYZ(ci,li,pi);
                    ans.array1d[to] = c;
                    //var test = ans.array1d[to];
                    //console.log(test);
                }
            }
        }
        return ans;
    },
    max_page_lines : function(page_lines) {
        var ans = string3_utils.xyz(0,0,0);
        for (var page_i in page_lines) {
            ans.z = string3_utils.max2(ans.z, page_i*1 + 1);
            var page = page_lines[page_i];
            for (var line_i in page) {
                ans.y = string3_utils.max2(ans.y, line_i*1 + 1);
                var line = page[line_i];
                ans.x = string3_utils.max2(ans.x, line.length);
            }
        }
        return ans;
    },
    split_page_lines : function(str) {
        var pages = str.split("\v");
        for (var d=0; d<pages.length; d++) {
            var from = pages[d];
            var lines = from.split("\n");
            for (var l=0; l<lines.length; l++) {
                var line = lines[l];
                line = string3_utils.arrayFromString(line);
                lines[l] = line;
            }
            pages[d] = lines;
        }
        return pages;
    },
};
function string3(initial,w,h,d) {
    var ans = Object.create(string3_prototype);
    if (initial) {
        if (typeof(initial) == "string") {
            ans = ans.fromString(initial);
            if (!w) {
                return ans;
            }
            ans = ans.resize(w, h, d);
            return ans;
        }
    }
    ans = ans.resize(w, h, d);
    return ans;
}

var string3_ui = {
    topChildren : {},
    onMouseMoveTop : function(event,element) {
        var layers = this.topChildren[element];
        if (!layers) {
            layers = document.getElementsByClassName('page_slice');
            this.topChildren[element] = layers;
        }
        var centerX = 150; // hack
        var centerY = 50; //hack
        var scl = -0.1;
        var dx = ((event.offsetX - centerX) * scl);
        var dy = ((event.offsetY - centerY) * scl);
        for (var i=0; i<layers.length; i++) {
            var el = layers[i];
            el.style.left = (dx * el.dataset.zdepth ) + "px";
            el.style.top = (dy * el.dataset.zdepth ) + "px";
        }
    },
};