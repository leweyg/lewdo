
function string3(initial,w,h,d) {
    var ans = Object.create(string3_prototype);
    ans.subscribers = []; 
    if (initial) {
        if (typeof(initial) == "string") {
            ans = ans.fromString(initial);
            if (!w) {
                return ans;
            }
            ans = ans.resize(w, h, d);
            return ans;
        }
    } else if (!w) {
        w = 0;
        h = 0;
        d = 0;
    }
    ans = ans.resize(w, h, d);
    return ans;
}

var string3_prototype = {
    array1d : "",
    width : 0,
    height : 0,
    depth : 0,
    frame : 0,
    subscribers : [],

    stepFrame : function() {
        this.frame = this.frame + 1;
        for (var si in this.subscribers) {
            var sub = this.subscribers[si];
            try {
                sub();
            } catch (ex) {
                console.log(ex);
            }
        }
    },
    subscribe : function(callback) {
        this.subscribers.push(callback);
    },
    setSize : function(w,h,d,fill) {
        if (w) this.width = w;
        if (h) this.height = h;
        if (d) this.depth = d;
        this.array1d = string3_utils.repeat_array(fill?fill:":", w * h * d);
        return this;
    },
    resize : function(w,h,d,fill) {
        return this.setSize(w,h,d,fill);
    },
    indexFromSeperateXYZ : function(x,y,z) {
        var ix = (x * 1);
        var iy = (y * this.width);
        var iz = (z * this.width * this.height);
        var i = ix + iy + iz;
        return i;
    },
    indexFromXYZ : function(v) {
        return this.indexFromSeperateXYZ(v.x,v.y,v.z);
    },
    isValidXYZ : function(v) {
        return ( true
            && ((v.x >= 0) && (v.x < this.width))
            && ((v.y >= 0) && (v.y < this.height))
            && ((v.z >= 0) && (v.z < this.depth))
        );
    },
    setByXYZ : function(val, xyz) {
        if (this.isValidXYZ(xyz)) {
            var i = this.indexFromXYZ(xyz);
            this.array1d[i] = val;
        }
    },
    _tempVec_data1 : null,
    _tempVec1 : function() {
        var t = string3_prototype._tempVec_data1;
        if (!t) {
            string3_prototype._tempVec_data1 = string3_utils.xyz();
            t = string3_prototype._tempVec_data1;
        }
        return t;
    },
    drawRangeXYZ : function(val, vFrom, vTo) {
        var t = this._tempVec1();
        for (var d=0; d<(vTo.z-vFrom.z); d++) {
            t.z = (vFrom.z + d);
            for (var h=0; h<(vTo.y-vFrom.y); h++) {
                t.y = (vFrom.y + h);
                for (var w=0; w<(vTo.x-vFrom.x); w++) {
                    t.x = (vFrom.x + w);
                    this.setByXYZ(val, t);
                }
            }
        }
    },
    drawTextXYZ : function(text,xyz) {
        string3_utils.drawString(this, text, xyz);
    },
    clearPlane : function(plane,val) {
        var t = this._tempVec1();
        t.z = plane;
        for (var h=0; h<this.height; h++) {
            t.y = h;
            for (var w=0; w<this.width; w++) {
                t.x = w;
                this.setByXYZ(val, t);
            }
        }
    },
    visitEach : function(cb) {
        
        for (var d=0; d<this.depth; d++) {
            for (var h=0; h<this.height; h++) {
                for (var w=0; w<this.width; w++) {
                    var let = this.array1d[this.indexFromSeperateXYZ(w,h,d)];
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
        return string3_ui.toHTML(this);
    },
    
};

var string3_utils = {
    xyz : function(x,y,z) {
        var ans = Object.create( string3_utils._xyz_prototype );
        ans.setIf(x,y,z);
        return ans;
    },
    _xyz_prototype : {
        x : 0, y : 0, z : 0,
        setIf : function(_x,_y,_z) {
            if (_x) this.x = _x;
            if (_y) this.y = _y;
            if (_z) this.z = _z;
        },
        set : function(_x,_y,_z) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
        },
        toZero : function() {
            this.set(0,0,0);
        }
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
        string3_utils.drawString(ans, page_lines);
        return ans;
    },
    _tempVec_data1 : null,
    _tempVec1 : function() {
        if (this._tempVec_data1)
            return this._tempVec_data1;
        this._tempVec_data1 = string3_utils.xyz();
        return this._tempVec_data1;
    },
    drawString : function(onto,text,offset) {
        var page_lines = text;
        if (typeof(text) == "string")
            page_lines = string3_utils.split_page_lines(text);
        var t = this._tempVec1();
        for (var pi=0; pi<page_lines.length; pi++) {
            var pages = page_lines[pi];
            t.z = pi + ((offset && offset.z) ? offset.z : 0);
            for (var li=0; li<pages.length; li++) {
                var line = pages[li];
                t.y = li + ((offset && offset.y) ? offset.y : 0);
                for (var ci=0; ci<line.length; ci++) {
                    var c = line[ci];
                    t.x = ci + ((offset && offset.x) ? offset.x : 0);
                    onto.setByXYZ(c, t);
                }
            }
        }
        return onto;
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

var string3_ui = {
    topChildren : {},
    setInnerString3 : function(parent,str3) {
        var name = "";
        var html = string3_ui.toHTML(str3, function(elName){name = elName;});
        parent.innerHTML = html;
        var element = document.getElementById(name);
        string3_ui._setup_element(element);
        return element;
    },
    toHTML : function(str3, nameGetter) {
        var ans = "";  
        var myname = "string3_element_" + (string3_ui._global_elementCount++);
        if (nameGetter) nameGetter(myname);

        var events = " onmousemove='string3_ui.onMouseMoveTop(event,this)' "; 
        ans += "<div id='" + myname + "' class='page_top' " + events + " >";
        x=-1; y=-1; z=-1;
        for (var fz=str3.depth-1; fz>=0; fz--) {
            var clr = (fz == 0) ? 'black' : 'lightgray';

            ans += "<div class='page_slice' data-zdepth=" + fz + " style='color:" + clr + "' ><p><pre><code>";
            for (var fy=0; fy<str3.height; fy++) {
                for (var fx=0; fx<str3.width; fx++) {
                    var c = str3.array1d[str3.indexFromSeperateXYZ(fx,fy,fz)];
                    ans += c;
                }
                ans += "<br/>";
            }
            ans += "</code></pre></p></div>";
        }
        ans += "</div>";
        for (var fy=0; fy<str3.height; fy++) {
            ans += "<br/><br/>";
        }
        return ans;
    },
    _setup_element : function(element) {
        document.onkeydown = (event) => { 
            string3_ui.onKeyChange(true,event,element); };
        document.onkeyup = (event) => { 
            string3_ui.onKeyChange(false,event,element); };
    },
    _global_elementCount : 0,
    toHTML_Text : function(str3) {
        var ans = "<div><p><pre><code>";
        var x=0, y=0, z=0;
        str3.visitEach((c,fx,fy,fz) => { 
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
        return ans;
    },
    doAppKeyInput : function(isDown,key) {
        var app = lewdo_this_app;
        app.app_in_reset(1);
        app.app_in.array1d[0] = key;
        app.app_in.stepFrame();
    },
    onKeyChange : function(isDown,event,element) {
        //console.log("Key code=" + event.code + " key=" + event.key + " isDown=" + isDown);
        if (isDown)
            this.doAppKeyInput(isDown,event.key);
    },
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