
var lewdo_values = {
    create : function(app,includedValuesArray) {
        var values = Object.create(lewdo_values.lewdo_values_prototype);
        values.setup(app || lewdo.app(),includedValuesArray);
        return values;
    },
    app : function(_app,includedValuesArray) {
        var values = lewdo_values.create(_app,includedValuesArray);
        return values;
    },
    demo : function(_app) {
        var values = lewdo_values.app(_app);
        values.newKeyString = "\n";
        values.add("One");
        values.add(1);
        values.add(null);
        var testObj = { x:5 };
        values.add(testObj);
        var prop = values.addProperty(testObj, "x");
        var test = values.addProperty(testObj, "x");
        console.assert( prop === test );
        values.redraw();
        return values;
    },
    compareNumbers:((a,b)=>((a==b)?0:((a<b)?-1:1))),
    categories : {
        "undefined":{
            order:0,
            name:"undefined",
            compare:((a,b)=>0),
            stringify:((a)=>"undefined"),
        },
        "null":{
            order:1,
            name:"null",
            compare:((a,b)=>0),
            stringify:((a)=>"null"),
        },
        "number":{
            order:2,
            name:"number",
            compare:((a,b)=>((a==b)?0:((a<b)?-1:1))),
            stringify:((a)=>(""+a)),
        },
        "string":{
            order:3,
            name:"string",
            compare:((a,b)=>(a.localeCompare(b))),
            stringify:((a)=>a),
        },
        "unknown":{
            order:4,
            name:"unknown",
            isUnknownValue:true,
            stringify:((a)=>"?"),
            stringifyInfo:((a)=>("?"+a.index)),
            compare:((a,b)=>((a===b)?0:1)),
            compareInfo:((a,b)=>(
                ((a.value===b.value)?0:(
                    (a.index<b.index)?-1:1
                ))
            )),
        },
        "object":{
            order:5,
            name:"object",
            stringify:((a)=>"@"),
            stringifyInfo:((a)=>("@"+a.index)),
            compare:((a,b)=>{
                if (a===b) return 0;
                if (a.compareTo) {
                    return a.compareTo(b);
                }
                return 1;
            }),
            compareInfo:((a,b)=>(
                ((a.value===b.value)?0:(
                    (a.index<b.index)?-1:1
                ))
            )),
        },
        "property":{
            order:6,
            name:"property",
            isProperty:true,
            stringify:((a)=>{
                return a.objectInfo.toString() + "." + a.indexInfo.toString();
            }),
            compare:((a,b)=>{
                var c = a.objectInfo.compareTo(b.objectInfo);
                if (c != 0) return c;
                return a.indexInfo.compareTo(b.indexInfo);
            }),
            compareInfo:((a,b)=>(
                ((a.value===b.value)?0:(
                    (a.index<b.index)?-1:1
                ))
            )),
            PropertyPrototype : {
                objectInfo:null,
                indexInfo:null,
            },
        },
        "function":{
            order:7,
            name:"function",
            stringify:((a)=>"..()"),
            compare:((a,b)=>((a===b)?0:1)),
            compareInfo:((a,b)=>(
                ((a.value===b.value)?0:(
                    (a.index<b.index)?-1:1
                ))
            )),
        },
    },
    categoryOf : function(val) {
        if (val===undefined) return lewdo_values.categories["undefined"];
        if (val===null) return lewdo_values.categories["null"];
        var tp = (typeof val);
        if (tp=="object") {
            if ("isUnknownValue" in val)
                return lewdo_values.categories.unknown;
        }
        if (tp in lewdo_values.categories)
            return lewdo_values.categories[tp];
        throw new "Unknown value category: '" + tp + "'";
    },
    lewdo_values_prototype : {
        app : lewdo_app(),
        valueInfoByIndex : [],
        newKeyString : "\n", // "\v"
        length : 0,

        add : function(val) {
            return this._ensureInfo( this.createInfo(val) );
        },

        addProperty : function(obj,ndx) {
            return this._ensureInfo( this.createInfoProperty(obj,ndx) );
        },

        addUnknown : function() {
            var coreValue = { isUnknownValue:true };
            var i = this.createInfo(coreValue);
            i.category = lewdo_values.categories.unknown;
            coreValue.unknownInfo = i;
            return this._ensureInfo(i);
        },

        setup : function(_app,valuesArray) {
            this.app = _app;
            this.valueInfoByIndex = [];
            var skipFirst = true;
            var _this = this;
            this.app.app_in.subscribe((input)=>{
                if (skipFirst) {
                    skipFirst = false;
                    return;
                }
                var val = input.toString();
                _this.add(val);
                _this.redraw();
            });
            if (valuesArray) {
                for (var i in valuesArray) {
                    this.add(valuesArray[i]);
                }
            }
        },

        _ensureInfo : function(info) {
            if (info.hasIndex)
                return info;

            var existing = this.tryFindInfoByInfo(info);
            if (existing)
                return existing;

            // adding to known set:
            if (info.category.isProperty) {
                info.value.objectInfo = this._ensureInfo(info.value.objectInfo);
                info.value.indexInfo = this._ensureInfo(info.value.indexInfo);
            }
            info.index = this.valueInfoByIndex.length;
            this.valueInfoByIndex.push(info);
            this.length = this.valueInfoByIndex.length;
            info.hasIndex = true;
            return info;
        },

        redraw : function() {
            var str = "";
            var vals = this.valueInfoByIndex;
            for (var i=0; i<vals.length; i++) {
                if (i!=0) str += this.newKeyString;
                str += vals[i].asString();
            }
            this.app.app_out.copy( lewdo.string3(str) );
            this.app.app_out.frameStep();
        },

        tryFindInfoByInfo : function(other) {
            var data = this.valueInfoByIndex;
            for (var i=0; i<data.length; i++) {
                var info = this.valueInfoByIndex[i];
                var cmp = info.compareTo(other);
                if (cmp == 0)
                    return info;
                // TODO: use comparison to look left/right
            }
            return undefined;
        },

        tryFindInfoByValue : function(val) {
            return this.tryFindInfoByInfo( this.createInfo( val ) );
        },

        tryFindInfoByProperty : function(obj,ndx) {
            return this.tryFindInfoByInfo( this.createInfoProperty( obj, ndx ) );
        },

        createInfo : function(val) {
            var info = Object.create( this.value_prototype );
            info.value = val;
            info.hasIndex = false;
            info.category = lewdo_values.categoryOf(val);
            console.assert(info.category);
            return info;
        },

        createInfoProperty : function(obj,ndx) {
            var core = Object.create( this._property_prototype );
            core.objectInfo = this.createInfo(obj);
            core.indexInfo = this.createInfo(ndx);
            var result = this.createInfo( core );
            result.category = lewdo_values.categories.property;
            return result;
        },

        _property_prototype : {
            objectInfo : null,
            indexInfo : null,
        },


        sort : function() {
            this.valueInfoByIndex.sort((a,b)=>(a.compareTo(b)));
            var vals = this.valueInfoByIndex;
            for (var i=0; i<vals.length; i++) {
                vals[i].index = i;
            }
        },

        value_prototype : {
            value : undefined,
            category : undefined,
            index : undefined,

            compareTo : function(other) {
                if (this.category === other.category) {
                    if (this.category.compareInfo) {
                        return this.category.compareInfo(this,other);
                    }
                    return this.category.compare(this.value,other.value);
                }
                return lewdo_values.compareNumbers(this.category.order, other.category.order);
            },
            asString : function() {
                if (this.category.stringifyInfo)
                    return this.category.stringifyInfo(this);
                return this.category.stringify(this.value);
            },
            toString : function() {
                return this.asString();
            },
        },

        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.values = lewdo_values.app;
//lewdo.apps.tools.values = lewdo_values.demo;




