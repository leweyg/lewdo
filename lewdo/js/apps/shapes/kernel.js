
var lewdo_kernel = {
    create : function(app) {
        var context = Object.create( lewdo_kernel.kernel_system_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_kernel.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_kernel.create(_app);
        context.app.app_out.copy(lewdo.string3("loading\nkernel..."));
        context.app.app_out.frameStep();
        context.app.app_out.copy(context.visualize_kernel());
        context.app.app_out.frameStep();
        return context;
    },

    kernel_system_prototype : {
        app : lewdo.app(),

        setup : function(_app) {
            this.app = _app;
        },

        visualize_kernel : function() {
            var lk = lewdo_kernel.compiled_kernel();
            var code = lewdo.apps.shapes.code();
            code.legend = true;
            code.formatContent = function(info,str3,pos,op) {
                var str = str3.toString()
                if (info.category && info.category.name == "string" && info.value) {
                    //return lewdo.string3( str + info.value );
                }
                if (str=="↕") {
                    var proxyItself = info.value.__proxy_itself;
                    var name = proxyItself ? proxyItself.name : undefined;
                    if (name) {
                        str = str3.toString() + name;
                        //return lewdo.string3(str);
                    } else {
                        //return lewdo.string3(" ");
                    }
                }
                return str3;
            };

            var possible_jumps = [];
            for (var sourceLineIndex in lk.MicroSource) {
                var sourceLine = lk.MicroSource[ sourceLineIndex ];
                var parts = sourceLine.split(" ");
                if (parts[0] == "@") {
                    possible_jumps.push( parts[1] );
                }
            }

            for (var sourceLineIndex in lk.MicroSource) {
                var sourceLine = lk.MicroSource[ sourceLineIndex ];

                var parts = sourceLine.split(" ");
                switch (parts[0]) {
                    case "@":
                        {
                            var name = parts[1];
                            var cmdData = code.addProxyValue();
                            //code.addRead(name,cmdData);
                            //code.addRead("ins_ptr",parts[1]);
                            code.addExecuteRead(name,name);
                        }
                        break;
                    case "thread_ptr_read":
                        {
                            var threadPtr = code.addProxyObject("thread_ptr");
                            var threadPtrValue = code.addProxyValue();
                            threadPtr.getWhole( threadPtrValue);
                            code.addWrite(parts[1],threadPtrValue);
                        }
                        break;
                    case "read":
                        {
                            var val = code.addProxyValue();
                            code.addReadOffset(parts[2],parts[3],val);
                            code.addWrite(parts[1],val);
                        }
                        break;
                    case "write":
                        {
                            var val = code.addRead(parts[1]);
                            code.addWriteOffset(parts[2],parts[3],val);
                        }
                        break;
                    case "add":
                        {
                            var val = code.addPlus(parts[2],parts[3]);
                            code.addWrite(parts[1],val);
                        }
                        break;
                    case "adde":
                        {
                            var val = code.addPlus(parts[2],parts[3]);
                            code.addWrite(parts[1],val);
                        }
                        break;
                    case "jump":
                        {
                            code.addWrite("ins_ptr",parts[1]);
                        }
                        break;
                    case "jump_op":
                        {
                            for (var i in possible_jumps) {
                                code.addExecuteRead( parts[1], possible_jumps[i] );
                            }
                            //code.addWrite("ins_ptr",parts[1]);
                        }
                        break;
                    case "kernel_flush":
                    case "thread_exit":
                        {
                            code.addWrite("ins_ptr",parts[0]);
                        }
                        break;
                    default:
                        console.log("Ignoring " + parts[0] + " from " + sourceLine );
                        break;
                }
            }

            code.redraw();
            return code.app.app_out;
        },
    },

    _compiled_kernel : null,
    compiled_kernel : function() {
        if (!this._compiled_kernel) {
            this._compiled_kernel = this.do_core_compile();
        }
        return this._compiled_kernel;
    },

    do_core_compile : function() {

var lewcidKernelLog = function(obj) {
    //console.log(obj);
}
var lewcidKernelDebug = function(obj) {
    //console.log(obj);
}

var lewcidKernel = {
    ThreadStruct : [
        "offset_register_ptr",
        "offset_instruction_ptr",
        "offset_stack_ptr",
        "offset_heap_ptr",
        "__t0",
        "__t1",
        "__t2",
        "__t3",
    ],
    StackCodes : [
        {id:"nop"},
        {id:"var"}, // id, initial
        {id:"exit"},
        {id:"kernel_init"},
        {id:"kernel_main"},
        {id:"kernel_return"},
        {id:"return"},
        {id:"push_i"}, // #
        {id:"push"}, // src
        {id:"pop"}, // dst
        {id:"peek"}, // dst
        
    ],
    Test:{
        StackSource : [
            "var row",
            "var col",
            "push_i 777",
            "push_i 888",
            "peek row",
            "push_i 999",
            "pop col",
            "push col",
            "peek row",
            "exit",
        ],
    },
    MicroRegisters : [
        "r_zero",
        "r_micro_thread_ptr",
        "r_micro_ins_ptr",
        "r_micro_link_ptr",
        "r_thread",
        "r_ins_ptr",
        "r_stack_ptr",
        "r_reg_ptr",
        "r_op_code",
        "r_temp_0",
        "r_temp_regid"
    ],
    MicroOps : [
        "nop", // no operation { }
        "kernel_flush",
        "thread_exit",
        "label", // label
        "thread_ptr_read", // dst = r_thread_ptr
        "read", // dst = [ src + offset ]
        "write", // [ src + offset ] = dst
        "add", // dst = [ src + # ]
        "adde", // dst += #
        "jump", // ins_ptr = dst
        "jump_if", // if (src == #) ins_ptr = dst
        "jump_op", // ins_ptr = @dst
        "debug", // console.log( latest_symbol );
    ],
    MicroStruct : [
        "opcode",
        "dst",
        "src",
        "cnst"
    ],
    MicroSource : [
        "@ kernel_init",

        // read current instruction:
        "thread_ptr_read r_thread",
        "read r_ins_ptr, r_thread, offset_instruction_ptr",
        "read r_stack_ptr, r_thread, offset_stack_ptr",
        "read r_reg_ptr, r_thread, offset_register_ptr",

        // read instruction and jump to it:
        "@ kernel_main",
        "read r_op_code, r_ins_ptr, 0",
        "debug r_ins_ptr",
        "add r_ins_ptr, r_ins_ptr, 1",
        "jump_op r_op_code", // goto label below

        // return statement:
        "@ kernel_return",
        "write r_ins_ptr, r_thread, offset_instruction_ptr",
        "write r_stack_ptr, r_thread, offset_stack_ptr",
        "kernel_flush",
        "jump @kernel_main",

        // push immediate
        "@ push_i",
        "read r_temp_0, r_ins_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "write r_temp_0, r_stack_ptr, 0", // write
        "debug r_stack_ptr",
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // pop register
        "@ pop",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, -1", // read
        "write r_temp_0, r_temp_regid", // write
        "debug r_temp_regid",
        "add r_stack_ptr, r_stack_ptr, -1",
        "jump @kernel_return",

        // push register
        "@ push",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_temp_regid", // read
        "debug r_temp_regid",
        "write r_temp_0, r_stack_ptr, 0", // write
        "add r_stack_ptr, r_stack_ptr, 1",
        "jump @kernel_return",

        // peek register
        "@ peek",
        "read r_temp_regid, r_ins_ptr, 0",
        "adde r_temp_regid, r_reg_ptr, 0",
        "add r_ins_ptr, r_ins_ptr, 1",
        "read r_temp_0, r_stack_ptr, -1", // read
        "write r_temp_0, r_temp_regid", // write
        "debug r_temp_regid",
        //"add r_stack_ptr, r_stack_ptr, 1", // dont move stack
        "jump @kernel_return",

        "@ exit",
        "thread_exit",
        "thread_exit",

        // return
    ],
    MicroAssembly : null,
    MicroSymbols : null,
    MicroLinkTable : null,
};

var lewcidMemory = {
    DefaultMemory : {
        MainMemory : [],
        MainSymbols : [],
        KernelAssemblyPtr : 0,
        KernelAssemblyLinkPtr : 0,
        LatestSymbol : null,
        LatestAddress : null,

        Read : function(index) {
            if ((index < 0) || (index >= this.MainMemory.length))
                throw "Write out of bounds";

            this.LatestAddress = index;
            this.LatestSymbol = this.MainSymbols[index];
            console.assert(this.LatestSymbol != null);

            return this.MainMemory[index];
        },
        Write : function(index,value) {
            if ((index < 0) || (index >= this.MainMemory.length))
                throw "Write out of bounds";

            this.LatestAddress = index;
            this.LatestSymbol = this.MainSymbols[index];
            console.assert(this.LatestSymbol != null);

            this.MainMemory[index] = value;
        },

        ProcAlloc : function(thread_ptr=0) {
            var kernel = lewcidKernel;
            var size = kernel.MicroRegisters.length;
            var proc_ptr = this.AllocSize(size, kernel.MicroRegisters );
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_ins_ptr", this.KernelAssemblyPtr );
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_link_ptr", this.KernelAssemblyLinkPtr );
            this.ProcSetThread(proc_ptr, thread_ptr);
            return proc_ptr;
        },

        ProcThreadStep : function(proc) {
            var maxSteps = 30;
            var stepsTaken = 0;
            while (this.ProcMicroStep(proc)) {
                stepsTaken++;
                if (stepsTaken > maxSteps) {
                    lewcidKernelDebug("RAN OVER STEPS!");
                    return 0;
                }
            }
            return stepsTaken;
        },

        ProcThreadRun : function(proc) {
            var maxCycles = 30;
            var stepsTaken = 0;
            while (this.ProcThreadStep(proc) > 0) {
                stepsTaken++;
                if (stepsTaken > maxCycles) {
                    lewcidKernelDebug("RAN OVER CYCLES!");
                    return false;
                }
            }
            return true;
        },

        ProcMicroStep : function(proc) {

            var micro_ins_ptr = this.ProcReadMicroRegByName(proc, "r_micro_ins_ptr");
            if (micro_ins_ptr < this.KernelAssemblyPtr)
                return false;
            this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", micro_ins_ptr + lewcidKernel.MicroStruct.length );

            var mop = this.Read(micro_ins_ptr+0);
            //lewcidKernelLog( this.LatestSymbol );
            var dst = this.Read(micro_ins_ptr+1);
            var src = this.Read(micro_ins_ptr+2);
            var cst = this.Read(micro_ins_ptr+3);

            var mopName = lewcidKernel.MicroOps[ mop ];

            switch (mopName) {
                case "read":
                    {
                        var addr = this.ProcReadMicroRegByIndex( proc, src );
                        addr += cst;
                        var val = this.Read( addr );
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "write":
                    {
                        var addr = this.ProcReadMicroRegByIndex( proc, src );
                        addr += cst;
                        var val = this.ProcReadMicroRegByIndex( proc, dst );
                        this.Write( addr, val );
                    }
                    break;
                case "add":
                    {
                        var val = this.ProcReadMicroRegByIndex( proc, src );
                        val += cst;
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "adde":
                    {
                        var cur = this.ProcReadMicroRegByIndex( proc, dst );
                        var extra = this.ProcReadMicroRegByIndex( proc, src );
                        var val = cur + extra + cst;
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "jump_op":
                    {
                        var op = this.ProcReadMicroRegByIndex( proc, dst );
                        var link_ptr = this.Read( this.KernelAssemblyLinkPtr + op ) + this.KernelAssemblyPtr;
                        var TESTONLY = this.Read( link_ptr );
                        this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", link_ptr );
                    }
                    break;
                case "jump":
                    {
                        var link_ptr = this.KernelAssemblyPtr + dst; // offset into micro assembly
                        var TESTONLY = this.Read(link_ptr);
                        this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", link_ptr );
                        
                    }
                    break;
                case "thread_ptr_read":
                    {
                        var val = this.ProcReadMicroRegByName(proc, "r_micro_thread_ptr");
                        this.ProcWriteMicroRegByIndex( proc, dst, val );
                    }
                    break;
                case "kernel_flush":
                    {
                        this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", this.KernelAssemblyPtr );
                        return false;
                    }
                    break;
                case "thread_exit":
                    {
                        this.ProcWriteMicroRegByName(proc, "r_micro_ins_ptr", micro_ins_ptr );
                        return false;
                    }
                    break;
                case "nop":
                    break;
                case "debug":
                    {
                        var addr = this.ProcReadMicroRegByIndex( proc, dst );
                        var addr_symb = this.LatestSymbol;
                        var val = this.Read( addr );
                        var symbol = this.LatestSymbol;
                        lewcidKernelDebug( "[" + addr + "(" + addr_symb + ")]=" + val + "(" + symbol + ")" );
                    }
                    break;
                default:
                    throw "Unknown op [" + mopName + "]";
                    break;
            }
            return true;
        },

        ProcMicroRegByName : function(proc, regName) {
            var index = lewcidCompiler.indexIn( regName, lewcidKernel.MicroRegisters );
            return proc + index;
        },
        ProcReadMicroRegByName : function(proc, regName) {
            return this.Read( this.ProcMicroRegByName( proc, regName ) );
        },
        ProcWriteMicroRegByName : function(proc, regName, value) {
            this.Write( this.ProcMicroRegByName(proc, regName), value);
        },
        ProcReadMicroRegByIndex : function(proc, index, value) {
            return this.Read( proc + index );
        },
        ProcWriteMicroRegByIndex : function(proc, index, value) {
            this.Write( proc + index, value );
        },
        ThreadRegByName : function(thread_ptr, regName) {
            var index = lewcidCompiler.indexIn( regName, lewcidKernel.ThreadStruct );
            return thread_ptr + index;
        },

        AllocSize : function(sz,symbols) {
            var start = this.MainMemory.length;
            this.CheckSymbols();
            for (var i=0; i<sz; i++) {
                this.MainMemory.push(0);
                this.MainSymbols.push(symbols[i % symbols.length]);
            }
            this.CheckSymbols();
            return start;
        },
        AllocBuffer : function(buffer, symbols) {
            var start = this.MainMemory.length;
            this.CheckSymbols();
            for (var i=0; i<buffer.length; i++) {
                this.MainMemory.push( buffer[i] );
                this.MainSymbols.push( symbols[i % symbols.length] )
            }
            this.CheckSymbols();
            return start;
        },

        MethodAlloc : function(assembly,symbols) {
            return this.AllocBuffer(assembly,symbols);
        },
        CheckSymbols : function() {
            console.assert( this.MainMemory.length == this.MainSymbols.length );
        },

        ThreadAlloc : function(startMethod) {
            var size = lewcidKernel.ThreadStruct.length;
            
            var thread_ptr = this.AllocSize( size, lewcidKernel.ThreadStruct );
            var stack_ptr = this.AllocSize( 12, [ "stack_data" ] );
            this.CheckSymbols();

            this.Write( this.ThreadRegByName(thread_ptr, "offset_instruction_ptr"), startMethod );
            this.Write( this.ThreadRegByName(thread_ptr, "offset_register_ptr"), this.ThreadRegByName(thread_ptr, "__t0") );
            this.Write( this.ThreadRegByName(thread_ptr, "offset_stack_ptr"), stack_ptr );
            this.CheckSymbols();

            return thread_ptr;
        },


        ProcSetThread : function(proc_ptr, thread_ptr) {
            this.ProcWriteMicroRegByName( proc_ptr, "r_micro_thread_ptr", thread_ptr );
        },

    },
    AllocateMemory : function() {
        var kernel = lewcidKernel;
        var proc = Object.create( this.DefaultMemory );
        proc.MainMemory = []; // new array
        proc.MainSymbols = [];

        var pre_ptr = proc.AllocSize( 4, [ "bad_addr" ] );
        proc.KernelAssemblyPtr = proc.AllocBuffer( kernel.MicroAssembly, kernel.MicroSymbols );
        proc.KernelAssemblyLinkPtr = proc.AllocBuffer( kernel.MicroLinkTable, kernel.StackCodes );
        
        return proc;
    },
};

var lewcidCompiler = {
    indexIn : function (name,array) {
        for (var i in array) {
            var k = array[i];
            if (k == name)
                return 1*i;
        }
        throw "Unknown item '" + name + "'";
    },
    tokenize : function (str) {
        var parts = str.split(" ");
        var result = [];
        for (var pi in parts) {
            var p = parts[pi].replace(",","").trim();
            if (p != "")
                result.push(p);
        }
        return result;
    },
    stackcode_by_name : function (name) {
        var kernel = lewcidKernel;
        for (var i in kernel.StackCodes) {
            var code = kernel.StackCodes[i];
            code.index = i; // TODO: pre-store this
            if (code.id == name)
                return code;
        }
        throw "unknown stack code '" + name + "'";
    }
};

function lewcidKernel_EnsureCompiled_Kernel() {
    var kernel = lewcidKernel;
    if (kernel.MicroAssembly)
        return kernel;
    kernel.MicroAssembly = [];
    kernel.MicroSymbols = [];
    var stackcode_by_name = lewcidCompiler.stackcode_by_name;
    var indexIn = lewcidCompiler.indexIn;
    var tokenize = lewcidCompiler.tokenize;
    for (var lineIndex in kernel.MicroSource) {
        var line = kernel.MicroSource[lineIndex];
        var parts = tokenize(line);
        if (parts[0] == "@") {
            var code = stackcode_by_name(parts[1]);
            code.offset = kernel.MicroAssembly.length;// + kernel.MicroStruct.length;
            //continue;
            parts = [ "nop" ];
        }
        var r_op_code = indexIn( parts[0], kernel.MicroOps );
        var r_op_dst = 0;
        if (parts.length >= 2) {
            if (parts[1].startsWith("@")) {
                r_op_dst = stackcode_by_name(parts[1].substr(1)).offset;
                console.assert( r_op_dst );
            } else {
                r_op_dst = indexIn( parts[1], kernel.MicroRegisters );
                console.assert( r_op_dst );
            }
        }
        var r_op_src = 0;
        if (parts.length >= 3)
            r_op_src = indexIn( parts[2], kernel.MicroRegisters );
        var r_op_const = 0;
        if (parts.length >= 4) {
            if (!isNaN(parts[3])) {
                r_op_const = 1*parts[3];
            } else {
                r_op_const = indexIn( parts[3], kernel.ThreadStruct );
            }
        }

        var startAddr = kernel.MicroAssembly.length;
        kernel.MicroAssembly.push( 1*r_op_code );
        kernel.MicroAssembly.push( 1*r_op_dst );
        kernel.MicroAssembly.push( 1*r_op_src );
        kernel.MicroAssembly.push( 1*r_op_const );
        console.assert( ( kernel.MicroAssembly.length - startAddr ) == kernel.MicroStruct.length );

        for (var ii=0; ii<4; ii++) {
            kernel.MicroSymbols.push( "@" + lineIndex + "," + ii + ": " + line );
        }

        console.assert( kernel.MicroAssembly.length == kernel.MicroSymbols.length );
    }

    kernel.MicroLinkTable = [];
    for (var li in kernel.StackCodes) {
        var code = kernel.StackCodes[li];
        kernel.MicroLinkTable[code.index] = code.offset;
    }

    return kernel;
}

function lewcidKernel_Compile_StackSource(source) {
    var kernel = lewcidKernel;
    var indexIn = lewcidCompiler.indexIn;
    var tokenize = lewcidCompiler.tokenize;
    var stackcode_by_name = lewcidCompiler.stackcode_by_name;
    var result = {
        assembly:[],
        symbols:[],
        source:(source),
        register_count:0,
        vars:["v0"],
    };
    var hasAllocatedVars = false;
    for (var lineIndex in source) {
        var line = source[lineIndex];
        var parts = tokenize(line);
        if (parts[0] == "var") {
            result.vars.push( parts[1] );
            continue;
        }
        if (!hasAllocatedVars) {
            hasAllocatedVars = true;
            var numVars = result.vars.length;
            result.register_count = numVars;
        }
        var stack_op = stackcode_by_name( parts[0] );
        result.assembly.push( 1 * stack_op.index );
        result.symbols.push(line);
        if (parts.length >= 2) {
            var val = parts[1];
            if (isNaN(val)) {
                var regIndex = indexIn( val, result.vars );
                val = regIndex;
            } else {
                val = 1 * val;
            }
            result.assembly.push( 1 * val );
            result.symbols.push("[,1]" + line);
        }
    }
    return result;
}

function lewcidKernel_EnsureCompiled() {
    var kernel = lewcidKernel_EnsureCompiled_Kernel();
    lewcidKernelLog(JSON.stringify(kernel));

    // try compiling some stack code:
    var method = lewcidKernel_Compile_StackSource(lewcidKernel.Test.StackSource);
    lewcidKernelLog(JSON.stringify(method));

    // Test out the code:
    var memory = lewcidMemory.AllocateMemory();
    var method_ptr = memory.MethodAlloc( method.assembly, method.symbols );
    var thread_ptr = memory.ThreadAlloc( method_ptr );
    var proc_ptr = memory.ProcAlloc( thread_ptr );
    memory.ProcThreadRun( proc_ptr );

    return kernel;
}

return lewcidKernel_EnsureCompiled();

    },
};

//lewdo.apps.shapes.kernel = lewdo_kernel.app;
lewdo.apps.tools.kernel = lewdo_kernel.demo;

lewdo_kernel.compiled_kernel();
