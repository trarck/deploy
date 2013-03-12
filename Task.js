var yhnode=require('yhnode');

var Task=yhnode.base.BaseObject.extend({

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
        var hosts=this._hosts;
        var host;
        for(var k in hosts){
            host=hosts[k];
            host.initAction(this._action);
            host.execNextCommand();
        }
    }
},null,yhnode.base.Accessor);

module.exports=Task;