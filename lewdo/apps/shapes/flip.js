
var lewdo_flip = {
    flipAxes_Identity : {
        x:"x", y:"y", z:"z",
    },
    flipAxes_YZ : {
        x:"x", y:"z", z:"y",
    },
    flipString3 : function(axes,str3,into) {
        var plan = lewdo_flip._planFromAxes(axes);
        var newSize = this._planApplyToXYZ( plan, str3.sizeXYZ().clone() );
        into = (into || string3());
        into.resizeXYZ(newSize);
        var t = string3_utils.xyz();
        str3.visitEachXYZ((val,pos) => {
            t.copy(pos);
            t = this._planApplyToXYZ( plan, t, newSize );
            into.setByXYZ(val, t);
        });
        return into;
    },
    _planApplyToXYZ : function(plan,xyz,size) {
        var ans = string3_utils.xyz();
        ans.x = xyz[plan.x.to];
        ans.y = xyz[plan.y.to];
        ans.z = xyz[plan.z.to];
        if (size) {
            if (plan.x.flip) ans.x = size.x - ans.x - 1;
            if (plan.y.flip) ans.y = size.y - ans.y - 1;
            if (plan.z.flip) ans.z = size.z - ans.z - 1;
        }
        return ans;
    },
    _planFromAxes : function(axes) {
        var plan = {
            x : {from:"x",to:"x",flip:false},
            y : {from:"y",to:"y",flip:false},
            z : {from:"z",to:"z",flip:false},
        };
        for (var fromAxis in axes) {
            var toRaw = axes[fromAxis];
            var toAxis = toRaw.replace("-","");
            plan[fromAxis].to = toAxis;
            plan[toAxis].flip = toRaw.includes("-");
        }
        return plan;
    },

    app : function(_app,flipFormat=null) {
        flipFormat = (flipFormat || {y:"-z",z:"y"} );
        _app.app_in.subscribe((input) => {
            var str = input.toString();
            if (str == "") {
                str = "flip\v\nthis";
            }
            var str3 = string3( str );
            lewdo_flip.flipString3(flipFormat, str3, _app.app_out );
            _app.app_out.frameStep();
        });
    },

    app_demo : function(_app) {
        _app = (_app || lewdo_app());
        var testInput = string3( "Hello\v\nWorld" );
        var testTransform = {y:"-y"};
        var flipped = lewdo_flip.flipString3(testTransform, testInput);
        _app.app_out.copy( flipped );
        _app.app_out.frameStep();
    },
}

lewdo.apps.shapes.flip = lewdo_flip.app;

