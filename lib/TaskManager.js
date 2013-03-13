var events = require("events");
var yhnode=require('yhnode');
var CommandParser=require('./CommandParser');
var Task=require('./Task');

var TaskManager=module.exports=yhnode.base.Core.Class([yhnode.base.BaseObject,events.EventEmitter],{

    initialize:function(deploy){
        console.log("init");
        this._tasks={};
        this._deploy=deploy;
    },

    parse:function(tasks,options){
        var conf,task;
        for(var i in tasks){
            conf=yhnode.base.Core.mixin({},tasks[i]);
            conf.action=CommandParser.parseAction(conf.action,this,options);
            console.log(conf.action);
            conf.manager=this;
            //TODO 如果host没有建立好，些时没办法获取hosts.可以放在task.run方法里动态从deploy里获取。
            conf.hosts=this._deploy.getHosts(conf.role);
            task=new Task();
            task.setAttributes(conf);
            this._tasks[conf.name]=task;
        }
        return this._tasks;
    },

    getTask:function(taskName){
        return this._tasks[taskName];
    }

});
