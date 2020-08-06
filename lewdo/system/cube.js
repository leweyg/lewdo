
// TODO: fix this for all HTML displays:

var _lewdo_square_string = "┌-┐\n┃ ┃\n└-┘";
var _lewdo_square_corners_string = "┌ ┐\n   \n└ ┘";
//var _lewdo_square_string = "/-\\\n┃ ┃\n\\-/";
//var _lewdo_square_corners_string = "/ \\\n   \n\\ /";
var _lewdo_cube_string = _lewdo_square_string + "\v" + _lewdo_square_corners_string + "\v" + _lewdo_square_string;

var lewdo_square = {
    square_string : _lewdo_square_string,
    square_string3 : string3( _lewdo_square_string ),
    square_corners_string : _lewdo_square_corners_string,
    square_corners_string3 : string3( _lewdo_square_corners_string ),

    aroundString3 : function(center) {
        var ans = string3();
        var t = string3_utils.xyz();
        ans.resize(center.width+2, center.height+2, Math.max(1,center.depth) );
        var ansSize = ans.sizeXYZ();
        string3_utils.visitEachXYOnZ(ans,0,(letter,v) => {
            if (true || ans.isEdgeXYZ(v)) {
                t.copy(v);
                t.select2( ansSize, lewdo_cube._clampIndex );
                t.z = 0;
                var val = lewdo_square.square_string3.getByXYZ(t);
                ans.setByXYZ(val, v);
            }
        });
        ans.drawString3XYZ(center,string3_utils.xyz(1,1,0));
        return ans;
    },
};

var lewdo_cube = {
    cube_string : _lewdo_cube_string,
    cube_string3 : string3( _lewdo_cube_string ),

    aroundString3 : function(center) {
        var ans = string3();
        var t = string3_utils.xyz();
        ans.resize(center.width+2,center.height+2,center.depth+2);
        var ansSize = ans.sizeXYZ();
        ans.visitEachXYZ((letter,v) => {
            if (ans.isEdgeXYZ(v)) {
                t.copy(v);
                t.select2( ansSize, lewdo_cube._clampIndex );
                var val = lewdo_cube.cube_string3.getByXYZ(t);
                ans.setByXYZ(val, v);
            }
        });
        ans.drawString3XYZ(center,string3_utils.xyz(1,1,1));
        return ans;
    },

    aroundApp : function(app) {
        app.app_in.subscribe((input) => {
            if (input.array1d.length > 0) {
                if (input.array1d[0].length > 0) {
                    input = string3( input.toString() );
                }
            }
            app.app_out.copy( lewdo_cube.aroundString3( input ) );
            app.app_out.frameStep();
        });
    },

    _clampIndex : function(i,n) {
        if (i >= n-1)
            return 2;
        if (i > 0)
            return 1;
        return 0;
    },
};

lewdo_app_prototype.all_apps.system["cube"] = lewdo_cube.aroundApp;



