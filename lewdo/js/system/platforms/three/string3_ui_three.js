
var string3_three = {
    _topChildren : {
        "elementPtr":{ element:null, source3:null, pageElements:[], pageContents:[] },
    },
    _mainApp : null,
    setMainApp : function(parentElement,app) {
        string3_three._mainApp = app;
        string3_three.setInnerString3(parentElement,app.app_out);
    },
    setInnerString3 : function(parent,str3) {
        console.assert(false); // TODO
    },
    _previousPageSize : string3_utils.xyz(),
    _updatePageText : function(element) {
        if (!element) {
            for (var ei in string3_three._topChildren) {
                var eInfo = string3_three._topChildren[ei];
                if (eInfo.element) {
                    element = eInfo.element;
                    break;
                }
            }
            console.assert(element);
        }
        var info = string3_three._topChildren[element];
        var str3 = info.source3;
        element.style["font-size"] = this.fontSizeForString3(str3);
        var pageContents = info.pageContents;
        //console.assert(pageContents.length == str3.depth);
        for (var z=0; z<pageContents.length; z++) {
            if (z >= str3.depth) {
                pageContents[z].style.display = "none";
                continue;
            }
            var ans = "";
            for (var y=0; y<str3.height; y++) {
                for (var x=0; x<str3.width; x++) {
                    var i = str3.indexFromSeperateXYZ(x,y,z);
                    var v = str3.array1d[i];
                    ans += v;
                }
                ans += "\n";
                //ans += "<br/>";
            }
            pageContents[z].innerHTML = ans;
            pageContents[z].style.display = "inline";
        }
        if ((this._previousPageSize.x != str3.width)
            || (this._previousPageSize.y != str3.height)) {
            this._previousPageSize.set(str3.width, str3.height, str3.depth);

            // page contents:
            if (info.pageSpacer) {
                var line = string3_utils.repeatString(" ",str3.width) + "\n";
                var rows = string3_utils.repeatString(line,str3.height);
                info.pageSpacer.innerHTML = rows;
            }


            // update the rendering:
            this._updatePageTransforms(element);
        }
    },
    _update_isDirty : false,
    _update_isUpdating : false,
    _update_skippedCount : 0,
    _updateBegin : function() {
        this._update_isUpdating = true;
    },
    _updateRequest : function() {
        this._update_isDirty = true;
        if (this._update_isUpdating) {
            this._update_skippedCount++;
        } else {
            this._updateEnd();
        }
    },
    _updateEnd : function() {
        this._update_isUpdating = false;
        if (this._update_isDirty) {
            this._update_isDirty = false;
            this._updatePageText();
        }
    },
    _processTopElementCache : {
        posXYZ : string3_utils.xyz(),
        topElement : null,
    },
    _rotationDisabled : false,
    _processTopElementMouseEvent : function(element,moveEvent,isButtonChange) {
        var _this = this;
        var topElement = this._processTopElementCache.topElement;
        var tp = this._processTopElementCache.posXYZ;
        var str3 = _this._topChildren[element].source3;
        var x = 0.5 + (moveEvent.offsetX || moveEvent.clientX);
        var y = 0.5 + (moveEvent.offsetY || moveEvent.clientY);
        tp.x = Math.floor( x / ( topElement.scrollWidth / str3.width ) );
        tp.y = Math.floor( y / ( topElement.scrollHeight / str3.height ) );
        tp.z = 0;
        tp.x = Math.max(0, tp.x);
        tp.y = Math.max(0, tp.y);
        var isDown = !(!(moveEvent.buttons));
        if (isDown) {
            var btns = moveEvent.buttons;
            if (btns == 2) {
                // actual click
                isDown = false;
                //this._rotationDisabled = !this._rotationDisabled;
            }
        }
        this.doAppSingleTouchInput(isDown,tp);
    },
    _valuesByName : {},
    nameByValue : function(value) {
        var name = "_named_id" + ( Object.keys(string3_three._valuesByName).length );
        string3_three._valuesByName[name] = value;
        return name;
    },
    valueByName : function(name) {
        return string3_three._valuesByName[name];
    },
    _doButtonCallback : function(cbName,letter,x,y,z) {
        var callback = string3_three.valueByName(cbName);
        callback(letter,x,y,z);
    },
    toHTML_Buttons : function(str3,callback) {
        var ans = "<center><table >";
        var callbackName = string3_three.nameByValue(callback);
        str3.visitEach((letter,x,y,z) => {
            if (x == 0) {
                ans += "<tr >";
            } 
            ans += "<td >";
            if (letter != " ") {
                var act = " onclick=\"string3_three._doButtonCallback('" + callbackName + "','" + letter + "'," + x + "," + y + "," + z + ");\" ";
                var styles = "style='width:100%;' class='lewdo_keybutton' ";
                ans += "<input type='button' " + act + " value='" + letter + "' " + styles + " ></input>";
            }
            ans += "</td>";
            if (x == str3.width-1) {
                ans += "</tr>";
            }
        });
        ans += "</table></center>";
        return ans;
    },
    _global_elementCount : 0,
    toHTML_Text : function(str3) {
        var ans = "<div><p><pre><code>";
        var x=0, y=0, z=0;
        str3.visitEach((c,fx,fy,fz) => { 
            if (z != fz) {

                ans += "\n--layer--\n";

                z = fz;
                y = fy;
            }
            else if (y != fy) {
                ans += "\n";
                y = fy;
            }
            ans += c; 
        });
        ans += "</code></pre></p></div>";
        return ans;
    },
    keyDirectionToXYZ : {
        //←→↑↓\n←►\n 
        "ArrowLeft":string3_utils.xyz(-1,0,0),
        "ArrowRight":string3_utils.xyz(1,0,0),
        "ArrowUp":string3_utils.xyz(0,-1,0),
        "ArrowDown":string3_utils.xyz(0,1,0),
        "←":string3_utils.xyz(-1,0,0),
        "→":string3_utils.xyz(1,0,0),
        "↑":string3_utils.xyz(0,-1,0),
        "↓":string3_utils.xyz(0,1,0),
        "-":string3_utils.xyz(0,0,-1),
        "+":string3_utils.xyz(0,0,1),
    },
    doAppKeyInput : function(isDown,key) {
        var app = string3_three._mainApp;

        if (isDown) {
            if (key in string3_three.keyDirectionToXYZ) {
                app.app_in_reset(0);
                app.app_in.scroll.copy( string3_three.keyDirectionToXYZ[key] );
                app.app_in.frameStep();
            } else {
                app.app_in_reset(1);
                app.app_in.array1d[0] = key;
                app.app_in.frameStep();
            }
        } else {
            app.app_in_reset(0);
            app.app_in.frameStep();
        }
    },
    _latestTouchInput : {isDown:false, posXYZ:string3_utils.xyz() },
    doAppSingleTouchInput : function(isDown,xyz) {
        
        var prev = this._latestTouchInput;
        if ((prev.isDown==isDown) && (prev.posXYZ.equals(xyz)))
            return;
        prev.isDown = isDown;
        prev.posXYZ.copy(xyz);

        //return; // TODO: enable this next:

        this._updateBegin();

        var app = string3_three._mainApp;
        app.app_in_reset(1);
        app.app_in.array1d[0] = (isDown ? lewdo.letter.touch : lewdo.letter.hover );
        app.app_in.offset.copy(xyz);
        app.app_in.frameStep();
        
        this._updateEnd();
    },
    onKeyChange : function(isDown,event,element) {
        //console.log("Key code=" + event.code + " key=" + event.key + " isDown=" + isDown);
        //if (isDown)
            this.doAppKeyInput(isDown,event.key);
    },
    getPageElements : function(element) {
        var layers = this._topChildren[element];
        if (!layers) {
            layers = document.getElementsByClassName('page_slice');
            this._topChildren[element] = layers;
        }
        return layers;
    },
    onTouchEventTop : function(evnt,element,isDown) {
        evnt.preventDefault();
        for (var ti=0; ti<evnt.touches.length; ti++) {
            this.onMouseMoveTop(evnt.touches[ti],element);
        }
    },
    recentAngle : string3_utils.xyz(),
    lerp : function(a,b,t) {
        return ((b*t)+(a*(1.0-t)));
    },
    onMouseMoveTop : function(evnt,element) {
        // camera stuff
    },
};