var BaseObject = require('./BaseObject');
var Connection = require('./ConnectionGateway');
var MessageDefine = require('./MessageDefine');

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
            console.log("login");
            self._logined = true;
            //run app action
            self.execNextCommand();
        });

        if (this._waitForActionComplete) {
            this.on(MessageDefine.ExecActionComplete, function (action) {
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
//    console.log("execNextCommand:",this._commandIndex);
        if (this._commandIndex < this._action.length) {
            this.execCommand(this._action[this._commandIndex]);
        }
        ++this._commandIndex;
    },

    /**
     * 一个Action对应一个Command
     * @param action
     */
    execCommand:function (command) {
        this._conn.exec(this.getCommand(command));
    },

    getCommand:function (action) {
        if (typeof action == "string") return action;
        if (action.getCommand) return action.getCommand();
        if (action.cmd) return action.cmd;
    },

    /**
     * 检查命令执行完成。包含接收数据结束。
     */
    _checkExecComplete:function () {
        var self = this;
        if (this._checkTimer) clearTimeout(this._checkTimer);
        this._checkTimer = setTimeout(function () {
            self.checkActionFinish();
            //由于在checkActionFinish中触发了ExecActionComplete事件，会引起执行下个动作，所以先检查ExecAllComplete事件。
            self.checkCommandFinish();
        }, this._checkDelay);
    },

    checkCommandFinish:function () {
        this.emit(MessageDefine.ExecActionComplete, this._action[this._commandIndex]);
    },

    checkActionFinish:function () {
//    console.log("this._commandIndex>=this._action.length",this._commandIndex,this._action.length);
        if (this._commandIndex >= this._action.length) {
            console.log(this._conn.host + " :ExecAllComplete");
            this.emit(MessageDefine.ExecAllComplete, this);
        }
    },

    initAction:function (actions) {
        this._action = actions;
        this._commandIndex = 0;
        return this;
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
    }

});


module.exports = Host;