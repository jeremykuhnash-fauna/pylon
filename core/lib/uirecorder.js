// #ifdef __WITH_UIRECORDER
/**
 * Provides a way to record user actions, store them and play them back.
 * @experimental
 */
apf.uirecorder = {
    isPlaying   : false,
    isRecording : false,
    inited      : false,
    
    playActions : {"mousemove":1, "click":1, "keypress":1},
    playList : [],
    initialState: {},
    
    init : function() {
        if (apf.uirecorder.inited)
            return;

        apf.uirecorder.inited = true;

        // record initial state
        for (var amlNode, id, props, i = 0, l = apf.all.length; i < l; i++) {
            amlNode = apf.all[i]; 
            
            // ignore nodes without supportedProperties
            if (!amlNode.$supportedProperties || amlNode.$supportedProperties.length === 0 || !amlNode.ownerDocument) continue;
            
             
            id = apf.xmlToXpath(amlNode); //(amlNode.id || "") + "_" + amlNode.localName + apf.xmlToXpath(amlNode) + "_" + amlNode.serialize(); //uniqueness: id, localName + position in the tree (apf.getXpathFromNode - in lib/xml.js), serialized state (serialize())
            
            props = [];
            // record data (models)
            if (amlNode.data) {
                props.push({
                    name    : "data", 
                    value   : amlNode.data
                });
            }
            for (var j = 0, jl = amlNode.$supportedProperties.length; j < jl; j++) { //width, height, span, columns, ...
                props.push({
                    name    : amlNode.$supportedProperties[j], 
                    value   : amlNode[amlNode.$supportedProperties[j]]
                });
            }
            
            apf.uirecorder.initialState[id] = props;
        }

        /* Form events support */
        document.documentElement.onselect = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onchange = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onsubmit = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onreset = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
       
        /* User interface events support */
        document.documentElement.onfocus = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        document.documentElement.onblur = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        /* Mouse events support */
        document.documentElement.onclick = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            apf.uirecorder.captureAction("click", e);
        }
        
        document.documentElement.ondblclick = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmousedown = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmouseup = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmousemove = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            apf.uirecorder.captureAction("mousemove", e);
        }
        
        document.documentElement.onmouseover = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }
        
        document.documentElement.onmouseout = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
        }

        /* Keyboard events support for all browsers */
        document.documentElement.onkeyup = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            //apf.uirecorder.captureAction("keypress", e, e.keyCode);
        }
        
        document.documentElement.onkeydown = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            var value = e.keyCode;
            apf.uirecorder.captureAction("keypress", e, e.keyCode);
        }
        
        document.documentElement.onkeypress = function(e) {
            if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                return;
            e = e || event;
            //apf.uirecorder.captureAction("keypress", e, e.keyCode);
        }

        var mEvents = ["DOMSubtreeModified", "DOMNodeInserted", "DOMNodeRemoved", "DOMNodeRemovedFromDocument",
            "DOMNodeInsertedIntoDocument", "DOMAttrModified", "DOMCharacterDataModified", "DOMActivate"];

        /* ============== Mutation Events ============== */
        /* Support for Mutation Events in FF */
        /*if(apf.isGecko) {
            for (var i = 0, l = mEvents.length; i < l; i++) {
                document.addEventListener(mEvents[i], function(e) {
                    if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                        return;

                    e = e || event;

                    apf.uirecorder.actionStack.push([new Date().getTime(), mEvents[i], e.srcElement || e.target, apf.extend({}, e)]);
                }, false);
            }
        }*/
        /* Support for Mutation events in IE */
        /*else if(apf.isIE) {
            for (var i = 0, l = mEvents.length; i < l; i++) {
                document.attachEvent(mEvents[i], function(e) {
                    if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                        return;
    
                    e = e || event;
    
                    apf.uirecorder.actionStack.push([new Date().getTime(), mEvents[i], e.srcElement || e.target, apf.extend({}, e)]);
                });
            }
        }*/

        /* Support for Mouse Scroll event */
        if(document.addEventListener) {
            /* FF */
            document.addEventListener("DOMMouseScroll", function(e) {
                if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                    return;
    
                e = e || event;
            }, false);
        }
        else {
            /* IE */
            document.onmousewheel = function(e) {
                if (apf.uirecorder.isPlaying || !apf.uirecorder.isRecording)
                    return;

                e = e || event;
            };
        }
    },

    /**
     * Checks delta value and creates object to simulate mouse scroll
     * 
     * @param {Object} e   event object
     */
    createMouseWheelEvent : function(e) {
        var delta = null;
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
            if (apf.isOpera)
                delta *= -1;
        }
        else if (e.detail)
            delta = -e.detail / 3;

        return {
            type : apf.isGecko ? "DOMMouseScroll" : (apf.isIE ? "mousewheel" : "DOMMouseScroll"),
            delta : delta
        }
    },

    /**
     * Initiate user interface recorder and start recording
     */
    startRecordTime : 0,
    record : function() {
        apf.uirecorder.actionList = [];
        apf.uirecorder.actionsXml = [];
        apf.uirecorder.eventList = [];
        apf.uirecorder.startRecordTime = new Date().getTime();
        apf.uirecorder.isRecording = true;
        apf.uirecorder.init();
    },
    
    /**
     * Stop recording and start playing
     */
    startPlayTime : 0,
    play : function(actionsXml) {
        var playList = apf.getXml(actionsXml) || apf.uirecorder.actionsXml;
        apf.uirecorder.startPlayTime = new Date().getTime();
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = true;

        // restore initial state
        /*
        for (var amlNode, id, props, i = 0, l = apf.all.length; i < l; i++) {
            amlNode = apf.all[i];
            
            if (!amlNode.$supportedProperties || amlNode.$supportedProperties.length === 0 || !amlNode.ownerDocument) continue;
            id = apf.xmlToXpath(amlNode)
            //if (apf.uirecorder.initialState.indexOf(id) == -1) continue;
                
            for (var p = 0, pl = apf.uirecorder.initialState[id].length; p < pl; p++) {
                property = apf.uirecorder.initialState[id].name;
                value    = apf.uirecorder.initialState[id].value;
                amlNode[property] = value;
            }
        }
        */

/*        
        // create playList
        apf.uirecorder.playList = [];
        for (var action, i = 0, l = apf.uirecorder.actionList.length; i < l; i++) {
            action = apf.uirecorder.actionList[i];
            apf.uirecorder.playList.push(action);
            
            if (action.name == "mousemove") {
                for (var mi = 0, ml = action[action.movement].length; mi < ml; mi++) {
                    apf.uirecorder.playList.push(action[action.movement][mi]);
                }
            }
        }
*/

        // generateXml
        apf.uirecorder.startPlaying(playList);
    },
    
    /**
     * Generate xml from playList
     */
    setPlayList: function() {
        apf.uirecorder.actionsXml = apf.uirecorder.createPlayList();
    },
    createPlayList : function() {
        var playList = [];
        for (var action, i = 0, l = apf.uirecorder.actionList.length; i < l; i++) {
            action = apf.uirecorder.actionList[i];
            playList.push(action);
            
            if (action.name == "mousemove") {
                for (var mi = 0, ml = action[action.movement].length; mi < ml; mi++) {
                    playList.push(action[action.movement][mi]);
                }
            }
        }
        
        var actionsXml = apf.getXml('<actions />');
        var properties = ["name", "time", "x", "y", "value", "target"];
        for (var action, actionNode, i = 0, l = playList.length; i < l; i++) {
            action = playList[i];
            
            actionNode = actionsXml.ownerDocument.createElement("action");
            for (var propNode, p = 0, pl = properties.length; p < pl; p++) {
                if (action[properties[p]])
                    actionNode.setAttribute(properties[p], action[properties[p]]);
                /*
                propNode = actionsXml.ownerDocument.createElement(properties[p]);
                propNode.appendChild(actionsXml.ownerDocument.createTextNode(action[properties[p]]));
                actionNode.appendChild(propNode);
                */
            }
            actionsXml.appendChild(actionNode); 
        }
        return actionsXml;
    },
    
    /**
     * Stop recording and playing
     */
    stop : function() {
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = false;
        apf.uirecorder.actionsXml = apf.uirecorder.createPlayList();
    },
    
    /**
     * Stop recording and playing, clear list of recorded actions
     */
    reset : function() {
        apf.uirecorder.isRecording = false;
        apf.uirecorder.isPlaying   = false;
        apf.uirecorder.playStack   = [];
        apf.uirecorder.actionStack = [];
    },
    
    /**
     * Record user action like mouse clicks, movement of keypress 
     */
    actionList      : [],
    captureAction   : function(eventName, e, value) {
        // ignore first click
        var htmlElement = e.srcElement || e.target;
        var amlNode     = apf.findHost(htmlElement);
        var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);

        // time in ms when action is executed
        var time        = new Date().getTime() - apf.uirecorder.startRecordTime;
        var actionObj = {
            time        : time,
            name        : eventName,
            htmlElement : htmlElement,
            amlNode     : amlNode,
            xmlNode     : xmlNode,
            event       : apf.extend({}, e),
            x           : e.clientX,
            y           : e.clientY,
            target      : apf.xmlToXpath(amlNode)
        }
        
        if (!actionObj.y) debugger;
        
        var ignoreKeys = {16: 1}; // 16 = shift
        var specialKeys = {8: "backspace"};
        if (eventName == "keypress") {
            if (ignoreKeys[value]) return;
            actionObj.value = (!specialKeys[value]) ? String.fromCharCode(value) : specialKeys[value];
            //actionObj.target = htmlElement.id; 
        }
        else if (eventName == "mousemove" && apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].name != "mousemove") {
            actionObj.movement = "realtime";
            actionObj.realtime = [];
        }
        else if (eventName == "mousemove" && apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].name == "mousemove") {
            apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].realtime.push(actionObj);
            //return;
        }
        else if (eventName == "click") {
            actionObj.clickpos = "position";
        }
        
