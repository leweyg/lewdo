
var lewdo_hike = {
    create : function(app) {
        var hike = Object.create(lewdo_hike.lewdo_hike_prototype);
        hike.setup(app || lewdo_app());
        return hike;
    },
    app : function(_app) {
        var hike = lewdo_hike.create(_app);
        return hike;
    },
    lewdo_hike_prototype : {
        app : lewdo_app(),

        setup : function(_app) {
            this.app = _app;
            this.app.app_out.copy(string3("\nhike\vlewdo"));
        }
    }
};

lewdo.apps.games.hike = lewdo_hike.app;

