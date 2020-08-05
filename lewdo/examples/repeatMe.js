
    function repeatMe(app) {
        var lines = ["type:"];
        var xyz = string3_utils.xyz;
        var redraw = function() {
            var result = "";
            for (var i=0; i<lines.length; i++) {
                for (var j=0; j<i; j++) {
                    result += "\n";
                }
                result += lines[i] + "\v";
            }
            app.app_out.copy(string3(result));
            app.app_out.frameStep();
        };
        app.app_in.subscribe((input) => {
            if (input.width != 0) {
                var str = "";
                for (var i=0; i<input.width; i++) {
                    str += input.getBySeperateXYZ(i,0,0);
                }
                var writeIndex = lines.length-1;
                if (str == "\n" || str == "Enter") {
                    //lines.splice(0,0,"");
                    lines.push("");
                } else if (str.length == 1) {
                    lines[writeIndex] += str;
                } else if (str == "Backspace") {
                    var str = lines[writeIndex];
                    if (str.length > 0) {
                        str = str.substr(0,str.length-1);
                        lines[writeIndex] = str;
                    }
                }
                redraw();
            }
        });
        redraw();
    }
    lewdo_app_prototype.all_apps.apps["repeatMe"] = repeatMe;
    