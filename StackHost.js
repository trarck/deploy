var Host = require('./Host');
var Connection = require('./ConnectionGateway');
var MessageDefine = require('./MessageDefine');

var StackHost = module.exports =Host.extend({

    _type:"host",

    initialize:function () {
        StackHost._super_.initialize.apply(this,arguments);
        this._stack=[];
    },

    execCommand:function (command) {
        command.exec(this._conn,this);
    },

    save:function(){
        //if host do nothing don't push
        console.log("save:",!this.isIdle());
//        if(!this.isIdle()){
            this._stack.push({
                commandIndex:this._commandIndex,
                action:this._action,
                actionName:this._actionName
            });
//        }
        return this;
    },

    restore:function(){
        console.log("restore:",this._stack.length);
        if(this._stack.length){
            var it=this._stack.pop();
            this._commandIndex=it.commandIndex;
            this._action=it.action;
            this._actionName=it.actionName;
            this.checkActionFinish();
        }
        return this;
    }
});