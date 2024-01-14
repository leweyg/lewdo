

export var observe = {
    version : "observe.v0.2",
    observable : (initialValue) => {
        return observe.prototypes.observable.create_observable(initialValue);
    },
    dictionary : (initialDictionary) => {
        return observe.prototypes.observable_dictionary.create_observable_dictionary(initialDictionary);
    },
    process : () => {
        return observe.prototypes.process.create_process();
    },
    prototypes : {
        observable : {
            value : null,
            key : null,
            subscribers : [],
            is_disposed : false,
            create_observable : function(initialValue) {
                var ob = new Object(observe.prototypes.observable);
                ob.initialize(initialValue);
                return ob;
            },
            initialize : function(initialValue,initialKey) {
                this.value = initialValue;
                this.key = initialKey;
                this.subscribers = [];
                return this;
            },
            getValue : function() {
                return this.value;
            },
            setValue : function(other,key) {
                this.value = other;
                this.key = key;
                this.updateSubscribers();
                return this;
            },
            subscribe : function(onEnter,onUpdate,onExit) {
                var ob = observer_string3_prototype.create_observer(onEnter,onUpdate,onExit);
                this.enterObserver(ob);
                if (this.is_disposed) {
                    ob.recieve_dispose();
                } else {
                    this.subscribers.push(ob);
                }
                return ob;
            },
            dispose : function () {
                if (this.subscribers && (this.subscribers.length > 0))
                {
                    var disposeThese = this.subscribers;
                    this.subscribers = [];
                    // dispose in reverse order then subscribed:
                    var n = disposeThese.length;
                    for (var i=n-1; i>=0; i--) {
                        disposeThese[i].dispose();
                    }
                }
                if (this.is_disposed) return;
                this.is_disposed = true;
        
                var isLogWhenDisposed = false;
                if (isLogWhenDisposed) {
                    console.log("DisposingOf:" + this.toString());
                }
            },
            updateSubscribers : function() {
                for (var si in this.subscribers) {
                    var obser = this.subscribers[si];
                    this.updateObserver(obser);
                }
            },
            enterObserver : function(obser) {
                if (!this._catchFrameExceptions) {
                    obser.recieve_enter(this);
                } else {
                    try {
                        obser.recieve_enter(this);
                    } catch (ex) { 
                        obser.recieve_exception(ex);
                        console.log(ex);
                    }
                }
            },
            updateObserver : function(obser) {
                if (!this._catchFrameExceptions) {
                    obser.recieve_update(this);
                } else {
                    try {
                        obser.recieve_update(this);
                    } catch (ex) { 
                        obser.recieve_exception(ex);
                        console.log(ex);
                    }
                }
            },
            exitObserver : function(obser) {
                if (!this._catchFrameExceptions) {
                    obser.recieve_exit(this);
                } else {
                    try {
                        obser.recieve_exit(this);
                    } catch (ex) { 
                        obser.recieve_exception(ex);
                        console.log(ex);
                    }
                }
            },
        },
        observer : {
            onenter : null,
            onupdate : null,
            onexit : null,
            onexception : null,
            is_disposed : false,
            create_observer : function(whenEnter,whenUpdate, whenExit) {
                var ans = Object.create(observe.prototypes.observer);
                ans.onenter = whenEnter;
                ans.onupdate = whenUpdate;
                ans.onexit = whenExit;
                return ans;
            },
            recieve_enter : function(obser) {
                if (this.is_disposed) return;
                if (this.onenter) {
                    if (obser) {
                        this.onenter(obser.value, obser.key, obser);
                    } else {
                        this.onenter();
                    }
                }
            },
            recieve_update : function(obser) {
                if (this.is_disposed) return;
                if (this.onupdate) {
                    if (obser) {
                        this.onupdate(obser.value,obser.key,obser);
                    } else {
                        this.onupdate();
                    }
                }
            },
            recieve_dispose : function(obser) {
                this.dispose();
            },
            recieve_exit : function(obser) {
                this.dispose();
            },
            dispose : function(obser=null) {
                if (this.is_disposed) return;
                this.is_disposed = true;
                if (this.onexit) {
                    if (obser) {
                        this.onexit(obser.value,obser.key,obser);
                    } else {
                        this.onexit();
                    }
                }
            },
            recieve_exception : function(ex) {
                if (this.is_disposed) return;
                if (this.onexception) {
                    this.is_disposed = true;
                    this.onexception(ex);
                } else {
                    this.dispose();
                }
            },
        },
        observable_dictionary : {
            state : "observable",
            create_observable_dictionary : ((innerDict = {}) => {
                var target = new Object(observe.prototypes.observable_dictionary);
                target.state = observe.prototypes.observable.create_observable(innerDict);
                var ans = new Proxy( target, observe.prototypes.observable_dictionary_proxy );
                return ans;
            }),
        },
        observable_dictionary_proxy : {
            set: function(target, prop, value) {
                var obser = target.state;
                var dict = target.state.getValue();
                if (prop in dict) {
                    dict[prop] = value;
                    obser.whenUpdate(value,prop);
                } else {
                    dict[prop] = value;
                    obser.whenEnter(value,prop);
                }
            },
            get: function(target, prop, receiver) {
                var obser = target.state;
                var dict = target.state.getValue();
                if (prop in dict) {
                    return dict[prop];
                }
                var newObser = observe.observable();
                dict[prop] = newObser;
                obser.setValue(newObser,prop);
                return newObser;
            },
            has: function(target,prop) {
                var dict = target.state.getValue();
                if (prop in dict) {
                    return true;
                }
                return false;
            },
        },
        observable_array : {
            state : "observable<[]>",
            create_observable_array : ((innerArray = []) => {
                var target = new Object(observe.prototypes.observable_dictionary);
                target.state = observe.prototypes.observable.create_observable(innerArray);
                var ans = new Proxy( target, observe.prototypes.observable_dictionary_proxy );
                return ans;
            }),
            array : function() {
                return this.state.value;
            },
            push : function(val) {
                this.array().push(val);
                this.state.updateSubscribers();
            },
            replace : function(newAr) {
                this.state.setValue(newAr);
            },
        },
        process_link : {
            from : "process",
            to : "process",
            from_out_name : "output",
            to_out_name : "input",
            observer : "observer",
        },
        process : {
            input : "observable_dictionary<string,value>",
            output : "observable_dictionary<string,value>",
            in : "observable<string3>",
            out : "observable<string3>",
            connections : "observable<process_link>",
            is_updated : false,
            connect : (otherApp,outName=null,inName=null) => {
                todo();
            },
            update : function() {
                if (this.is_updated) {
                    return;
                }
                this.is_updated = true;
            },
            namedInputToOutput : (inObser,outObser,doAct) => {
                if (inObser && (typeof(inObser)=="string")) {
                    inObser = this.input[inObser];
                }
                if (outObser && (typeof(outObser)=="string")) {
                    outObser = this.input[outObser];
                }
                if (inObser) {
                    inObser.subscribe(
                        () => {},
                        (updated) => {
                            outObser.setValue(doAct(updatedValue));
                        },
                        () => { outObser.dispose(); } );
                }
                return outObser;
            },
            create_process : () => {
                return (new Object(observe.prototypes.process)).initialize();
            },
            initialize : () => {
                this.input = observe.dictionary();
                this.output = observe.dictionary();
                this.connections = observe.array();
                this.in = this.input.in;
                this.out = this.output.out;

                return this;
            }
        },
    },
};


