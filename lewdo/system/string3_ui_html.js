
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

        var events = " onmousemove='string3_ui.onMouseMoveTop(event,this)' "; 
        ans += "<div id='" + myname + "' class='page_top'  style='position: relative;' " + events + " >";
        x=-1; y=-1; z=-1;
        for (var fz=str3.depth-1; fz>=0; fz--) {
            var clr = (fz == 0) ? 'black' : 'lightgray';

            ans += "<div class='page_slice'  data-zdepth=" + fz + " style='position:absolute; color:" + clr + "' ><p><pre><code class='page_content'>";
            for (var fy=0; fy<str3.height; fy++) {
                for (var fx=0; fx<str3.width; fx++) {
                    var c = str3.array1d[str3.indexFromSeperateXYZ(fx,fy,fz)];
                    ans += c;
                }
                ans += "<br/>";
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
        console.assert(pageContents.length == str3.depth);
        for (var z=0; z<str3.depth; z++) {
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
    },
    toHTML_Buttons : function(str3,callback) {
        var ans = "<table style='width:80%' >";
        str3.visitEach((letter,x,y,z) => {
            if (x == 0) {
                ans += "<tr style='width:80%' >";
            } 
            ans += "<td style='width:25%;' >";
            if (letter != " ") {
                ans += "<input type='button' value='" + letter + "' style='width:100%' ></input>";
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
        "ArrowLeft":string3_utils.xyz(-1,0,0),
        "ArrowRight":string3_utils.xyz(1,0,0),
        "ArrowUp":string3_utils.xyz(0,-1,0),
        "ArrowDown":string3_utils.xyz(0,1,0),
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
        var centerX = 150; // hack
        var centerY = 50; //hack
        var scl = -0.1;
        var dx = ((event.offsetX - centerX) * scl);
        var dy = ((event.offsetY - centerY) * scl);
        for (var i=0; i<layers.length; i++) {
            var el = layers[i];
            el.style.left = (dx * el.dataset.zdepth ) + "px";
            el.style.top = (dy * el.dataset.zdepth ) + "px";
        }
    },
};