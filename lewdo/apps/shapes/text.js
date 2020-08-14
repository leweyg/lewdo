
var lewdo_text = {
    toString3 : function(str) {
        var info = lewdo_text.tokenize_text( str.toString() );
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

    _symbolPairs : {
        "(":{delta:1,pair:")"},
        ")":{delta:-1,pair:"("},
        "{":{delta:1,pair:"}"},
        "}":{delta:-1,pair:"{"},
        "[":{delta:1,pair:"]"},
        "]":{delta:-1,pair:"["},
        "\"":{delta:0,pair:"\""},
        "'":{delta:0,pair:"'"},
    },

    tokens_arrange_depth : function(tokenInfo) {
        var knownWords = {};
        var knownWordsCount = 0;
        var tokens = tokenInfo.tokens;
        var pairStack = [];
        // first arrange words
        for (var ti=0; ti<tokens.length; ti++) {
            var t = tokens[ti];
            if (t.type == "words") {
                if (!(t.text in knownWords)) {
                    knownWords[t.text] = knownWordsCount+1;
                    knownWordsCount++;
                }
                t.pos.z = knownWords[t.text];
            }
        }
        // then arrange other things:
        var recentZ = 0;
        for (var ti=0; ti<tokens.length; ti++) {
            var t = tokens[ti];
            if (t.type != "words") {
                t.pos.z = recentZ; //knownWordsCount;
                if (t.text in this._symbolPairs) {
                    var sym = this._symbolPairs[t.text];
                    if (pairStack.length > 0) {
                        var top = pairStack[pairStack.length-1];
                        if (top.sym.pair == t.text) {
                            var toZ = top.token.pos.z;
                            t.pos.z = toZ;
                            recentZ = toZ;
                            pairStack.pop();
                        } else {
                            pairStack.push({token:t,sym:sym});
                        }
                    } else {
                        pairStack.push({token:t,sym:sym});
                    }
                }
            } else {
                recentZ = t.pos.z;
            }
        }
        tokenInfo.size.z = knownWordsCount+1;
    },

    tokenize_line : function(line_str) {
        var result = [ ];
        if (line_str.length < 1)
            return result;

        var startIndex = 0;
        var startType = lewdo_text.char_type(line_str[startIndex]);
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
            var nextType = lewdo_text.char_type(line_str[startIndex+startCount]);
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
                var lineTokens = lewdo_text.tokenize_line( lines[li] );
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
        var result = {
            tokens : result,
            size : size,
        };
        lewdo_text.tokens_arrange_depth( result );
        return result;
    },

    app : function(_app) {
        _app.app_in.subscribe((input) => {
            var str = "";
            if (input.width == 0) {
                str = lewdo_text._exampleText;
            } else {
                str = input.toString();
            }
            var str3 = lewdo_text.toString3( str );
            _app.app_out.copy( str3 );
            _app.app_out.frameStep();
        });
    },

    _exampleText : "function helloWorld(app) {\n    app.app_in.subscribe((input) => {\n        app.app_out.copy(input);\n        app.app_out.frameStep();\n    });\n}",

};

lewdo.all_apps.shapes.text = lewdo_text.app;



