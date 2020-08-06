
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
    _outOfBoundsWarnings : function(pos){
        throw "out of bounds:" + pos;
    },
    _catchFrameExceptions : false,

    copy : function(other) {
        this.width = other.width;
        this.height = other.height;
        this.depth = other.depth;
        this.array1d = [];
        for (var i=0; i<other.array1d.length; i++) {
            this.array1d[i] = other.array1d[i];
        }
        if (other.offset) {
            if (!this.offset) this.offset = string3_utils.xyz();
            this.offset.copy(other.offset);
        }
        if (other.scroll) {
            if (!this.scroll) this.scroll = string3_utils.xyz();
            this.scroll.copy(other.scroll);
        }
        return this;
    },
    frameStep : function() {
        this.frame = this.frame + 1;
        for (var si in this.subscribers) {
            var sub = this.subscribers[si];
            if (!this._catchFrameExceptions) {
                sub(this);
            } else {
                try {
                    sub(this);
                } catch (ex) { console.log(ex); }
            }
        }
    },
    subscribe : function(callback) {
        this.subscribers.push(callback);
        callback(this);
    },
    setSize : function(w,h,d,fill) {
        this.width = w || 0;
        this.height = h || 0;
        this.depth = d || 0;
        if (!fill) fill = " ";
        var count = (this.width * this.height * this.depth);
        if (!this.array1d || count != this.array1d.length) {
            this.array1d = string3_utils.repeat_array(fill, count);
        } else {
            for (var i=0; i<count; i++) {
                this.array1d[i] = fill;
            }
        }
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
    isEdgeXYZ : function(v) {
        return ( true
            || ((v.x == 0) || (v.x == this.width-1))
            || ((v.y == 0) || (v.y == this.height-1))
            || ((v.z == 0) || (v.z == this.depth-1))
        );
    },
    
    getByXYZ : function(xyz) {
        if (this.isValidXYZ(xyz)) {
            var i = this.indexFromXYZ(xyz);
            var val = this.array1d[i];
            return val;
        } else if (this._outOfBoundsWarnings) {
            this._outOfBoundsWarnings(xyz);
        }
    },
    setByXYZ : function(val, xyz) {
        if (this.isValidXYZ(xyz)) {
            var i = this.indexFromXYZ(xyz);
            this.array1d[i] = val;
        } else if (this._outOfBoundsWarnings) {
            this._outOfBoundsWarnings(xyz);
        }
    },
    _setBySeperateXYZ : null,
    setBySeperateXYZ : function(val, x,y,z) {
        if (!string3._setBySeperateXYZ) {
            string3._setBySeperateXYZ = string3_utils.xyz();
        }
        var t = string3._setBySeperateXYZ;
        t.set(x,y,z);
        this.setByXYZ(val,t);
    },
    getBySeperateXYZ : function(x,y,z) {
        var i = this.indexFromSeperateXYZ(x,y,z);
        return this.array1d[i];
    },
    drawRangeXYZ : function(val, vFrom, vTo) {
        var t = string3_utils._tempVec1;
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
    sizeXYZ : function() {
        return string3_utils.xyz(this.width,this.height,this.depth);
    },
    subString3XYZ : function(start,end) {
        end = ( end || this.sizeXYZ() );
        var ans = string3();
        ans.resize(end.x-start.x, end.y-start.y, end.z-start.z);
        ans.visitEach((older,x,y,z) => {
            var v = this.getBySeperateXYZ(x+start.x,y+start.y,z+start.z);
            ans.setBySeperateXYZ(v,x,y,z);
        });
        return ans;
    },
    drawString3XYZ : function(other,xyz) {
        xyz = ( xyz || string3_utils._xyz_zero );
        var f = string3_utils._tempVec1;
        var t = string3_utils._tempVec2;
        for (var d=0; d<other.depth; d++) {
            f.z = d;
            t.z = (d + xyz.z);
            for (var h=0; h<other.height; h++) {
                f.y = h;
                t.y = (h + xyz.y);
                for (var w=0; w<other.width; w++) {
                    f.x = w;
                    t.x = (w + xyz.x);
                    var val = other.getByXYZ(f);
                    this.setByXYZ(val, t);
                }
            }
        }
    },
    drawTextXYZ : function(text,xyz) {
        string3_utils.drawString(this, text, xyz);
    },
    clear : function(fill) {
        fill = ( fill || " " );
        var c = this.array1d.length;
        for (var i=0; i<c; i++)  {
            this.array1d[i] = fill;
        }
    },
    clearPlane : function(plane,val) {
        var t = string3_utils._tempVec1;
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
    visitEachXYZ : function(cb) {
        var t = string3_utils.xyz(); // TODO: recycle this
        for (var d=0; d<this.depth; d++) {
            for (var h=0; h<this.height; h++) {
                for (var w=0; w<this.width; w++) {
                    var let = this.array1d[this.indexFromSeperateXYZ(w,h,d)];
                    t.set(w,h,d);
                    cb(let, t);
                }
            }
        }
        return this;
    },
    modifyEachXYZ : function(cb) {
        var t = string3_utils.xyz(); // TODO: recycle this
        for (var d=0; d<this.depth; d++) {
            for (var h=0; h<this.height; h++) {
                for (var w=0; w<this.width; w++) {
                    var index = this.indexFromSeperateXYZ(w,h,d);
                    var letter = this.array1d[index];
                    t.set(w,h,d);
                    var v = cb(letter, t);
                    this.array1d[index] = v;
                }
            }
        }
        return this;
    },
    fromString : function(str) {
        return this.copy( string3_utils.fromString(str) );
    },
    toHTML : function() {
        return string3_ui.toHTML(this);
    },
    toString : function() {
        return string3_utils.toString(this);
    },
    
};

var string3_utils = {
    _xyz_zero : null, // xyz()
    _tempVec1 : null, // xyz()
    _tempVec2 : null, // xyz()
    _internal_setup : function() {
        string3_utils._tempVec1 = string3_utils.xyz();
        string3_utils._tempVec2 = string3_utils.xyz();
        string3_utils._xyz_zero = string3_utils.xyz();
    },
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
            return this;
        },
        copy : function(other) {
            this.set(other.x, other.y, other.z);
            return this;
        },
        add : function(other) {
            this.set( this.x + other.x, this.y + other.y, this.z + other.z );
        },
        isZero : function() {
            return ((this.x==0)&&(this.y==0)&&(this.z==0));
        },
        clone : function() {
            return string3_utils.xyz(this.x, this.y, this.z);
        },
        toZero : function() {
            this.set(0,0,0);
            return this;
        },
        select : function(foo) {
            return this.set(foo(this.x),foo(this.y),foo(this.z));
        },
        select2 : function(other,foo) {
            return this.set(foo(this.x,other.x),foo(this.y,other.y),foo(this.z,other.z));
        },
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
    toString : function(str3) {
        var ans = "";
        var index = 0;
        for (var d=0; d<str3.depth; d++) {
            if (d != 0)
                    ans += "\v";
            for (var h=0; h<str3.height; h++) {
                if (h != 0)
                    ans += "\n";
                for (var w=0; w<str3.width; w++) {
                    ans += str3.array1d[ index ];
                    index++;
                }
            }
        }
        return ans;
    },
    visitEachXYZ : function(str3,callback) {
        if (!str3.visitEachXYZ) str3.visitEachXYZ = string3_prototype.visitEachXYZ;
        return str3.visitEachXYZ(callback);
    },
    indexFromXYZ : function(str3,xyz) {
        if (!str3.indexFromXYZ) str3.indexFromXYZ = string3_prototype.indexFromXYZ;
        if (!str3.indexFromSeperateXYZ) str3.indexFromSeperateXYZ = string3_prototype.indexFromSeperateXYZ;
        return str3.indexFromXYZ(xyz);
    },
    visitEachXYOnZ : function(str3,z,callback) {
        var t = string3_utils.xyz();
        for (var x=0; x<str3.width; x++) {
            t.x = x;
            for (var y=0; y<str3.height;y++) {
                t.y = y;
                t.z = z;
                var i = string3_utils.indexFromXYZ(str3,t);
                var v = str3.array1d[i];
                callback(v,t);
            }
        }
    },
    fromString : function(text) {
        var page_lines = string3_utils.split_page_lines(text);
        var size = string3_utils.max_page_lines(page_lines);
        var ans = string3().resize( size.x, size.y, size.z, " " );
        string3_utils.drawString(ans, page_lines);
        return ans;
    },
    
    drawString : function(onto,text,offset) {
        var page_lines = text;
        if (typeof(text) == "string")
            page_lines = string3_utils.split_page_lines(text);
        var t = this._tempVec1;
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

string3_utils._internal_setup();



