
var lewdo_values = {
    create : function(app,values) {
        var values = Object.create(lewdo_values.lewdo_values_prototype);
        values.setup(app || lewdo.app(),values);
        return values;
    },
    app : function(_app,values) {
        var values = lewdo_values.create(_app);
        return values;
    },
    demo : function(_app) {
        var values = lewdo_values.app(_app);
        values.newKeyString = "\n";
        values.add("One");
        values.add(1);
        values.add(null);
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
        "Object":{
            order:4,
            name:"Object",
            compare:((a,b)=>((a===b)?0:1)),
            stringify:((a)=>"*"),
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
        if (tp in lewdo_values.categories) return lewdo_values.categories[tp];
        throw new "Unknown value category: '" + tp + "'";
    },
    lewdo_values_prototype : {
        app : lewdo_app(),
        valueInfoByIndex : [],
        newKeyString : "\n", // "\v"

        add : function(val) {
            var info = this.tryFindInfoByValue(val);
            if (info) return info;
            info = this.createInfo(val);
            info.index = this.valueInfoByIndex.length;
            this.valueInfoByIndex.push(info);
            return info;
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

        createInfo : function(val) {
            var info = Object.create( this.value_prototype );
            info.value = val;
            info.category = lewdo_values.categoryOf(val);
            return info;
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
                    return this.category.compare(this.value,other.value);
                }
                return lewdo_values.compareNumbers(this.category.order, other.category.order);
            },
            asString : function() {
                return this.category.stringify(this.value);
            },
        },

        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.values = lewdo_values.app;
//lewdo.apps.tools.values = lewdo_values.demo;




