
var string3_ui = {
    _topChildren : {
        "elementPtr":{ element:null, source3:null, pageElements:[], pageContents:[] },
    },
    _mainApp : null,
    setMainApp : function(parentElement,app) {
        string3_ui._mainApp = app;
        string3_ui.setInnerString3(parentElement,app.app_out);
    },
    setInnerString3 : function(parent,str3) {
        var name = "";
        var html = string3_ui.toHTML(str3, function(elName){name = elName;});
        parent.innerHTML = html;
        var element = document.getElementById(name);
        string3_ui._setup_element(element,str3);
        return element;
    },
    toHTML : function(str3, nameGetter) {
        var ans = "";  
        var myname = "string3_element_" + (string3_ui._global_elementCount++);
        if (nameGetter) nameGetter(myname);

        var events = " ";// " onmousemove='string3_ui.onMouseMoveTop(event,this)' "; 
        document.onmousemove = ((event) => { string3_ui.onMouseMoveTop(event,document.getElementById(myname)); });


        ans += "<div id='" + myname + "' class='page_top'  style='position: relative;' " + events + " >";
        x=-1; y=-1; z=-1;
        var pagesToMake = 16;
        for (var fz=pagesToMake; fz>=0; fz--) {
            var clr = 'black';//(fz == 0) ? 'black' : 'lightgray';
            var opacity = 1.0 - (fz / (pagesToMake + 1));
            opacity = Math.pow(opacity,1.61);
            var style = "position:absolute;transform-origin : 50% 50%;opacity:" + opacity + ";color:" + clr + ";";
            if (fz != 0) style += "pointer-events: none;"

            ans += "<div class='page_slice'  data-zdepth=" + fz + " style='" + style + "' >";
            ans += "<pre style='margin:0px;'>";
            ans += "<code class='page_content'>";
            if (fz < str3.depth) {
                for (var fy=0; fy<str3.height; fy++) {
                    for (var fx=0; fx<str3.width; fx++) {
                        var c = str3.array1d[str3.indexFromSeperateXYZ(fx,fy,fz)];
                        ans += c;
                    }
                    //ans += "<br/>";
                }
            }
            ans += "</code></pre></div>";
        }
        if (true) {
            var sizer = "<div><pre style='margin:0px;'><code class='page_sizer'>";
            for (var fy=0; fy<pagesToMake; fy++) {
                sizer += "\n - ";
            }
            sizer += "</code></pre></div>";
            ans += sizer;
        }

        ans += "</div>";
        return ans;
    },
    fontSizeForString3 : function(str3) {
        var pixelSize = Math.max( str3.height, str3.width );// Math.max(str3.width, Math.max(str3.height, str3.depth));
        var fontSize =  ((pixelSize - 8)*(-1)) + 24;
        fontSize = Math.max( fontSize, 12 );
        fontSize = Math.min( fontSize, 50 );
        fontSize = Math.floor(fontSize) + "px";
        console.log("PixelSize=" + pixelSize + " fontSize=" + fontSize);
        return fontSize;
    },
    _previousPageSize : string3_utils.xyz(),
    _updatePageText : function(element) {
        var info = string3_ui._topChildren[element];
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
    _setup_element : function(element,str3) {
        var _this = this;
        
        var pageElementsQuery = element.getElementsByClassName('page_slice');
        var pageSpacers = element.getElementsByClassName( 'page_sizer' );
        var pageSpacer = ((pageSpacers.length > 0) ? pageSpacers[0] : null);
        var pageElements = [];
        for (var pi=0; pi<pageElementsQuery.length; pi++) {
            pageElements.push( pageElementsQuery[pi] );
        }
        pageElements.sort( (a,b) => { 
            return a.dataset.zdepth - b.dataset.zdepth; 
        } );
        var pageContents = [];
        for (var pi in pageElements) {
            var content_list = pageElements[pi].getElementsByClassName('page_content');
            var content = content_list[0];
            pageContents.push(content);
        }
        string3_ui._topChildren[element] = { 
            element:element, 
            source3:str3, 
            pageElements:pageElements,
            pageContents:pageContents,
            pageSpacer:pageSpacer };
        str3.subscribe(() => {
            this._updatePageText(element,str3);
        });

        document.onkeydown = (event) => { 
            string3_ui.onKeyChange(true,event,element);
            return false; };
        document.onkeyup = (event) => { 
            string3_ui.onKeyChange(false,event,element);
            return false; };

        element.ontouchstart = (evnt) => { 
            string3_ui.onTouchEventTop(evnt,element,true); 
            return false; };
        element.ontouchmove = (evnt) => { 
            string3_ui.onTouchEventTop(evnt,element,true); 
            return false; };
        element.ontouchend = (evnt) => { 
            string3_ui.onTouchEventTop(evnt,element,false); 
            return false; };

        var supportLewdoTouch = true; // TODO: set to true
        if (supportLewdoTouch) {
            var topElement = pageElements[0];
            var topEventPos = string3_utils.xyz();
            topElement.onmousemove = ((moveEvent) => {
                _this._processTopElementMouseEvent(element,moveEvent,false);
            });
            topElement.onmousedown = ((moveEvent) => {
                _this._processTopElementMouseEvent(element,moveEvent,true);
            });
            topElement.onmouseup = ((moveEvent) => {
                _this._processTopElementMouseEvent(element,moveEvent,true);
            });
            this._processTopElementCache.topElement = topElement;
        }

        //element.addEventListener("ontouchmove",(event) => { string3_ui.onTouchEventTop(event,element,true); return false; }, { passive: false } );
        //element.addEventListener("ontouchend",(event) => { string3_ui.onTouchEventTop(event,element,false); return false; }, { passive: false } );
        //document.ontouchmove = ((event) => { string3_ui.onTouchEventTop(event,document.getElementById(myname),true); });
        //document.ontouchend = ((event) => { string3_ui.onTouchEventTop(event,document.getElementById(myname),false); });

        //string3_ui.onMouseMoveTop({},element);
    },
    _processTopElementCache : {
        posXYZ : string3_utils.xyz(),
        topElement : null,
    },
    _processTopElementMouseEvent : function(element,moveEvent,isButtonChange) {
        var _this = this;
        var topElement = this._processTopElementCache.topElement;
        var tp = this._processTopElementCache.posXYZ;
        var str3 = _this._topChildren[element].source3;
        tp.x = Math.floor( moveEvent.offsetX / ( topElement.scrollWidth / str3.width ) );
        tp.y = Math.floor( moveEvent.offsetY / ( topElement.scrollHeight / str3.height ) );
        tp.z = 0;
        tp.x = Math.max(0, tp.x);
        tp.y = Math.max(0, tp.y);
        var isDown = (moveEvent.buttons != 0);
        this.doAppSingleTouchInput(isDown,tp);
    },
    _valuesByName : {},
    nameByValue : function(value) {
        var name = "_named_id" + ( Object.keys(string3_ui._valuesByName).length );
        string3_ui._valuesByName[name] = value;
        return name;
    },
    valueByName : function(name) {
        return string3_ui._valuesByName[name];
    },
    _doButtonCallback : function(cbName,letter,x,y,z) {
        var callback = string3_ui.valueByName(cbName);
        callback(letter,x,y,z);
    },
    toHTML_Buttons : function(str3,callback) {
        var ans = "<center><table >";
        var callbackName = string3_ui.nameByValue(callback);
        str3.visitEach((letter,x,y,z) => {
            if (x == 0) {
                ans += "<tr >";
            } 
            ans += "<td >";
            if (letter != " ") {
                var act = " onclick=\"string3_ui._doButtonCallback('" + callbackName + "','" + letter + "'," + x + "," + y + "," + z + ");\" ";
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
        var app = string3_ui._mainApp;

        if (isDown) {
            if (key in string3_ui.keyDirectionToXYZ) {
                app.app_in_reset(0);
                app.app_in.scroll.copy( string3_ui.keyDirectionToXYZ[key] );
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

        var app = string3_ui._mainApp;
        app.app_in_reset(1);
        app.app_in.array1d[0] = (isDown ? lewdo.letter.touch : lewdo.letter.hover );
        app.app_in.offset.copy(xyz);
        app.app_in.frameStep();
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
        var layers = this.getPageElements(element).pageElements;

        // page level:
        
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        var fx = evnt.clientX ? ( evnt.clientX / w) : 0.5;
        var fy = evnt.clientY ? ( evnt.clientY / h ) : 0.5;
        var maxAngle = 120.0;
        var scl = maxAngle;
        if (fx == 0.5) {
            console.log("Zero???");
        }
        var angleX = (fy - 0.5) * scl;
        var angleY = (fx - 0.5) * -scl;
        var lt = 0.2;
        this.recentAngle.x = this.lerp(this.recentAngle.x, angleX, lt);
        this.recentAngle.y = this.lerp(this.recentAngle.y, angleY, lt);
        
        this._updatePageTransforms(element);
    },
    _updatePageTransforms : function(element) {
        var info = this.getPageElements(element);
        var layers = info.pageElements;
        var spacer = info.pageSpacer;

        var angleX = this.recentAngle.x;
        var angleY = this.recentAngle.y;
        //var angleNow = string3_utils.xyz();

        var maxAngle = Math.max( angleX, angleY );
        var offset = 0; //maxAngle * -1.5;

        // element level:
        w = spacer.offsetWidth;
        h = spacer.offsetHeight;

        var storedSeq = "";

        var depthScaling = Math.min( 10, (120 / info.source3.depth) );

        

        for (var i=0; i<layers.length; i++) {
            var el = layers[i];
            var index = el.dataset.zdepth;
            //el.style.left = (dx * el.dataset.zdepth ) + "px";
            //el.style.top = (dy * el.dataset.zdepth ) + "px";

            var sequence = storedSeq;
            if (sequence == "") {
                if (info.source3.width < 22) {
                    sequence += " translate(120px,0px) ";
                }
                //sequence += " translate3d(" + Math.floor(-w/2) + "px, " + Math.floor(-h/2) + "px, 0px ) ";
                sequence += " perspective(450px) ";
                //sequence += " translateZ(-30px) ";
                
                //sequence += " translate3d(-" + (w/2) + "px, -" + (h/2) + "px, 0) ";
                sequence += " rotateY(" + angleY + "deg) ";
                sequence += " rotateX(" + angleX + "deg) ";
                
                storedSeq = sequence;
            }
            sequence += " translateZ(" + Math.floor( ( -depthScaling * index ) + offset ) + "px)";

            //sequence += " translate(" + (w/2) + "px, " + (h/2) + "px) ";

            el.style.transform = sequence;
        }
    },
};