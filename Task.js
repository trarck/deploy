var yhnode=require('yhnode');
var BaseObject=require('./BaseObject');
var MessageDefine = require('./MessageDefine');

var Task=BaseObject.extend({

    initialize:function(){

    },

    setName:function(name) {
        this._name = name;
        return this;
    },

    getName:function() {
        return this._name;
    },

    setAction:function(action) {
        this._action = action;
        return this;
    },

    getAction:function() {
        return this._action;
    },

    setRole:function(role) {
        this._role = role;
        return this;
    },

    getRole:function() {
        return this._role;
    },

    setManager:function(manager) {
        this._manager = manager;
        return this;
    },

    getManager:function() {
        return this._manager;
    },

    setHosts:function(hosts) {
        this._hosts = hosts;
        return this;
    },

    getHosts:function() {
        return this._hosts;
    },

    run:function(){
        this._hostsRunningStatus={};
        var hosts=this._hosts;
        var host;
        for(var k in hosts){
            host=hosts[k];
            this.runAction(host);
        }
    },

    runAction:function(host){
        var self=this;
        this._hostsRunningStatus[host.getName()]=false;

        var onComplete=function(host){
            host.removeListener(MessageDefine.ExecAllComplete,onComplete);
            self._hostsRunningStatus[host.getName()]=true;
            self._checkTaskOnHostsComplete(host);
        };

        host.on(MessageDefine.ExecAllComplete,onComplete);

        host.initAction(this._action);

        if(host.isActive()){
            if(host.isLogin()){
                host.execNextCommand();
            }else{
                host.on(MessageDefine.Login,function(){
                    host.execNextCommand();
                });
            }
        }else{
            host.connect();
            host.on(MessageDefine.Login,function(){
                host.execNextCommand();
            });
        }
    },

    _checkTaskOnHostsComplete:function(){
        for(var appName in this._hostsRunningStatus){
            if(!this._hostsRunningStatus[appName]){
                return false;
            }
        }
        this.emit(MessageDefine.TaskComplete);
        return true;
    }

},null,yhnode.base.Accessor);

module.exports=Task;