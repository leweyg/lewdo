
// TODO: fix this for all HTML displays:
var lewdo_square_string = "┌─┐\n┃ ┃\n└─┘";
var lewdo_square_corners_string = "   \n * \n   ";
var lewdo_cube_string = lewdo_square_string + "\v" + lewdo_square_string + "\v" + lewdo_square_string;
var lewdo_cube_string3 = string3( lewdo_cube_string );

var _lewdo_cube_clampIndex = function(i,n) {
    if (i >= n-1)
        return 2;
    if (i > 0)
        return 1;
    return 0;
}

var lewdo_cube_around = function(center) {
    var ans = string3();
    var t = string3_utils.xyz();
    ans.resize(center.width+2,center.height+2,center.depth+2);
    var ansSize = ans.sizeXYZ();
    ans.visitEachXYZ((letter,v) => {
        if (ans.isEdgeXYZ(v)) {
            t.copy(v);
            t.select2( ansSize, _lewdo_cube_clampIndex );
            var val = lewdo_cube_string3.getByXYZ(t);
            ans.setByXYZ(val, v);
        }
    });
    ans.drawString3XYZ(center,string3_utils.xyz(1,1,1));
    return ans;
};

var lewdo_cube_app = ((app) => {
    app.app_in.subscribe((input) => {
        if (input.array1d.length > 0) {
            if (input.array1d[0].length > 0) {
                input = string3( input.toString() );
            }
        }
        app.app_out.copy( lewdo_cube_around( input ) );
        app.app_out.frameStep();
    });
});

lewdo_app_prototype.all_apps.apps["cube"] = lewdo_cube_app;



