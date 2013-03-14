var yhnode = require('yhnode');
var CommandParser = require('./CommandParser');
var Command=require('./Command');

module.exports= yhnode.base.Core.Class({

    overrides:{

        initialize:function () {
            this._action = [];
        },

        run:function (str) {
            this._action.push(Command.run(str));
        },

        runFile:function (filename) {
            this._action.push(Command.runFile(filename));
        },

        shell:function (str) {
            this._action.push(Command.shell(str));
        },

        shellFile:function (filename) {
            this._action.push(Command.shellFile(filename));
        },

        runJS:function (str) {
            this._action.push(Command.runJS(str));
        },

        runJSFile:function (filename) {
            this._action.push(Command.runJSFile(filename));
        },

        runTask:function (taskName) {
            this._action.push(Command.runTask(taskName));
        },

        sudo:function (str) {
            this._action.push(Command.sudo(str));
        },

        sudoWrap:function (cmd) {
            this._action.push(Command.sudoWrap(cmd));
        },

        getOut:function (context,options) {
            var out = CommandParser.parseAction(this._action, context,options);
            this._action = [];
            return out;
        }
    }
});