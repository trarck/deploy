var yhnode=require('yhnode');
var BaseObject = require('./BaseObject');
var Connection = require('./ConnectionGateway');
var MessageDefine = require('./MessageDefine');
var DataReceiver=require('./DataReceiver');

var Host = BaseObject.extend({

    _type:"host",

    initialize:function () {
        this._commandIndex = 0;
        this._waitForActionComplete = true;
        this._checkDelay = 1000;
        this._logined = false;
        this._name = null;

    },

    setup:function (conf, action) {

        this._dataReceiver=new DataReceiver();

        action && this.setAction(action);

        this._commandIndex = 0;

        this.createConnection(conf);

        this.setupEvents();

    },

    createConnection:function (conf) {
        this._conn = new Connection(conf);
    },

    getConnection:function (conf) {
        return this._conn;
    },

    setupEvents:function () {
        var self = this;

        var conn = this._conn;

        conn.on(MessageDefine.Login, function () {
            self.onLogin();
        });

        if (this._waitForActionComplete) {
            this.on(MessageDefine.ExecCommandComplete, function (action) {
                if (self._logined) {
//                ++self._commandIndex;
                    self.execNextCommand();
                }
            });
        } else {
            conn.on(MessageDefine.Drain, function () {
                if (self._logined) {
//                ++self._commandIndex;
                    self.execNextCommand();
                }
            });
        }

        conn.on(MessageDefine.Data, function (data) {
//        console.log("check:",data.toString())
            self._dataReceiver.receive(data);
            self._checkExecComplete();
        });

        conn.on(MessageDefine.Error, function () {
            //TODO check error level
        });
    },

    connect:function () {
        if (this._conn && !this._conn.isConnected()) {
            this._conn.connect();
        }
    },

    close:function () {
        if (this._conn && this._conn.isConnected()) {
            this._conn.close();
        }
    },


//默认action是一个命令字符串。
    execNextCommand:function () {
//        console.log("execNextCommand["+this.getName()+"]:",this._commandIndex,this._action.length);
        //当执行commnad的时候，this._commandIndex应该是加过1之后的。
        var currentIndex=this._commandIndex++;
        if (currentIndex < this._action.length) {
            this.execCommand(this._action[currentIndex]);
        }
    },

    /**
     * 一个Action对应一个Command
     * @param action
     */
    execCommand:function (command) {
        this._conn.exec(this.getCommand(command));
//        command.exec(this._conn);
    },

    getCommand:function (command) {
        if (typeof command == "string") return this.replacePlaceHodlders(command);
        if (command.getExecString) return command.getExecString(this._conn);
    },

    replacePlaceHodlders:function (cmd, conn) {
        var hodlerRegex=/#\{HOST\}/g;
        return hodlerRegex.test(cmd)?cmd.replace(hodlerRegex, conn.getHost()):cmd;
    },

    /**
     * 检查命令执行完成。包含接收数据结束。
     */
    _checkExecComplete:function () {
        var self = this;
        if (this._checkTimer) clearTimeout(this._checkTimer);
//        if(this._conn._parser.checkCommandFinish(this._dataReceiver.getData().toString()))
        this._checkTimer = setTimeout(function () {
            self.checkActionFinish();
            //由于在checkActionFinish中触发了ExecCommandComplete事件，会引起执行下个动作，所以先检查ExecActionComplete事件。
            self.checkCommandFinish();
        }, this._checkDelay);
    },

    checkCommandFinish:function () {
        this.emit(MessageDefine.ExecCommandComplete, this._action[this._commandIndex]);
    },

    checkActionFinish:function () {
//    console.log("this._commandIndex>=this._action.length",this._commandIndex,this._action.length);
        if (this._commandIndex >= this._action.length) {
            console.log(this._conn.host + " :ExecActionComplete");
            this.emit(MessageDefine.ExecActionComplete, this,this._actionName);
        }
    },

    /**
     * action name == task name
     * @param actions
     * @param actionName
     */
    initAction:function (actions,actionName) {
        this._action = yhnode.base.Core.clone(actions);
        this._commandIndex = 0;
        this._actionName=actionName;
        return this;
    },

    onLogin:function(){
        console.log("login");
        this._logined = true;
        this.emit(MessageDefine.Login,this);
        //run app action
//        this.execNextCommand();
    },

    getType:function () {
        return this._type;
    },

    getAction:function () {
        return this._action;
    },

    setAction:function (action) {
        this._action = action;
        return this;
    },

    setActionName:function(actionName) {
        this._actionName = actionName;
        return this;
    },
    getActionName:function() {
        return this._actionName;
    },

    setCommandIndex:function (commandIndex) {
        this._commandIndex = commandIndex;
        return this;
    },

    getCommandIndex:function () {
        return this._commandIndex;
    },

    setWaitForActionComplete:function (val) {
        this._waitForActionComplete = val;
        return this;
    },

    isWaitForActionComplete:function () {
        return this._waitForActionComplete;
    },

    setName:function(name) {
        this._name = name;
        return this;
    },

    getName:function() {
        return this._name||(this._conn && this._conn.getHost());
    },

    isLogin:function(){
        return this._logined;
    },

    isIdle:function(){
        return this._action==null || this._commandIndex>=this._action.length;
    },

    isActive:function () {
        return this._conn && this._conn.isConnected();
    }


});


module.exports = Host;