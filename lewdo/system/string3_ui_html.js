
var string3_ui = {
    _topChildren : {
        "elementPtr":{ element:null, source3:null, pageElements:[], pageContents:[] },
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

            ans += "<div class='page_slice'  data-zdepth=" + fz + " style='position:absolute;opacity:" + opacity + ";color:" + clr + ";' ><p><pre><code class='page_content'>";
            if (fz < str3.depth) {
                for (var fy=0; fy<str3.height; fy++) {
                    for (var fx=0; fx<str3.width; fx++) {
                        var c = str3.array1d[str3.indexFromSeperateXYZ(fx,fy,fz)];
                        ans += c;
                    }
                    ans += "<br/>";
                }
            }
            ans += "</code></pre></p></div>";
        }
        ans += "</div>";
        for (var fy=0; fy<str3.height; fy++) {
            ans += "<br/><br/>";
        }
        return ans;
    },
    _updatePageText : function(element) {
        var info = string3_ui._topChildren[element];
        var str3 = info.source3;
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
                ans += "<br/>";
            }
            pageContents[z].innerHTML = ans;
            pageContents[z].style.display = "inline";
        }
    },
    _setup_element : function(element,str3) {
        
        var pageElementsQuery = element.getElementsByClassName('page_slice');
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
            pageContents:pageContents };
        str3.subscribe(() => {
            this._updatePageText(element,str3);
        });

        document.onkeydown = (event) => { 
            string3_ui.onKeyChange(true,event,element); };
        document.onkeyup = (event) => { 
            string3_ui.onKeyChange(false,event,element); };

        string3_ui.onMouseMoveTop({},element);
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
        var ans = "<table style='width:80%' >";
        var callbackName = string3_ui.nameByValue(callback);
        str3.visitEach((letter,x,y,z) => {
            if (x == 0) {
                ans += "<tr style='width:80%' >";
            } 
            ans += "<td style='width:25%;' >";
            if (letter != " ") {
                var act = " onclick=\"string3_ui._doButtonCallback('" + callbackName + "','" + letter + "'," + x + "," + y + "," + z + ");\" ";
                ans += "<input type='button' " + act + " value='" + letter + "' style='width:100%' ></input>";
            }
            ans += "</td>";
            if (x == str3.width-1) {
                ans += "</tr>";
            }
        });
        ans += "</table>";
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
        var app = lewdo_this_app;

        if (key in string3_ui.keyDirectionToXYZ) {
            app.app_in_reset(0);
            app.app_in.scroll.copy( string3_ui.keyDirectionToXYZ[key] );
            app.app_in.frameStep();
        } else {
            app.app_in_reset(1);
            app.app_in.array1d[0] = key;
            app.app_in.frameStep();
        }
    },
    onKeyChange : function(isDown,event,element) {
        //console.log("Key code=" + event.code + " key=" + event.key + " isDown=" + isDown);
        if (isDown)
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
    onMouseMoveTop : function(event,element) {
        var layers = this.getPageElements(element).pageElements;

        // page level:
        var fw = element.scrollWidth;
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        var fx = event.clientX ? ( event.clientX / w) : 0.5;
        var fy = event.clientY ? ( event.clientY / h ) : 0.5;
        var scl = 85.0;
        var angleX = (fy - 0.5) * scl;
        var angleY = (fx - 0.5) * -scl;

        // element level:
        w = layers[0].scrollWidth;
        h = layers[1].scrollHeight;

        for (var i=0; i<layers.length; i++) {
            var el = layers[i];
            var index = el.dataset.zdepth;
            //el.style.left = (dx * el.dataset.zdepth ) + "px";
            //el.style.top = (dy * el.dataset.zdepth ) + "px";

            var sequence = " translate(" + (fw/2) + "px, " + (h/2) + "px) ";
            sequence += "perspective(350px) ";
            sequence += " translate3d(-" + (w/2) + "px, -" + (h/2) + "px, 0) ";
            sequence += " rotateY(" + angleY + "deg) ";
            sequence += " rotateX(" + angleX + "deg) ";
            sequence += " translateZ(" + (-10 * index) + "px)";
            //sequence += " translate(" + (w/2) + "px, " + (h/2) + "px) ";

            el.style.transform = sequence;
        }
    },
};