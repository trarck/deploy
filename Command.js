var yhnode = require('yhnode');
var CommandType = require('./CommandType');

var Command = yhnode.base.Core.Class({

    overrides:{

        initialize:function (config) {
            this._config = config;
        },

        exec:function (connection) {
            var execString = this.getExecString(connection);
            connection.exec(execString);
        },

        getExecString:function (connection) {
            var environment = this.getEnvironment();
            var shell = this.getShell();
            var cmd = this.getCommandString();
            cmd = this.replacePlaceHodlders(cmd, connection);

            var execString = shell ? shell + " " + cmd : cmd;
            execString = environment ? environment + " " + execString : execString;
            return execString;
        },

        getEnvironment:function () {
            var env = "";
            var environment = this._config.env;
            if (environment) {
                switch (typeof environment) {
                    case "string":
                        env = environment.substring(0, 3) == "env" ? environment : ("env " + environment);
                        break;
                    case "object":
                        for (var name in environment) {
                            env += name + "=" + environment[name];
                        }
                        if (env) {
                            env = "env " + env;
                        }
                        break;
                    default:
                        break;
                }
            }
            return env;
        },

        getShell:function () {
            return "";
        },

        getCommandString:function () {
            return this._config.value;
        },

        replacePlaceHodlders:function (cmd, conn) {
            var hodlerRegex=/#\{HOST\}/g;
            return hodlerRegex.test(cmd)?cmd.replace(hodlerRegex, conn.getHost()):cmd;
        }


    }, content:{

        run:function(str){
            return {type:CommandType.Command,value:str};
        },

        runFile:function(filename){
            return {type:CommandType.CommandFile,file:filename};
        },

        shell:function(str){
            return {type:CommandType.ShellString,file:str};
        },

        shellFile:function(str){
            return {type:CommandType.ShellFile,file:filename};
        },

        runJS:function(str){
            return {type:CommandType.JavascriptString,value:str};
        },

        runJSFile:function(filename){
            return {type:CommandType.JavaScriptFile,file:filename};
        },

        runTask:function(taskName){
            return {type:CommandType.Task,name:taskName};
        },

        sudo:function(str){
            return {type:CommandType.Sudo,value:str};
        },

        sudoWrap:function(cmd){
            return {type:CommandType.SudoWrap,cmd:cmd};
        }

//        run:function (str) {
//            return new CommandShell({value:str});
//        },
//
//        sudo:function (str) {
//            return new CommandSudo({value:str});
//        },
//
//        runFile:function (filename) {
//            return new CommandShell({value:Utils.getFilesContent(filename)});
//        },
//
//        runJS:function (str) {
//            return new CommandJavaScript({value:str});
//        },
//
//        runJSFile:function (filename) {
//            return new CommandJavaScript({value:Utils.getFilesContent(filename)});
//        },
//
//        runTask:function (taskName) {
//            return new CommandTask({task:taskName});
//        }
    }});

Command.CommandShell = yhnode.base.Core.Class(Command, {

    getShell:function () {
        return this._config.shell === false ? false : ((this._config.shell || "sh") + " -c");
    },
    getCommandString:function () {
        return '"'+this._config.value+'"';
    }
});

Command.CommandSudo = yhnode.base.Core.Class(Command, {

    getExecString:function (connection) {
        var execString = CommandSudo._super_.getExecString.call(this, connection);
        return "sudo " + execString;
    }
});

Command.CommandSudoWrap = yhnode.base.Core.Class(Command, {

    getExecString:function (connection) {
        return "sudo " + (this._config.value instanceof Command)?this._config.value.getExecString():this._config.value;
    },

    getShell:function () {
        return "";
    },

    getEnvironment:function () {
        return "";
    }
});

Command.CommandJavaScript = yhnode.base.Core.Class(Command, {

    getShell:function () {
        return "node -e";
    },
    getCommandString:function () {
        return '"'+this._config.value+'"';
    }
});

Command.CommandTask = yhnode.base.Core.Class(Command, {

    exec:function (connection) {
        this._config.task.run(connection);
    }
});

module.exports = Command;