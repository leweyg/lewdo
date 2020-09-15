
var lewdo_code = {
    create : function(app) {
        var context = Object.create( lewdo_code.lewdo_code_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_code.create(_app);
        return context;
    },
    demo : function(_app) {
        var code = lewdo_code.app(_app);

        var demoMode = "helloWorld"; // iterator // simple
        switch (demoMode) {
            case "simple":{
                code.addWrite("opcode","add");
                code.addWrite("opcode","mult");
            }
            break;
            case "iterator":{
                var state = code.addProxyObject();
                state.x = 0;
                state.y = 0;
                for (state.i=0; state.i<9; state.i = state.i+1) {
                    state.x = state.i % 3;
                    state.y = Math.floor( state.i / 3 );
                }
            }
            break;
            case "helloWorld":{
                
                var func = code.addProxyObject();
                code.addWrite("helloWorld",func);

                var appVal = code.addProxyValue();
                func.app = appVal;
                appVal.app_in.subscribe;
                //appVal.app_in.subscribe;
                


            }
            break;
        }

        code.redraw();

        return code;
    },
    ActionsByName : {
        "read":{name:"read",short:"r"},
        "read.":{name:"read property",isOffset:true,short:"r."},
        "write":{name:"write",isWrite:true,short:"w"},
        "write.":{name:"write.",isOffset:true,isWrite:true,short:"w."},
    },
    _code_op_prototype : {
        action:null,
        addressInfo:null,
        valueInfo:null,
        timeInfo:null,
    },
    _timestep_prototype : {
        index : 0,
        valueInfo : null,
        opsInThisTime : [],
        opsByAddr : {},

        compareTo : function(other) {
            if (this.index == other.index) return 0;
            return ((this.index < other.index) ? -1 : 1);
        },
    },
    _codeProxyObject_prototype : {
        code_owner : null,
        wrappedObject : {},
        proxy : null,
        setupProxy : function(code_host) {
            this.code_owner = code_host;
            this.wrappedObject = {};
            this.proxy = new Proxy( this, lewdo_code._codeProxyObjectHandler );
            return this.proxy;
        },
    },
    _codeProxyObjectHandler : {
        set: function(target, prop, value) {
            target.wrappedObject[prop] = value;
            target.code_owner.addWriteOffset(target.proxy,prop,value);
        },
        get: function(target, prop, receiver) {
            var val = target.wrappedObject[prop];
            target.code_owner.addReadOffset(target.proxy,prop,val);
            return val;
        },
        has: function(target,prop) {
            return (prop in target.wrappedObject);
        },
    },
    _codeProxyValue_prototype : {
        code_owner : null,
        wrappedObject : {},
        wrappedValue : null,
        proxy : null,
        setupProxy : function(code_host) {
            this.code_owner = code_host;
            this.wrappedObject = {},
            this.wrappedValue = this.code_owner.values.addUnknown();
            this.proxy = new Proxy( this, lewdo_code._codeProxyValueHandler );
            return this.proxy;
        }
    },
    _codeProxyValueHandler : {
        set: function(target, prop, value) {
            target.wrappedObject[prop] = value;
            target.code_owner.addWriteOffset(target.proxy,prop,value);
        },
        get: function(target, prop, receiver) {
            if (prop in target.wrappedObject) {
                var val = target.wrappedObject[prop];
                target.code_owner.addReadOffset(target.proxy,prop,val);
                return val;
            }
            var gottenValue = target.code_owner.addProxyValue();
            target.wrappedObject[prop] = gottenValue;
            target.code_owner.addReadOffset(target.proxy,prop,gottenValue);
            return gottenValue;
        },
        has: function(target,prop) {
            if (prop == "isUnknownValue") return true;
            return (prop in target.wrappedObject);
        },
    },
    lewdo_code_prototype : {
        app : lewdo.app(),
        opsByIndex : [],

        values : lewdo.apps.shapes.values(),
        addresses : lewdo.apps.shapes.values(),
        visualLayout : { values:{}, addresses:{}, times:{} },
        times : lewdo.apps.shapes.values(),
        currentTime : null,

        addProxyObject : function() {
            var target = Object.create( lewdo_code._codeProxyObject_prototype );
            return target.setupProxy(this);
        },

        addProxyValue : function() {
            var target = Object.create( lewdo_code._codeProxyValue_prototype );
            return target.setupProxy(this);
        },

        addReadOffset : function (addr,indx,val) {
            this._addOp("read.",addr,val,true,indx);
        },
        
        addRead : function (addr,val) {
            this._addOp("read",addr,val);
        },

        addWriteOffset : function (addr,indx,val) {
            this._addOp("write.",addr,val,true,indx);
        },
        
        addWrite : function (addr,val) {
            this._addOp("write",addr,val);
        },

        addTime : function() {
            var step = Object.create( lewdo_code._timestep_prototype );
            step.opsInThisTime = [];
            step.index = this.times.length;
            step.valueInfo = this.times.add(step);
            step.opsByAddr = {};
            this.currentTime = step;
            return step;
        },


        _addOp : function(actionName,addr1,val,isIndex,indx) {
            var op = Object.create( lewdo_code._code_op_prototype );
            op.action = lewdo_code.ActionsByName[actionName];
            var oldAddressCount = this.addresses.length;
            op.addressInfo = ( isIndex ? 
                ( this.addresses.addProperty(addr1,indx) ) : 
                ( this.addresses.add(addr1) ) );
            if ((op.action.isWrite) && (this.currentTime)
                && (op.addressInfo in this.currentTime.opsByAddr)) {
                this.addTime();
            }
            op.valueInfo = this.values.add(val);
            if (!this.currentTime) {
                this.addTime();
            }
            op.timeInfo = this.currentTime.valueInfo;
            op.timeInfo.value.opsInThisTime.push( op );
            op.timeInfo.value.opsByAddr[op.addressInfo] = op;
            op.index = this.opsByIndex.length;
            this.opsByIndex.push(op);
            return op;
        },

        maxToStringLength : function(values) {
            var maxLength = 0;
            for (var i in values.valueInfoByIndex) {
                var len = values.valueInfoByIndex[i].toString().length;
                if (len > maxLength) maxLength = len;
            }
            return maxLength;
        },

        redraw : function() {
            var addrWidth = this.maxToStringLength(this.addresses)+1;
            var wordWidth = this.maxToStringLength(this.values);

            var to = this.app.app_out;
            to._outOfBoundsWarnings = false;
            to.resize( 
                ( this.times.length * wordWidth ) + addrWidth,
                this.addresses.length,
                Math.max( this.values.length, this.addresses.length )
                );

            // First recalculate the usage indices:
            var viz = this.visualLayout;
            viz.values.clear();
            viz.addresses.clear();
            viz.times.clear();
            this.opsByIndex.forEach(op => {
                if (op.addressInfo.category.isProperty) {
                    var prop = op.addressInfo.value;
                    viz.values.add( prop.objectInfo );
                    viz.values.add( prop.indexInfo );
                } else {
                    viz.values.add( op.addressInfo );
                }
                viz.addresses.add( op.addressInfo );
                viz.values.add( op.valueInfo );
                viz.times.add( op.timeInfo );
            });


            var pos = lewdo.xyz();
            for (var opIndex in this.opsByIndex) {
                var op = this.opsByIndex[opIndex];
                pos.x = ( viz.times.find( op.timeInfo ).index * wordWidth ) + addrWidth;
                pos.y = viz.addresses.find( op.addressInfo ).index;
                pos.z = viz.values.find( op.valueInfo ).index;

                var str = op.valueInfo.toString();
                to.drawStringXYZ(str,pos);

                if (!op.addressInfo.category.isProperty) {
                    var strAddr = op.addressInfo.toString();
                    pos.x = 0;
                    pos.z = viz.addresses.find( op.addressInfo ).index;
                    to.drawStringXYZ(strAddr,pos);
                } else {
                    var objInfo = op.addressInfo.value.objectInfo;
                    var strAddr = objInfo.toString() + ".";
                    pos.x = 0;
                    pos.z = viz.values.find( objInfo ).index;
                    to.drawStringXYZ(strAddr,pos);

                    pos.x += strAddr.length;
                    var offsetInfo = op.addressInfo.value.indexInfo;
                    pos.z = viz.values.find( offsetInfo ).index;
                    strAddr = offsetInfo.toString();
                    to.drawStringXYZ(strAddr,pos);
                }
            }

            to.frameStep();
        },

        setup : function(_app,valuesArray) {
            this.app = _app;
            this.opsByIndex = [];
            this.values = lewdo.apps.shapes.values(),
            this.addresses = this.values;// share these: lewdo.apps.shapes.values(),
            this.times = lewdo.apps.shapes.values(),
            this.visualLayout = {
                values : lewdo.apps.shapes.values(),
                addresses : lewdo.apps.shapes.values(),
                times : lewdo.apps.shapes.values(),
            };

            this.redraw();
        },


        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.code = lewdo_code.app;
lewdo.apps.tools.code = lewdo_code.demo;