//        setTimeout(function() {
//        }, 200);
        actionObj.eventList = apf.uirecorder.eventList;
        
        if (eventName != "mousemove" || (eventName == "mousemove" && apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].name != "mousemove"))
            apf.uirecorder.actionList.push(actionObj);

        apf.uirecorder.eventList = [];
    },
    
    /**
     * Add lineair movement to mousemove action
     */
    addLineairMovement  : function(index) {
        if (apf.uirecorder.actionList[index].lineair || !apf.uirecorder.actionList[index].realtime) return;

        apf.uirecorder.actionList[index].lineair = [];
        var startAction = apf.uirecorder.actionList[index];
        var endAction = startAction.realtime[startAction.realtime.length-1];
        var duration = startAction.realtime.length;

        for (var x, y, time, i = 0, l = duration; i < l; i++) {
            x = parseInt(startAction.x) + parseInt((endAction.x - startAction.x)*i/(duration-1));
            y = parseInt(startAction.y) + parseInt((endAction.y - startAction.y)*i/(duration-1));
            time = parseInt(startAction.time) + parseInt((endAction.time - startAction.time)*i/(duration-1));
            
            action = {
                name : "mousemove",
                x    : x,
                y    : y,
                time: time
            }
            apf.uirecorder.actionList[index].lineair.push(action);
        }
    },
    
    /**
     * Play recorded actions
     */
    playSpeed       : 1, // multiplier compared to normal speed
    startPlaying    : function(actionsXml) {
        if (!apf.uirecorder.isPlaying) return;

        // if actionXml is given, convert it to apf.uirecorder.playList, else play already created apf.uirecorder.playList
        if (actionsXml) {
            apf.uirecorder.playList = [];
            for (var action, actionObj, i = 0, l = actionsXml.childNodes.length; i < l; i++) {
                action = actionsXml.childNodes[i];
                
                // ignore first action if it's a click, probably click on Record button
                if(i == 0 && action.getAttribute("name") == "click") continue;
                
                actionObj = {};
                
                // @todo loop throught attributes
                if (action.getAttribute("name"))    actionObj.name    = action.getAttribute("name");
                if (action.getAttribute("time"))    actionObj.time    = action.getAttribute("time");
                if (action.getAttribute("x"))       actionObj.x       = action.getAttribute("x");
                if (action.getAttribute("y"))       actionObj.y       = action.getAttribute("y");
                if (action.getAttribute("target"))  actionObj.target  = action.getAttribute("target");
                if (action.getAttribute("value"))   actionObj.value   = action.getAttribute("value");
                apf.uirecorder.playList.push(actionObj);
            }
        }
        
        if (!apf.uirecorder.playList || !apf.uirecorder.playList.length) {
            apf.uirecorder.stop();
            return;
        }

        document.getElementById("previewActions").innerHTML = "";
        var cursor = apf.uirecorder.createCursor();
        var cursorMsg = cursor.getElementsByTagName("span")[0];
        document.getElementById("previewActions").appendChild(cursor);
        
        var elapsedTime = 0;

        var interval = setInterval(function() {
            elapsedTime = new Date().getTime() - apf.uirecorder.startPlayTime;
            for (var action, amlNode, i = 0; i < apf.uirecorder.playList.length; i++) {
                action = apf.uirecorder.playList[i];
                if (action.time / apf.uirecorder.playSpeed <= elapsedTime) {
                    if (action.target && action.target.substr(0, 8) == "html[1]/") {
                        amlNode = apf.document.selectSingleNode(action.target.substr(8))
                    }

                    if (["click","mousemove"].indexOf(action.name) > -1) {
                        cursor.style.top = action.y + "px";
                        cursor.style.left = action.x + "px";
                        if (action.name == "click") {
                            cursor.setAttribute("class", "cursor click");
                            // get amlnode to dispatch click event based on action.target
                            
                            if (amlNode) {
                                //amlNode.$focus();
                                amlNode.dispatchEvent("click", {noCapture: true});
                            }
                        }
                        else
                            cursor.setAttribute("class", "cursor");
                        cursorMsg.innerHTML = action.name + " (" + action.x + ", " + action.y + ")";

                        apf.uirecorder.playList.splice(i, 1);
                        i--;
                    }
                    else if (action.name == "keypress") {
                        if (action.target) {
                            if (action.value === "backspace") {
                                amlNode.setAttribute("value", amlNode.value.substr(0, amlNode.value.length-1));
                            }
                            else {
                                amlNode.setAttribute("value", amlNode.value + action.value);
                            }
                            //amlNode.$focus();
                        }
                        apf.uirecorder.playList.splice(i, 1);
                        i--;
                    }
                    
                    // if first action isn't executed yet, it's useless to check the other actions
                    else if (i == 0) {
                        break;
                    }
                }
            }
            if (!apf.uirecorder.playList.length) {
                clearInterval(interval);
                apf.uirecorder.stop();
            }
        }, 10);
    },
    //<div class="cursor"><span class="cursorMsg">Message</span></div>
    createCursor : function() {
        var cursor = document.createElement("div");
        cursor.setAttribute("class", "cursor");
        
        var cursorMsg = document.createElement("span");
        cursorMsg.setAttribute("class", "cursorMsg");
        
        cursor.appendChild(cursorMsg);
        
        return cursor;
    },
    prevActionObj   : null,
    eventList       : [],
    initDone        : false,
    ignoreEvents    : { "blur":1,"focus":1,"mouseover":0,"mouseout":0,"mousedown":0,"mouseup":0,
                        "DOMFocusOut":1,"DOMFocusIn":1,"movefocus":1,"DOMAttrModified":1,
                        "xforms-focus":1,"xforms-enabled":1,"xforms-disabled":1,"xforms-readwrite":1,"xforms-readonly":1,"xforms-previous":1,
                        "DOMNodeInserted":1,"DOMNodeInsertedIntoDocument":1,"DOMNodeRemoved":1,"DOMNodeRemovedFromDocument":1,
                        "keyup":1,"slidedown":1,
                        "beforechange":1, "afterchange":1
                        },
    captureEvent    : function(eventName, e) {
        // ignore event from ignoreEvents list
        if (apf.uirecorder.ignoreEvents[eventName] || e.noCapture) return;
        
        /*
        if (!apf.uirecorder.eventList[eventName]) apf.uirecorder.eventList[eventName] = [];
        apf.uirecorder.eventList[eventName].push(e);
        return;
        */

        //if (["click"].indexOf(eventName) == -1) return;
        
        var htmlElement, amlNode;
        // click
        if (e.htmlEvent) {
            htmlElement = e.htmlEvent.srcElement || e.htmlEvent.target;
            amlNode = apf.findHost(htmlElement);
        }
        // beforeselect
        else if (e.htmlNode) {
            htmlElement = e.htmlNode;
            amlNode = apf.findHost(htmlElement);
        }
        // sortcolumn
        else if (e.$aml && e.localName && e.ownerDocument) {
            amlNode = e;
        }
        else if (e.scrElement || e.target) {
            debugger;
        }
        
        
        //if (!htmlElement && !amlNode) debugger;
        
        var targetName;
        if (amlNode)
            targetName = apf.xmlToXpath(amlNode);
            
        var eventObj = {
            name        : eventName,
            amlNode     : amlNode,
            //xmlNode     : xmlNode,
            event       : e
        }
        
        if (targetName) {
            if (!apf.uirecorder.eventList[targetName]) apf.uirecorder.eventList[targetName] = [];
            apf.uirecorder.eventList[targetName].push(eventObj);
        }
        return;
        
        if (e.noCapture) return;
        var htmlElement, amlNode;
        if (e.htmlEvent || e.srcElement || e.target) {
            htmlElement = (e.htmlEvent) 
            ?  e.htmlEvent.srcElement || e.htmlEvent.target
            :  e.srcElement || e.target;
            amlNode     = apf.findHost(htmlElement);
        }
        else if (e.amlNode && e.amlNode.$aml) {
            amlNode = e.amlNode;
        }
        else if (e.currentTarget) {
            if (e.currentTarget.localName) {
                if ("actiontracker|model".indexOf(e.currentTarget.localName) == -1)
                    amlNode = (e.currentTarget.ownerDocument) 
                        ? e.currentTarget 
                        : (e.currentTarget.host)
                            ? e.currentTarget.host
                            : null;
                else
                    targetName == e.currentTarget.localName;
            }
            else if (e.currentTarget.all && e.currentTarget.root === true)
                targetName = "apf";
        }
        if (amlNode && !amlNode.ownerDocument) debugger;
        if (amlNode)
            targetName = apf.xmlToXpath(amlNode); //amlNode.id || amlNode.localName + amlNode.$uniqueId.toString();
            
        if (!targetName) debugger;
        
        //var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);

        var eventObj = {
            name        : eventName,
            amlNode     : amlNode,
            //xmlNode     : xmlNode,
            event       : e
        }
        //if (eventName == "click") debugger;
        //if (htmlElement)    eventObj.htmlElement    = htmlElement;
        if (e.value)        eventObj.value          = value;
        
        if (!targetName) debugger; 

        if (!apf.uirecorder.eventList[targetName]) apf.uirecorder.eventList[targetName] = [];
        // prevent duplicate events
        if (apf.uirecorder.eventList[targetName][apf.uirecorder.eventList[targetName].length-1] != eventName) 
            apf.uirecorder.eventList[targetName].push(eventObj);
    },
    prevMousePos : null,
    
    captureAction2 : function(eventName, e, value) {
            if (eventName == "keypress" || eventName == "click") {
                var htmlElement = e.srcElement || e.target;
                var amlNode     = apf.findHost(htmlElement);
                var xmlNode     = apf.xmldb.findXmlNode(htmlElement, amlNode);
            }
            
            // get mouse positions
            if (e.clientX) {
                var mouse = {
                    clientX : e.clientX,
                    clientY : e.clientY,
                    offsetX : e.offsetX,
                    offsetY : e.offsetY
                };
            }
            
            setTimeout(function() {
                var changed = false;
                
                // loop throught eventList en look for actions
                var interaction = [];
                for (objName in apf.uirecorder.eventList) {
                    //if (objName.indexOf("actiontracker") == 0) debugger;
                    if (typeof apf.uirecorder.eventList[objName] === "object" && apf.uirecorder.eventList[objName].length) {
                        for (var name, i = 0, l = apf.uirecorder.eventList[objName].length; i < l; i++) {
                            name    = apf.uirecorder.eventList[objName][i].name;
                            aml     = apf.uirecorder.eventList[objName][i].amlNode;
                            
                            if (name === "resize") {
                                interaction.push(aml.localName + " '" + objName + "' resized");
                            }
                            else if (name === "close") {
                                interaction.push(aml.localName + " '" + objName + "' closed");
                            }
                            else if (name === "drag") {
                                interaction.push(aml.localName + " '" + objName + "' dragged");
                            }
                            else if (name === "click") {
                                if (aml.localName == "button")
                                    interaction.push(aml.localName + " '" + objName + " (" + aml.caption + ")" + "' pressed");
                                //else
                                    //interaction.push(amlNode.localName + " '" + objName + "' clicked");
                            }
        /*
                            if (apf.uirecorder.eventList[objName].name === "afterstatechange" > -1 && apf.uirecorder.eventList[objName].indexOf("afterstatechange") > -1 && apf.uirecorder.eventList[objName].indexOf("beforestatechange") < apf.uirecorder.eventList[objName].indexOf("afterstatechange")) {
                                interaction.push(amlNode.localName + " '" + objName + "' state changed (but what?)");
                            }
        */
                            else if (name === "prop.visible" && apf.uirecorder.eventList[objName][i].value) { // && amlNode.localName == "page"
                                interaction.push(aml.localName + " '" + aml.caption + "' opened");
                            }
                            else if (name === "updatestart") {
                                interaction.push(aml.localName + " '" + objName + "' updated (updatestart)");
                            }
                            else if (name === "xmlupdate") {
                                
                            }

                            else if (name === "afteradd") {
                                interaction.push("Data added to " + aml.localName + " '" + objName + "' ");
                            }
                            
                            else if (name === "afterstatechange") {
                                interaction.push("Change state of " + aml.localName + " '" + objName + "' to '" + apf.uirecorder.eventList[objName][i].event.to.value + "' ");
                            }
                            // sortcolumn [columnName]
                            // 
                        }
                    }
                }
                    
                var actionObj = {
                    name        : eventName
                }
                
                if (htmlElement)                        actionObj.htmlElement = htmlElement;

                if (apf.uirecorder.eventList)           actionObj.events      = apf.uirecorder.eventList;
                if (value)                              actionObj.value       = (eventName == "keypress") ? String.fromCharCode(value.toString()) : value;
    
                // check previous action object
                if (apf.uirecorder.prevActionObj) {
                    if (eventName == apf.uirecorder.prevActionObj.name && eventName == "keypress") {
                        actionObj.value = htmlElement.value;//apf.uirecorder.actionList[apf.uirecorder.actionList.length-1].value + String.fromCharCode(value.toString());
                        changed = true;
                    }
                }
                
                if (eventName == "keypress") {
                    interaction.push("Change text to '" + htmlElement.value + "' in " + apf.xmlToXpath(amlNode));
                }
                else if (eventName == "click") {
                    actionObj.mouse = {x: mouse.clientX, y: mouse.clientY};
                }
                
                if (interaction.length)                 actionObj.interaction = interaction;
                if (amlNode)                            actionObj.amlNode = amlNode;
                if (xmlNode)                            actionObj.xmlNode = xmlNode;


                if (eventName == "click" && apf.uirecorder.prevMousePos) {
                    apf.uirecorder.actionList.push({
                        name    : "mousemove",
                        start   : {x: apf.uirecorder.prevMousePos.x, y: apf.uirecorder.prevMousePos.y},
                        end     : {x: mouse.clientX, y: mouse.clientY}
                    });
                }


                if (!changed)
                    // add object to actionList
                    apf.uirecorder.actionList.push(actionObj)
                else
                    // overwrite previous object
                    apf.uirecorder.actionList[apf.uirecorder.actionList.length-1] = actionObj;
                   
                
                apf.uirecorder.prevMousePos = {x: mouse.clientX, y: mouse.clientY};
                apf.uirecorder.prevActionObj = actionObj;
    
                // reset eventList
                apf.uirecorder.eventList = [];
            }, 200);
    }
};

