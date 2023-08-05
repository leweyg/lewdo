
var lewdo_stack = {
    create : function(app,axis) {
        var stack = lewdo.apps.shapes.host(app);
        stack.axis = (axis || "x");
        stack.pushApp = lewdo_stack._pushApp;
        stack.layout = lewdo_stack._layoutStack;
        stack.redraw();
        return stack;
    },
    app : function(app,stackOfApps,axis) {
        var stack = lewdo_stack.create(app,axis);
        if (!stackOfApps) {
            stack.pushApp(lewdo_stack._labelApp("Heading"));
            stack.pushApp(lewdo_stack._labelApp("Next"));
            stack.pushApp(lewdo_stack._labelApp("\vAnd Last"));
        } else {
            for (var si in stackOfApps) {
                stack.pushApp(stackOfApps[si]);
            }
        }
        return stack;
    },
    _pushApp : function(app,align="center") {
        var res = this.pushAppBase(app);
        res.align = align;
        return res;
    },
    _layoutStack : function(isRender) {
        // first measure:
        var maxSizes = string3_utils.xyz(1,1,1);
        var sumSizes = string3_utils.xyz(1,1,1);
        for (var si in this.stackedApps) {
            var size = this.stackedApps[si].app.app_out.sizeXYZ();
            maxSizes.select2(size, (was,cur) => Math.max(was,cur));
            sumSizes.select2(size, (was,cur) => (was + cur));
        }
        var finalSize = maxSizes.clone();
        finalSize[this.axis] = sumSizes[this.axis];
        var maxSize = finalSize.clone();

        // then layout
        var to = this.app.app_out;
        to.resize(finalSize.x,finalSize.y,finalSize.z, ' ');
        var runningOffset = string3_utils.xyz(0,0,0);
        var drawOffset = runningOffset.clone();
        for (var si in this.stackedApps) {
            var stackItem = this.stackedApps[si];
            var src = stackItem.app.app_out;
            var srcSize = src.sizeXYZ();

            maxSize.copy(finalSize);
            maxSize[this.axis] = srcSize[this.axis];
            drawOffset.copy(maxSize).minus(srcSize);
            drawOffset.z = 0;
            if ((!stackItem.align) || (stackItem.align == "center")) {
                drawOffset.select(k => Math.floor(k/2));
            } else if (stackItem.align == "start") {
                drawOffset.set(0,0,0);
            } else if (stackItem.align == "end") {
                // already there
            } else {
                throw new "Unknown alignment type '" + stackItem.align + "' ";
            }
            drawOffset.add(runningOffset);
            stackItem.offset.copy(drawOffset);

            runningOffset[this.axis] += srcSize[this.axis];
        }
    },
    _labelApp : function(text) {
        var app = lewdo_app();
        if (false) {
            app.app_out.copy(string3(text));
        } else {
            app.app_in.subscribe((input) => {
                var output = app.app_out;
                output.copy(string3(text));
                if (input.offset && output.isValidXYZ(input.offset)) {
                    output.setByXYZ("*",input.offset);
                }
                output.frameStep();
            });
        };
        return app;
    },
    _buttonApp : function(text) {
        var app = lewdo_app();
        lewdo_button_app(app, string3(text), () => {
            console.log("stack button clicked");
        });
        return app;
    },
};

lewdo.apps.shapes.stack = lewdo_stack.app;
