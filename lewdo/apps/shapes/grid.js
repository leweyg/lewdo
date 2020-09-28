
var lewdo_grid = {
    gridify : function(metaStr3,into,options) {

        // First measure max sizes per axis per index:
        var maxSizesByAxisByIndex = lewdo.xyz().select(()=>{return [];});
        metaStr3.visitEachXYZ((str3,pos)=>{
            str3 = lewdo.string3(str3); // ensure it's a string3
            var sz = str3.sizeXYZ();
            sz.selectAxes((axisSize,axis)=>{
                var data = maxSizesByAxisByIndex[axis]; // read and write
                var index = pos[axis];
                var hasItem = (index in data);
                var mx = (hasItem ? data[index] : 0);
                mx = Math.max( mx, axisSize );
                if (!hasItem) {
                    data.push( mx );
                    console.assert(index+1 == data.length);
                } else {
                    data[index] = mx;
                }
            });
        });

        // Sum up total size:
        var totalSizeXYZ = maxSizesByAxisByIndex.clone()
            .select((k)=>{
                var sum = 0;
                for (var i in k) sum += k[i];
                return sum;
            });
        into = (into || string3());
        into.resizeXYZ(totalSizeXYZ);

        // Now render each
        var offset = lewdo.xyz();
        metaStr3.visitEachXYZ((str3,pos)=>{
            str3 = lewdo.string3(str3);
            offset.set(0,0,0);
            // Sum up offset of all max sizes in lower indices of each dimension:
            metaStr3.visitEachAxisXYZ(pos.clone(),(prevStr3,prevPos,axis)=>{
                if (prevPos[axis] >= pos[axis])
                    return;
                var maxSize = maxSizesByAxisByIndex[axis][prevPos[axis]];
                if (maxSize) {
                    offset[axis] += maxSize;
                    console.assert(!isNaN(offset[axis]));
                }
            });
            // Draw the sub string:
            if (options && options.centered) {
                var mySize = str3.sizeXYZ();
                offset.selectAxes((v,axis)=>{
                    if (options && options.dontCenterZ && (axis == "z")) return v;

                    var available = maxSizesByAxisByIndex[axis][pos[axis]];
                    return v + Math.floor( ( available - mySize[axis] ) / 2 );
                });
            }
            into.drawString3XYZ( str3, offset );
        });

        return into;
    },

    app : function(_app) {
        var result = Object.create( lewdo_grid.grid_prototype );
        result.setup(_app);
        return result;
    },
    demo : function(_app) {
        var grid = lewdo_grid.app(_app);

        var into = lewdo.string3();

        into.resize(3,3,3,"*");
        into.modifyEachXYZ((letter,pos)=>{
            var n = pos.sum();
            var r = lewdo.string3();
            r.resize(n,n,n, ""+n);
            return r;
        });
        
        grid.centered = true;
        grid.app.app_in.copy(into);
        grid.app.app_in.frameStep();
        grid.fromInput = false;

        return grid;
    },
    grid_prototype : {
        app : null, 
        fromInput : true,
        centered : false,
        dontCenterZ : true,

        setup : function(_app) {
            this.app = (_app || lewdo.app() );

            this.app.app_in.subscribe((input)=>{
                if (!this.fromInput) return;
                lewdo_grid.gridify( input, this.app.app_out, this );
                this.app.app_out.frameStep();
            });
        }
    },
};

lewdo.apps.shapes.grid = lewdo_grid.app;
//lewdo.apps.tools.grid = lewdo_grid.demo;
