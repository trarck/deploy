var yhnode=require('yhnode');

var Task=yhnode.base.BaseObject.extend({

    initialize:function(conf){
        conf.name && this.setName(conf.name);
        conf.role && this.setRole(conf.role);
        conf.action && this.setAction(conf.action);
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
    }
});

module.exports=Task;