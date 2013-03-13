var yhnode=require('yhnode');
var Host=require('./Host');
var MessageDefine=require('./MessageDefine');

var TaskHost=yhnode.base.Core.Class(Host,{

    initialize:function(){
        TaskHost._super_.initialize.apply(this,arguments);
        this._completeActions={};
    },

    setup:function(){
        TaskHost._super_.setup.apply(this,arguments);
        this.on(MessageDefine.ExecCommandComplete,function(action){

        });
    },

    execAction:function(action){

        this._conn.exec(this.getCommandFromAction(action));
    }

});