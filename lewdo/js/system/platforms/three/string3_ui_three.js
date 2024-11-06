
var THREEJS = null;
var THREE_UPDATE_CALLBACK = (()=>{});

var string3_three = {
    _topChildren : {
        "elementPtr":{ element:null, source3:null, pageElements:[], pageContents:[] },
    },
    _mainApp : null,
    _font_fixed : null,
    _mainScene : null,
    setFont : function(_font_fixed) {
        this._font_fixed = _font_fixed
    },
    setupThree(threeItself, redraw_callback, font_fixed) {
        THREEJS = threeItself;
        THREE_UPDATE_CALLBACK = redraw_callback;
        this.font_fixed = font_fixed;
    },
    setMainApp : function(parentElement,app,_font_fixed) {
        string3_three._mainApp = app;
        //string3_three.setFont(_font_fixed);
        string3_three.setInnerString3(parentElement,app.app_out);
    },
    setInnerString3 : function(parent,str3) {
        //console.assert(false); // TODO
        const THREE = THREEJS;

        if (!this._mainScene) {
            this._mainScene = new THREEJS.Group()
            this._mainScene.name = "lewdo_three_scene";
            parent.add(this._mainScene);
        }
        const scene = this._mainScene;

        const loader = new THREE.TextureLoader()
        const texture = loader.load( 'lewdo/lewdo.png', () => {
            THREE_UPDATE_CALLBACK();
        } )
        texture.colorSpace = THREE.SRGBColorSpace;

        const geometry = new THREE.PlaneGeometry(1,1);
        const material = new THREE.MeshBasicMaterial( { map: texture } );
        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );
    },
    _previousPageSize : string3_utils.xyz(),
    _updatePageText : function(element) {
        console.assert(false); // todo
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
    _global_elementCount : 0,
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