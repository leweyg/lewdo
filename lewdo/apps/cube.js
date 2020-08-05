
// TODO: fix this for all HTML displays:
var lewdo_square_string = "┌─┐\n┃ ┃\n└─┘";
var lewdo_square_corners_string = "   \n * \n   ";
var lewdo_cube_string = lewdo_square_string + "\v" + lewdo_square_corners_string + "\v" + lewdo_square_string;
var lewdo_cube_string3 = string3( lewdo_cube_string );

var lewdo_cube_app = ((app) => {
    app.app_out.copy(lewdo_cube_string3);
    app.app_out.frameStep();
});

//lewdo_app_prototype.all_apps.apps["cube"] = lewdo_cube_app;


