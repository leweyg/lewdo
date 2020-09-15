
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

        //code.addWrite("opcode","add");
        //code.addWrite("opcode","mult");
        var state = code.addProxyObject();
        state.x = 0;
        state.y = 0;
        for (state.i=0; state.i<9; state.i++) {
            state.x = state.i % 3;
            state.y = Math.floor( state.i / 3 );
        }

        code.redraw();

        return code;
    },
    ActionsByName : {
        "read":{name:"read"},
        "read.":{name:"read property",isOffset:true},
        "write":{name:"write",isWrite:true},
        "write.":{name:"write.",isOffset:true,isWrite:true},
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

        compareTo : function(other) {
            if (this.index == other.index) return 0;
            return ((this.index < other.index) ? -1 : 1);
        },
    },
    _codeProxyTarget_prototype : {
        code_owner : null,
        wrappedObject : {},
        setupProxy : function(code_host) {
            this.code_owner = code_host;
            this.wrappedObject = {};
        },
    },
    _codeProxyHandler : {
        set: function(target, prop, value) {
            target.wrappedObject[prop] = value;
            target.code_owner.addWriteOffset(target,prop,value);
        },
        get: function(target, prop, receiver) {
            var val = target.wrappedObject[prop];
            target.code_owner.addReadOffset(target,prop,val);
            return val;
        },
    },
    lewdo_code_prototype : {
        app : lewdo.app(),
        opsByIndex : [],

        values : lewdo.apps.shapes.values(),
        addresses : lewdo.apps.shapes.values(),
        times : lewdo.apps.shapes.values(),
        currentTime : null,

        addProxyObject : function() {
            var target = Object.create( lewdo_code._codeProxyTarget_prototype );
            target.setupProxy(this);
            return new Proxy( target, lewdo_code._codeProxyHandler );
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
            if ((op.action.isWrite) && (oldAddressCount==this.addresses.length)) {
                this.addTime();
            }
            op.valueInfo = this.values.add(val);
            if (!this.currentTime) {
                this.addTime();
            }
            op.timeInfo = this.currentTime.valueInfo;
            op.timeInfo.value.opsInThisTime.push( op );
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
            var addrWidth = this.maxToStringLength(this.addresses);
            var wordWidth = this.maxToStringLength(this.values);

            var to = this.app.app_out;
            to.resize( 
                ( this.times.length * wordWidth ) + addrWidth,
                this.addresses.length,
                this.values.length
                );

            var pos = lewdo.xyz();
            for (var opIndex in this.opsByIndex) {
                var op = this.opsByIndex[opIndex];
                pos.x = ( op.timeInfo.index * wordWidth ) + addrWidth;
                pos.y = op.addressInfo.index;
                pos.z = op.valueInfo.index;

                var str = op.valueInfo.toString();
                to.drawStringXYZ(str,pos);

                var strAddr = op.addressInfo.toString();
                pos.x = 0;
                to.drawStringXYZ(strAddr,pos);
            }

            to.frameStep();
        },

        setup : function(_app,valuesArray) {
            this.app = _app;
            this.opsByIndex = [];
            this.values = lewdo.apps.shapes.values(),
            this.addresses = lewdo.apps.shapes.values(),
            this.times = lewdo.apps.shapes.values(),

            this.redraw();
        },


        // end of lewdo_editor_prototype
    },
};


lewdo.apps.shapes.code = lewdo_code.app;
lewdo.apps.tools.code = lewdo_code.demo;






