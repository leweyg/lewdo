
var lewdo_button_app = function(app,content,callback) {
    if (!content) {
        content = string3("button");
    }
    if (!callback) {
        callback = (() => {console.log("button clicked.")});
    }
    var isClicking = false;
    app.app_in.subscribe((input) => {
        if (input.width > 0) {
            var str = input.toString();
            if (str == "Enter" || str == "►") {
                isClicking = true;
                content = string3("clicked");
                callback();
            }
        } else {
            if (isClicking) {
                isClicking = false;
                content = string3("button again");
            }
        }

        app.app_out.copy( lewdo_square.aroundString3(content) );
        app.app_out.frameStep();
    });
    return app;
}


//lewdo.all_apps.shapes.button = lewdo_button_app;