    function helloWorld(app) {
        app.app_out.copy(string3("Hello\v\nWorld"));
        app.app_out.frameStep();
    }
    lewdo_app_prototype.all_apps.apps["helloWorld"] = helloWorld;