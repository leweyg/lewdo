
var lewdo_host = {
    create : function(app) {
        var host = Object.create(lewdo_host._lewdo_host_prototype);
        host.setup(app || lewdo_app());
        return host;
    },
    app : function(app,initialApps) {
        app = (app || lewdo.app());
        var host = lewdo_host.create(app);
        if (initialApps) {
            for (var si in initialApps) {
                host.pushApp(initialApps[si]);
            }
        }
        app.app_in.subscribe((input) => {
            host.recieveInput(input);
        }, () => {
            host.recieveInputDone();
        });
        host.redraw();
        return host;
    },
    _lewdo_host_prototype : {
        stackedApps : [],
        app : lewdo_app(),
        debug : false,
        currentFocusItem : lewdo_app(),
        _isUpdating : false,
        _needsRedraw : false,
        _skippedRedraws : 0,
        _tempInput : null,
        setup : function(app) {
            this.stackedApps = [];
            this.app = app;
            this.currentFocusItem = null;
        },
        pushAppBase : function(app) {
            console.assert(app.app_in);
            var item = {
                app:app,
                index:(this.stackedApps.length),
                offset : string3_utils.xyz(),
                obser : null,
            }
            this.stackedApps.push(item);
            var _this = this;
            item.obser = app.app_out.subscribe(() => {
                _this._needsRedraw = true;
                if (!_this._isUpdating) {
                    _this.redraw();
                } else {
                    // skipping redraw for now...
                    _this._skippedRedraws++;
                }
            }, () => {
                if (item.obser) {
                    item.obser.dispose();
                    item.obser = null;
                }
            });
            return item;
        },
        pushApp : function(app) {
            return this.pushAppBase(app);
        },
        redraw : function() {
            this._needsRedraw = false;
            this.layout();
            this.render();
            this.checkDebug();
        },
        layout : function() {
            // customize
        },
        renderBase : function() {
            this.app.app_out.clear(" ");
            for (var si in this.stackedApps) {
                var sapp = this.stackedApps[si];
                this.app.app_out.drawString3XYZ(sapp.app.app_out,sapp.offset);
            }
        },
        checkDebug : function() {
            if (!this.debug) return;
            var status = "";
            for (var si in this.stackedApps) {
                var sapp = this.stackedApps[si];
                status += "appX" + sapp.app.app_out.sizeXYZ().toString() + "@" + sapp.offset.toString() + "|";
            }
            console.log(status);
        },
        render : function() {
            this.renderBase();
            this.app.app_out.frameStep();
        },
        recieveInput : function(input) {
            this._isUpdating = true;
            this._skippedRedraws = 0;

            this._recieveInputInner(input);

            this._isUpdating = false;
            if (this._needsRedraw) {
                this._needsRedraw = false;
                this.redraw();
            }
        },
        recieveInputDone : function() {
            for (var si in this.stackedApps) {
                var item = this.stackedApps[si];
                item.app.app_in.dispose();
            }
        },
        _recieveInputInner : function(input) {
            this.layout();
            var originalOffset = input.offset;
            var t = string3_utils.xyz();
            var didSend = false;
            if (input.width == 0) {
                if (!input.scroll.isZero()) {
                    var focus = this.currentFocusItem;
                    if (this.stackedApps.length>0) {
                        focus = this.stackedApps[0];
                    }
                    if (focus != this.currentFocusItem) {
                        this._clearCurrentFocus();
                    }
                    if (!focus) return;
                    this.currentFocusItem = focus;
                    var sapp = focus.app;
                    sapp.app_in.copy(input);
                    sapp.app_in.frameStep();
                    return;
                }
                this._clearCurrentFocus();
                return;
            }
            if (input.width == 1) {
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
                        if (!this._tempInput) {
                            this._tempInput = input.clone();
                        }
                        this._tempInput.copy(input);
                        this._tempInput.offset = t;
                        sapp.app_in.copy(this._tempInput);
                        sapp.app_in.frameStep();
                    }
                }
            }
            if (input.width > 1) {
                console.log("Input > 1: ");
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

