
var lewdo_textfile = {
    toString3 : function(str) {
        var info = lewdo_textfile.tokenize_text( str.toString() );
        var result = string3();
        result.resizeXYZ(info.size);

        var tokens = info.tokens;
        for (var ti=0; ti<tokens.length; ti++) {
            var token = tokens[ti];
            result.drawTextXYZ(token.text, token.pos);
        }

        return result;
    },

    char_type : function(letter) {
        console.assert( letter.length == 1);
        if (letter.trim()=='') {
            return "space";
        }
        if ((letter >= '0') && (letter <= '1'))
            return "digit";
        if ( ((letter >= 'a') && (letter <= 'z')) || ((letter >= 'A') && (letter <= 'Z')) )
            return "words";
        if (letter == "_")
            return "words";
        return "symbol";
    },

    tokenize_line : function(line_str) {
        var result = [ ];
        if (line_str.length < 1)
            return result;

        var startIndex = 0;
        var startType = lewdo_textfile.char_type(line_str[startIndex]);
        var startCount = 1;
        var pushCurrent = (() => {
            var str = line_str.substr(startIndex, startCount);
            result.push({
                text:str,
                pos:string3_utils.xyz(startIndex,0,0),
                type:startType,
            });
        });

        while ((startIndex + startCount) < line_str.length) {
            var nextType = lewdo_textfile.char_type(line_str[startIndex+startCount]);
            if ((nextType == startType) && (startType != "symbol")) {
                startCount++;
                continue;
            }
            pushCurrent();
            startIndex += startCount;
            startCount = 1;
            startType = nextType;
        }
        pushCurrent();
        return result;
    },

    tokenize_text : function(str) {
        var pages = str.split("\v");
        var result = [];
        var size = string3_utils.xyz();
        for (var pi=0; pi<pages.length; pi++) {
            size.z = Math.max(size.z,pi+1);
            var lines = pages[pi].split("\n");
            for (var li=0; li<lines.length; li++) {
                size.y = Math.max(size.y,li+1);
                var lineTokens = lewdo_textfile.tokenize_line( lines[li] );
                for (var ti=0; ti<lineTokens.length; ti++) {
                    var token = lineTokens[ti];
                    token.pos.y = li;
                    token.pos.z = pi;
                    var endX = token.pos.x + token.text.length;
                    size.x = Math.max(size.x,endX);
                    result.push(token);
                }
            }
        }
        return {
            tokens : result,
            size : size,
        };
    },

    app : function(_app) {
        _app.app_in.subscribe((input) => {
            var str = input.toString();
            if (input.width == 0) {
                str = "Hello(World);";
            }
            var str3 = lewdo_textfile.toString3( str );
            _app.app_out.copy( str3 );
            _app.app_out.frameStep();
        });
    },
};

lewdo_app_prototype.all_apps.system["textfile"] = lewdo_textfile.app;


