
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

                //var kernelState = code.addProxyObject();
                var kernelState_stackPtr = code.addProxyObject();
                var kernelState_cmdData = code.addProxyObject();
                var kernelState_cmdIndex = code.addProxyObject();
                var kernelState_cmdOp = code.addProxyObject();

                //var fiberState = code.addProxyValue();
                
                var cmdIndex = code.addProxyValue();
                var cmdData = code.addProxyValue();
                var cmdStack = code.addProxyValue();
                //kernelState.cmdOp = "loading";
                
                //kernelState_stackPtr.getWhole( cmdStack );
                kernelState_cmdData.getWhole( cmdData );
                kernelState_cmdIndex.getWhole( cmdIndex );
                
                //kernelState.context = code.addProxyValue();

                code.addTime();
                var opToDo = cmdData.indexedBy( cmdIndex );
                kernelState_cmdOp.setWhole( opToDo );
                
                
                var nextCmd = code.addPlusOne( cmdIndex );
                code.addTime();
                kernelState_cmdIndex.setWhole( nextCmd );

                code.addTime();

                if (false) {
                    kernelState_stackPtr.getWhole( cmdStack );
                    var len = code.addProxyValue();
                    //cmdStack.length = len;
                    code.addReadOffset(cmdStack,"length",len);

                    var top = code.addPlus( len, -1 );
                    var nextTop = code.addPlus( top, -1 );
                    var a = cmdStack.indexedBy(top);
                    var b = cmdStack.indexedBy(nextTop);
                    var c = code.addPlus(a,b);
                    code.addWriteOffset(cmdStack,nextTop,c);
                    cmdStack.length = top;
                    //code.addWriteOffset(cmdStack,"length",top);

                    /*
                    var isAdding = code.addIsNotEqual(opToDo,"add");
                    //var a = code.addProxyValue();
                    var b = code.addProxyValue();
                    code.addExecuteOffsetOut(cmdStack,"pop",b);
                    code.addTime();
                    var c = code.addPlus(a,b);
                    code.addExecuteOffsetIn(cmdStack,"push",c);
                    */
                    //code.addWrite(a,b);
                }
                
                if (false) {
                    kernelState_stackPtr.getWhole( cmdStack );
                    var isAdding = code.addIsNotEqual(opToDo,"add");
                    var a = code.addProxyValue();
                    code.addExecuteOffsetOut(cmdStack,"pop",a);
                    code.addTime();
                    var b = code.addProxyValue();
                    code.addExecuteOffsetOut(cmdStack,"pop",b);
                    code.addTime();
                    var c = code.addPlus(a,b);
                    code.addExecuteOffsetIn(cmdStack,"push",c);
                    //code.addWrite(a,b);
                }
                
                
                /*
                var func = code.addProxyObject();
                var appVal = code.addProxyValue();
                
                code.addWrite("helloWorld",func);
                func.app = appVal;

                var callback = code.addProxyObject();
                var input = code.addProxyValue();
                func.callback = callback;
                callback.input = input;
                var innerCode = code.addProxyObject();
                callback.code = innerCode;
                

                function helloWorld_reference(app) 
                {
                    app.app_in.subscribe((input) => {
                        app.app_out.copy(input);
                        app.app_out.frameStep();
                    });
                }
                */
                
                /*
                func.callback = code.addProxyObject();
                
                code.addRead("pop",input);
                func.callback.input = input;
                code.addWrite("push",func.callback);
                code.addWrite("call",func.app.app_in.subscribe);
                //appVal.app_in.subscribe;
                */
                


            }
            break;
        }

        code.redraw();

        return code;
    },
    _isSymbol : function(obj) {
        return ((obj) && (typeof(obj)=="symbol"));
    },
    _isString : function(obj) {
        return ((obj) && (typeof(obj)=="string"));
    },
    ActionsByName : {
        "read":{name:"read",short:"g"},
        "read.":{name:"read property",isOffset:true,short:"g"},
        "write":{name:"write",isWrite:true,short:"s"},
        "write.":{name:"write.",isOffset:true,isWrite:true,short:"s"},
        //"execute":{name:"execute",short:"x"},
        "execute.out":{name:"execute property",isOffset:true,short:"s",isExecute:true,isWrite:true},
        "execute.in":{name:"execute property",isOffset:true,short:"g",isExecute:true},
        //"execute.in.out":{name:"execute property",isOffset:true,short:"w",isExecute:true,isWrite:true},
        "add":{name:"add",short:"+",isOffset:true,asNumbers:true},
        "equals":{name:"equals",short:"=",isOffset:true,asNumbers:true},
        "not_equals":{name:"not_equals",short:"!",isOffset:true,asNumbers:true},
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
            if (lewdo_code._isString(prop)) {
                target.wrappedObject[prop] = value;
            }
            target.code_owner.addWriteOffset(target.proxy,prop,value);
        },
        get: function(target, prop, receiver) {
            if (prop == "indexedBy") {
                return ((ndx)=>target.indexedBy(ndx));
            }
            if (prop == "setWhole") {
                return ((val)=>{
                    target.code_owner.addWrite(target.proxy,val);
                    return target.proxy;
                });
            }
            if (prop == "getWhole") {
                return ((val)=>{
                    target.code_owner.addRead(target.proxy,val);
                    return target.proxy;
                });
            }
            var val = target.wrappedObject[prop];
            console.assert(val); // or generate new unknown?
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
        },
        indexedBy : function(prop) {
            var target = this;
            var gottenValue = target.code_owner.addProxyValue();
            //target.wrappedObject[prop] = gottenValue;
            target.code_owner.addReadOffset(target.proxy,prop,gottenValue);
            return gottenValue;
        },
    },
    _codeProxyValueHandler : {
        set: function(target, prop, value) {
            //target.wrappedObject[prop] = value;
            target.code_owner.addWriteOffset(target.proxy,prop,value);
        },
        get: function(target, prop, receiver) {
            if (prop == "indexedBy") {
                return ((ndx)=>target.indexedBy(ndx));
            }
            if (prop in target.wrappedObject) {
                var val = target.wrappedObject[prop];
                target.code_owner.addReadOffset(target.proxy,prop,val);
                return val;
            }
            return target.indexedBy(prop);
        },
        has: function(target,prop) {
            if (prop == "isUnknownValue") return true;
            return (prop in target.wrappedObject);
        },
    },
    _uniqueIndex : 0,
    lewdo_code_prototype : {
        app : lewdo.app(),
        opsByIndex : [],

        values : lewdo.apps.shapes.values(),
        addresses : lewdo.apps.shapes.values(),
        visualLayout : { values:{}, addresses:{}, times:{} },
        grid : lewdo.apps.shapes.grid(),
        times : lewdo.apps.shapes.values(),
        currentTime : null,

        addProxyObject : function() {
            var target = Object.create( lewdo_code._codeProxyObject_prototype );
            target._uniqueIndex = lewdo_code._uniqueIndex++;
            return target.setupProxy(this);
        },

        addProxyValue : function() {
            var target = Object.create( lewdo_code._codeProxyValue_prototype );
            target._uniqueIndex = lewdo_code._uniqueIndex++;
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

        addAddition : function (addr,indx,val) {
            this._addOp("add",addr,val,true,indx);
        },

        addEquality : function(addr,indx,val) {
            this._addOp("equals",addr,val,true,indx);
        },

        addNotEquality : function(addr,indx,val) {
            this._addOp("not_equals",addr,val,true,indx);
        },

        addExecute : function (addr,val) {
            throw "TODO";
            //this._addOp("execute",addr,val);
        },

        addExecuteOffsetOut : function(addr,indx,val) {
            this._addOp("execute.out",addr,val,true,indx);
        },

        addExecuteOffsetIn : function(addr,indx,val) {
            this._addOp("execute.in",addr,val,true,indx);
        },

        addPlusOne : function (val) {
            var ans = this.addProxyValue();
            this.addAddition(val,1,ans);
            return ans;
        },

        addPlus : function (val,other) {
            var ans = this.addProxyValue();
            this.addAddition(val,other,ans);
            return ans;
        },

        addIsEqual : function (val,other) {
            var ans = this.addProxyValue();
            this.addEquality(val,other,ans);
            return ans;
        },

        addIsNotEqual : function (val,other) {
            var ans = this.addProxyValue();
            this.addNotEquality(val,other,ans);
            return ans;
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
            console.assert(op.action);
            var oldAddressCount = this.addresses.length;
            op.addressInfo = ( isIndex ? 
                ( this.addresses.addProperty(addr1,indx) ) : 
                ( this.addresses.add(addr1) ) );
            if ((this.currentTime) && (op.action.isWrite) && (!op.action.isExecute)
                && (op.addressInfo in this.currentTime.opsByAddr)
                ) {
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

        _updateVizIndices : function() {
            // First recalculate the usage indices:
            var viz = this.visualLayout;
            viz.values.clear();
            viz.addresses.clear();
            viz.times.clear();
            this.opsByIndex.forEach(op => {
                if (op.addressInfo.category.isProperty) {
                    var prop = op.addressInfo.value;
                    //viz.addresses.add( prop.objectInfo );
                    viz.values.add( prop.objectInfo );
                    viz.values.add( prop.indexInfo );
                } else {
                    viz.values.add( op.addressInfo );
                }
                viz.addresses.add( op.addressInfo );
                viz.values.add( op.addressInfo ); // optional
                viz.values.add( op.valueInfo );
                viz.times.add( op.timeInfo );
            });
        },

        redraw : function() {
            this._updateVizIndices();
            var viz = this.visualLayout;

            var grid = this.grid.app.app_in;
            grid.resize(
                viz.values.length,
                viz.values.length,
                viz.times.length,
            );
            this.opsByIndex.forEach(op => {
                var centerPos = lewdo.xyz();
                centerPos.set(
                    viz.values.find( op.valueInfo ).index,
                    viz.addresses.find( op.addressInfo ).index,
                    viz.times.find( op.timeInfo ).index
                );
                var addrPos = centerPos.clone();
                if (op.addressInfo.category.isProperty) {
                    var val = op.addressInfo.value;
                    addrPos.x = viz.values.find( val.objectInfo ).index;
                    grid.setByXYZ(
                        lewdo.string3( op.action.asNumbers ? "#" : "@" ),
                        addrPos
                    );
                    addrPos.x = viz.values.find( val.indexInfo ).index;
                    grid.setByXYZ(
                        lewdo.string3( op.action.asNumbers ? "#" : "." ),// + val.indexInfo.toString() ),
                        addrPos
                    );
                }
                addrPos.x = viz.values.find( op.addressInfo ).index;
                var identity_string = "↔"; // "&"
                grid.setByXYZ(
                    lewdo.string3( op.action.isExecute ? lewdo.letter.play : identity_string ),// + val.indexInfo.toString() ),
                    addrPos
                );
                grid.setByXYZ(
                    lewdo.string3( op.action.short ),
                    centerPos
                );
            });
            grid.frameStep(); // renders

            this.app.app_out.copy( grid );
            this.app.app_out.frameStep();
        },

        redraw_Older : function() {
            var addrWidth = this.maxToStringLength(this.addresses)+1;
            var wordWidth = this.maxToStringLength(this.values)+1;
            wordWidth = 5; // total hack

            var to = this.app.app_out;
            to._outOfBoundsWarnings = false;
            to.resize( 
                ( this.times.length * wordWidth ) + addrWidth,
                this.addresses.length,
                Math.max( this.values.length, this.addresses.length )
                );

            // First recalculate the usage indices:
            this._updateVizIndices();
            /*
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
            */


            var pos = lewdo.xyz();
            for (var opIndex in this.opsByIndex) {
                var op = this.opsByIndex[opIndex];
                pos.x = ( viz.times.find( op.timeInfo ).index * wordWidth ) + addrWidth;
                pos.y = viz.addresses.find( op.addressInfo ).index;
                pos.z = viz.values.find( op.valueInfo ).index;

                var str = op.action.short + op.valueInfo.toString();
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
            this.grid = lewdo.apps.shapes.grid(),
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






