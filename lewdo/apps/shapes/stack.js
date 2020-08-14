
var lewdo_stack = {
    create : function(app) {
        var stack = Object.create(lewdo_stack._lewdo_stack_prototype);
        stack.setup(app || lewdo_app());
        return stack;
    },
    app : function(app,stackOfApps) {
        var stack = lewdo_stack.create(app);
        if (!stackOfApps) {
            stack.pushApp(lewdo_stack._labelApp("Heading"));
            stack.pushApp(lewdo_stack._labelApp("Next"));
            stack.pushApp(lewdo_stack._labelApp("\vAnd Last"));
        }
        stack.redraw();
        app.app_in.subscribe((input) => {
            stack.redraw();
        });
    },
    _lewdo_stack_prototype : {
        stackedApps : [],
        myApp : lewdo_app(),
        axis : "y",
        pushApp : function(app) {
            this.stackedApps.push(app);
        },
        redraw : function() {
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
                to.drawString3XYZ(src, drawOffset);
                drawOffset[this.axis] += src.sizeXYZ()[this.axis];
            }
            to.frameStep();
        },
        setup : function(app) {
            this.stackedApps = [];
            this.myApp = app;
        },
    },
    _labelApp : function(text) {
        var app = lewdo_app();
        app.app_out.copy(string3(text));
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

//lewdo.all_apps.shapes["stack"] = lewdo_stack.app;