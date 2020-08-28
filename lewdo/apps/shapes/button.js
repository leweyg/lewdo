
var lewdo_button_app = function(app,content,callback) {
    if (!content) {
        content = string3("button");
    }
    if (!callback) {
        callback = (() => {console.log("button clicked.")});
    }
    var state = {
        app : app,
        hovering : false,
        pressing : false,
    };
    app.app_in.subscribe((input) => {
        var wasPressing = state.pressing;
        if (input.width > 0) {
            var str = input.toString().trim();
            state.hovering = (str == lewdo.letter.hover);
            state.pressing = ((str == lewdo.letter.touch)
                || (str == lewdo.letter.play) 
                || (str == "Enter"));
            if (state.pressing && (!wasPressing)) {
                // do button press:
                callback();
            }
        } else {
            state.hovering = false;
            state.pressing = false;
        }

        var coreContent = lewdo_square.aroundString3(content);

        var coreSize = coreContent.sizeXYZ();
        var finalSize = coreSize.clone();
        finalSize.z += 2;
        app.app_out.resizeXYZ(finalSize);

        var depthOffset = (state.pressing ? 2 : (state.hovering ? 1 : 0));
        var drawOffset = lewdo.xyz(0,0,depthOffset);
        app.app_out.drawString3XYZ(coreContent,drawOffset);
        app.app_out.frameStep();
    });
    return state;
}


lewdo.apps.shapes.button = lewdo_button_app;

