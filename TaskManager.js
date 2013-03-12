var events = require("events");
var yhnode=require('yhnode');
var CommandParser=require('./CommandParser');
var Task=require('./Task');

var TaskManager=module.exports=yhnode.base.Core.Class([yhnode.base.BaseObject,events.EventEmitter],{

    initialize:function(){
        console.log("init");
    },
    parse:function(tasks){

    }

},{
    parse:function(taskConfigs){
        var tasks={};

        var conf;
        for(var i in taskConfigs){
            conf=yhnode.base.Core.mixin({},taskConfigs[i]);
            conf.action=CommandParser.parseAction(conf.action,tasks);
            console.log(conf.action);
            tasks[conf.name]=new Task(conf);
        }

        return tasks;
    }
});
