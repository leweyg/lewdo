
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
        currentFocusItem : lewdo_app(),
        setup : function(app) {
            this.stackedApps = [];
            this.myApp = app;
            this.currentFocusItem = null;
        },
        pushApp : function(app) {
            this.stackedApps.push({
                app:app,
                index:(this.stackedApps.length),
                align:"center",
                offset : string3_utils.xyz(),
            });
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
                var size = this.stackedApps[si].app.app_out.sizeXYZ();
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
                var stackItem = this.stackedApps[si];
                var src = stackItem.app.app_out;
                stackItem.offset.copy(drawOffset);
                if (isRender) {
                    to.drawString3XYZ(src, drawOffset);
                }
                drawOffset[this.axis] += src.sizeXYZ()[this.axis];
            }
            if (isRender) {
                to.frameStep();
            }
        },

        recieveInput : function(input) {
            this.layoutAndRender(true); // to get size right
            var originalOffset = input.offset;
            var t = string3_utils.xyz();
            var didSend = false;
            if (input.width == 0) {
                this._clearCurrentFocus();
                return;
            }
            for (var si in this.stackedApps) {
                var stackItem = this.stackedApps[si];
                var sapp = stackItem.app;
                var aout = stackItem.app.app_out;
                t.copy(input.offset);
                t.minus(stackItem.offset);
                if (aout.isValidXYZ(t)) {
                    didSend = true;
                    if (this.currentFocusItem != stackItem) {
                        this._clearCurrentFocus();
                    }
                    this.currentFocusItem = stackItem;
                    input.offset = t;
                    sapp.app_in.copy(input);
                    sapp.app_in.frameStep();
                    input.offset = originalOffset;
                }
            }
            if (!didSend) {
                this._clearCurrentFocus();
            }
        },
        _clearCurrentFocus : function() {
            if (!this.currentFocusItem)
                return;
            this.currentFocusItem.app.app_in_reset();
            this.currentFocusItem.app.app_in.frameStep();
            this.currentFocusItem = null;
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

lewdo.all_apps.shapes["stack"] = lewdo_stack.app;
