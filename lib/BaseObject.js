var events = require("events");
var yhnode=require('yhnode');

module.exports=yhnode.base.Core.Class([yhnode.base.BaseObject,events.EventEmitter,yhnode.base.Accessor],{});
