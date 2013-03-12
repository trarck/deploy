var metaKeyCodeRe = /(\x1b)([a-zA-Z0-9])/g;
var functionKeyCodeRe =
    /(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?(([~^$])|(?:1;)?(\d+)?[a-zA-Z]))/g;

exports.clearEscape=function (str){
    return str.replace(metaKeyCodeRe,'').replace(functionKeyCodeRe,'');
};

var DEFAULT_CLONE_DEPTH = 6;

exports.cloneDeep = function(obj, depth) {

    // Recursion detection
    depth = (depth === null ? DEFAULT_CLONE_DEPTH : depth);
    if (depth < 0) {
        return {};
    }

    // Create the copy of the correct type
    var copy = Array.isArray(obj) ? [] : {};

    // Cycle through each element
    for (var prop in obj) {

        // Call recursively if an object or array
        if (typeof obj[prop] == 'object') {
            copy[prop] = exports.cloneDeep(obj[prop], depth - 1);
        }
        else {
            copy[prop] = obj[prop];
        }
    }

    // Return the copied object
    return copy;
};

exports.mixin= function(){

    var self = this,deep=false,options;

    // Make sure we have a target
    if(arguments.length == 0) return {};

    // Get the tag
    var target = arguments[0];
    var i = 1;
    if ( typeof target === "boolean" || typeof target==="number") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
    }
    // Ensure we have an extendable target
    if(typeof target != 'object' && typeof target != 'function') {
        target = {};
    }

    var src,copy;

    for(; i < arguments.length; i++) {
        if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( var name in options ) {
                if(name=="_super_" ||name=="_superclass_") continue;

                copy = options[ name ];
                // Prevent never-ending loop
                if ( copy==null||target === copy ) {
                    continue;
                }
                // Recurse if we're merging plain objects or arrays
                if ( deep && typeof copy == 'object' ) {
                    src = target[ name ];
                    if(!src){
                        src=copy instanceof Array?[]:{};
                    }
                    // Never move original objects, clone them
                    // target[ name ] = this.mixin( deep, src, copy );
                    target[ name ] = this.mixin( deep===true?deep:deep-1, src, copy );
                    // Don't bring in undefined values
                } else if ( copy !== undefined ) {
                    target[ name ] = copy;
                }
            }
        }
    }

    // Pass it back
    return target;
};