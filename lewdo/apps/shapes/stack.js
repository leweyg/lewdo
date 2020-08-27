
var lewdo_stack = {
    create : function(app) {
        var stack = Object.create(lewdo_stack._lewdo_stack_prototype);
        stack.setup(app || lewdo_app());
        return stack;
    },
    app : function(app,stackOfApps,axis) {
        var stack = lewdo_stack.create(app);
        if (!stackOfApps) {
            stack.pushApp(lewdo_stack._labelApp("Heading"));
            stack.pushApp(lewdo_stack._labelApp("Next"));
            stack.pushApp(lewdo_stack._labelApp("\vAnd Last"));
        } else {
            for (var si in stackOfApps) {
                stack.pushApp(stackOfApps[si]);
            }
        }
        if (axis)
            stack.axis = axis;
        stack.redraw();
        app.app_in.subscribe((input) => {
            stack.recieveInput(input);
        });
        return this;
    },
    _lewdo_stack_prototype : {
        stackedApps : [],
        myApp : lewdo_app(),
        axis : "y",
        pushApp : function(app) {
            this.stackedApps.push(app);

            var _this = this;
            app.app_out.subscribe(() => _this.redraw());
        },
        redraw : function() {
            this.layoutAndRender(true);
        },
        layoutAndRender : function(isRender) {
            // first measure:
            var maxSizes = string3_utils.xyz(1,1,1);
            var sumSizes = string3_utils.xyz(1,1,1);
            for (var si in this.stackedApps) {
                var size = this.stackedApps[si].app_out.sizeXYZ();
                maxSizes.select2(size, (was,cur) => Math.max(was,cur));
                sumSizes.select2(size, (was,cur) => (was + cur));
            }
            var finalSize = maxSizes.clone();
            finalSize[this.axis] = sumSizes[this.axis];

            // then draw
            var to = this.myApp.app_out;
            to.resize(finalSize.x,finalSize.y,finalSize.z, ' ');
            var drawOffset = string3_utils.xyz(0,0,0);
            for (var si in this.stackedApps) {
                var src = this.stackedApps[si].app_out;
                src.offset.copy(drawOffset);
                if (isRender) {
                    to.drawString3XYZ(src, drawOffset);
                }
                drawOffset[this.axis] += src.sizeXYZ()[this.axis];
            }
            if (isRender) {
                to.frameStep();
            }
        },
        setup : function(app) {
            this.stackedApps = [];
            this.myApp = app;
        },
        recieveInput : function(input) {
            this.layoutAndRender(true); // to get size right
            var originalOffset = input.offset;
            var t = string3_utils.xyz();
            for (var si in this.stackedApps) {
                var sapp = this.stackedApps[si];
                var aout = sapp.app_out;
                t.copy(input.offset);
                t.minus(aout.offset);
                if (aout.isValidXYZ(t)) {
                    input.offset = t;
                    sapp.app_in.copy(input);
                    sapp.app_in.frameStep();
                    input.offset = originalOffset;
                }
            }
        },
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

lewdo.all_apps.shapes["stack"] = lewdo_stack.app;
