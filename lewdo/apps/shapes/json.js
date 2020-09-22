
var lewdo_shapes_json = {
    create : function(app) {
        var context = Object.create( lewdo_shapes_json.lewdo_shapes_json_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_shapes_json.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_shapes_json.app(_app);

        var demo_json = "{\"type\":\"json\",\"value\":\"Hello World.\",\"data\":{\"x\":1,\"linear\":true}}";

        context.app.app_in.copy( lewdo.string3( demo_json ) );
        context.app.app_in.frameStep();

        context.skipInputUpdates = true;
        
        return context;
    },
    lewdo_shapes_json_prototype : {
        app : lewdo.app(),
        skipInputUpdates : false,
        catchExceptions : false,
        values : lewdo.apps.shapes.values(),

        _walkRecursive : function(obj,leafCallback,beginCb,keyCallback,endCb,depth=0) {
            if ((!obj) || (typeof(obj) != "object")) {
                if (leafCallback) leafCallback(obj,depth);
                return;
            }
            if (beginCb) beginCb(obj,depth);
            for (var key in obj) {
                var val = obj[key];
                if (keyCallback) keyCallback(key,val,depth);
                this._walkRecursive(val,leafCallback,beginCb,keyCallback,endCb,depth+1);
            }
            if (endCb) endCb(obj);
        },

        _isObject : function(obj) {
            if (obj) {
                var tp = typeof(obj);
                if (tp == "object")
                    return true;
            }
            return false;
        },

        _deepString : function(str,depth) {
            var inner = lewdo.string3( str );
            var result = inner.clone();
            result.resize(inner.width, inner.height, this.values.length);
            result.clear("");
            result.drawString3XYZ( inner, lewdo.xyz(0,0,depth));
            return result;
        },

        objectToString3 : function(obj,assumeValuesConfigured=false) {
            if (!this._isObject(obj)) {
                var inner = lewdo.string3(obj ? obj.toString() : "");
                var result = inner;
                if (assumeValuesConfigured) {
                    var z = this.values.find( obj ).index;
                    result = this._deepString(result,z);
                }
                return result;
            }
            var gridApp = lewdo.apps.shapes.grid();
            var gridIn = gridApp.app.app_in;
            var maxDepth = 0;
            var curDepth = 0;

            var keys = Object.keys(obj);
            var lines = keys.length;

            if (!assumeValuesConfigured) {
                this.values.clear();
                this._walkRecursive(obj,(leaf)=>{
                    this.values.add(leaf);
                },()=>{
                    curDepth++;
                    maxDepth=Math.max(maxDepth,curDepth);
                }, (key,val)=>{
                    this.values.add(key);
                },()=>{curDepth--;});
            }

            gridIn.resize(3,lines,1);
            var pos = lewdo.xyz();
            pos.y = -1;

            for (var key in obj) {
                pos.y++;

                pos.x=0;
                pos.z=0;
                var keyZ = this.values.find( key ).index;
                var deepKey = this._deepString(key,keyZ);
                gridIn.setByXYZ(deepKey,pos);

                pos.x=2;
                var val = obj[key];
                if (this._isObject(val)) {
                    var str3 = this.objectToString3( val, true );
                    pos.z = 0;
                    gridIn.setByXYZ(str3, pos);
                } else {
                    var valZ = this.values.find( val ).index;
                    var str = val.toString();
                    var str3 = this._deepString(str, valZ);
                    gridIn.setByXYZ(str3, pos);
                }
            }

            gridIn.frameStep();
            return gridApp.app.app_out;
        },

        setup : function(_app) {
            this.app = _app;
            var _this = this;
            this.app.app_in.subscribe((input)=>{
                if (_this && _this.skipInputUpdates) return;
                var json = input.toString();
            
                var obj = null;
                if (json == "") {
                    obj = "";
                } else if (this.catchExceptions) {
                    try {
                        obj = JSON.parse( json );
                        
                    } catch (ex) {
                        obj = ex.toString();
                    }
                } else {
                    obj = JSON.parse( json );
                }

                //var codifier = lewdo.apps.shapes.code();
                var into = this.objectToString3(obj);

                _this.app.app_out.copy(into);
                _this.app.app_out.frameStep();
            });
        }
    }
};

lewdo.apps.shapes.json = lewdo_shapes_json.app;
lewdo.apps.tools.json = lewdo_shapes_json.demo;
