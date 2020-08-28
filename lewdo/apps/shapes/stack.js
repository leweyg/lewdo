
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
        return stack;
    },
    _lewdo_stack_prototype : {
        stackedApps : [],
        app : lewdo_app(),
        axis : "y",
        currentFocusItem : lewdo_app(),
        setup : function(app) {
            this.stackedApps = [];
            this.app = app;
            this.currentFocusItem = null;
        },
        pushApp : function(app,align="center") {
            this.stackedApps.push({
                app:app,
                index:(this.stackedApps.length),
                align:align,
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
            var maxSize = finalSize.clone();

            // then draw
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
                if (stackItem.align == "center") {
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
                if (isRender) {
                    to.drawString3XYZ(src, drawOffset);
                }
                runningOffset[this.axis] += srcSize[this.axis];
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

lewdo.apps.shapes.stack = lewdo_stack.app;
