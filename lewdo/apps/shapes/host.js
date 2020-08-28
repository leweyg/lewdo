
var lewdo_host = {
    create : function(app) {
        var host = Object.create(lewdo_host._lewdo_host_prototype);
        host.setup(app || lewdo_app());
        return host;
    },
    app : function(app,initialApps) {
        var host = lewdo_host.create(app);
        if (initialApps) {
            for (var si in initialApps) {
                host.pushApp(initialApps[si]);
            }
        }
        host.redraw();
        app.app_in.subscribe((input) => {
            host.recieveInput(input);
        });
        return host;
    },
    _lewdo_host_prototype : {
        stackedApps : [],
        app : lewdo_app(),
        currentFocusItem : lewdo_app(),
        setup : function(app) {
            this.stackedApps = [];
            this.app = app;
            this.currentFocusItem = null;
        },
        pushAppBase : function(app) {
            var item = {
                app:app,
                index:(this.stackedApps.length),
                offset : string3_utils.xyz(),
            }
            this.stackedApps.push(item);
            var _this = this;
            app.app_out.subscribe(() => {
                _this.redraw();
            });
            return item;
        },
        pushApp : function(app) {
            return this.pushAppBase(app);
        },
        redraw : function() {
            this.layout();
            this.render();
        },
        layout : function() {
            // customize
        },
        render : function() {
            this.app.app_out.clear(" ");
            for (var si in this.stackedApps) {
                var sapp = this.stackedApps[si];
                this.app.app_out.drawString3XYZ(sapp.app.app_out,sapp.offset);
            }
            this.app.app_out.frameStep();
        },

        recieveInput : function(input) {
            this.layout();
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
};

lewdo.apps.shapes.host = lewdo_host.app;