var timeout;
function playFrame() {
    var frame = apf.uirecorder.playStack.shift();

    if(!frame || !apf.uirecorder.isPlaying)
        return;

    var lastTime = frame[0],
        simulate = false,
        src = frame[3],
        prop, e;

    if (apf.isIE) {
        e = document.createEventObject();
        
        for (prop in frame[3]) {
            if (frame[3][prop]) {
                e[prop] = frame[3][prop];
            }
        }

        e.target = frame[2];

        
        switch (src.type) {
            case "mousewheel":
                fireScroll(frame);
                break;
            default:
                //apf.console.info("playing... "+src.type+" - "+src.clientX+" "+src.clientY);
                frame[2].fireEvent(frame[1], e);
                break;
        }
        
    }
    else {
        switch(src.type) {
            case "mousemove":
            case "mouseup":
            case "mousedown":
            case "click":
            case "dblclick":
            case "mouseover":
            case "mouseout":
                e = document.createEvent("MouseEvents");
                e.initMouseEvent(src.type, src.bubbles, src.cancelable, src.view, src.detail, src.screenX,
                    src.screenY, src.clientX, src.clientY, src.ctrlKey, src.altKey,
                    src.shiftKey, src.metaKey, src.button, src.relatedTarget
                );
                /* Little workaround - that values are important for drag&drop (dragdrop.js) */
                apf.event.layerX = src.layerX
                apf.event.layerY = src.layerY
                break;
            case "keyup":
            case "keydown":
            case "keypress":
                e = document.createEvent("KeyboardEvent");
                e.initKeyEvent(src.type, src.bubbles, true, window, 
                    src.ctrlKey, src.altKey, src.shiftKey, src.metaKey, 
                    src.keyCode, src.charCode); 
                break;
            case "select":
            case "change":
            case "submit":
            case "reset":
                e = document.createEvent("HTMLEvents");
                e.initEvent(src.type, src.bubbles, src.cancelable);
                break;
            case "DOMActivate":
            case "resize":
            case "focus":
            case "blur":
                e = document.createEvent("UIEvents");
                e.initUIEvent(src.type, src.bubbles, src.cancelable, e.view, e.detail);
                break;
            /*case "DOMAttrModified":
            case "DOMCharacterDataModified":
            case "DOMNodeInsertedIntoDocument":
            case "DOMNodeRemovedFromDocument":
            case "DOMNodeRemoved":
            case "DOMNodeInserted":
            case "DOMSubtreeModified":
                e = document.createEvent("MutationEvents");
                e.initMutationEvent(src.type, src.bubbles, src.cancelable, src.relatedNode, src.prevValue, src.newValue, src.attrName, src.attrChange);
                break;*/
            case "DOMMouseScroll": //mouse scroll
                fireScroll(frame);
                simulate = true;
                break;
            default:
                apf.console.info("default: " + src.type);
                simulate = true;
                break;
        }

        if (!simulate) {
            frame[2].dispatchEvent(e);
        }
    }

    if (apf.uirecorder.playStack.length && apf.uirecorder.isPlaying) {
        timeout = setTimeout(function() {
            playFrame();
        }, apf.uirecorder.playStack[0][0] - lastTime);
    }
    else {
        apf.uirecorder.stop();
        clearInterval(timeout);
    }
};

function fireScroll(frame) {
    var el = frame[2];

    while (el != document.body && el.scrollHeight == el.offsetHeight) {
        el = el.parentNode || el.parentElement;
    }

    // FF - 39
    // IE - el.offsetHeight / ~(6,7 - 6,8)
    // Chrome - 120
    el.scrollTop = el.scrollTop - (apf.isGecko
        ? 39
        : (apf.isChrome
            ? 120
            : (apf.isIE
                ? Math.round(el.offsetHeight / 6.73)
                : 20))) * frame[3].delta;
}
// #endif