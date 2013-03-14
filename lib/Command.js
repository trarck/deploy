var yhnode = require('yhnode');
var CommandType = require('./CommandType');

var HoldRegex=/#\{(\w+)\}/g;

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
            if(this._config.replaceHole){
                if(!this._replacedValue){
                    this._replacedValue=Command.replaceOptionsHole(this._config.value);
                }
                return this._replacedValue;
            }else{
                return this._config.value;
            }
        },

        replacePlaceHodlders:function (cmd, conn) {
            var hodlerRegex=/#\{HOST\}/g;
            return hodlerRegex.test(cmd)?cmd.replace(hodlerRegex, conn.getHost()):cmd;
        }

    }, content:{

        run:function(str){
            return {type:CommandType.Command,value:str,replaceHole:true};
        },

        runFile:function(filename){
            return {type:CommandType.CommandFile,file:filename,replaceHole:true};
        },

        shell:function(str){
            return {type:CommandType.ShellString,file:str,replaceHole:true};
        },

        shellFile:function(str){
            return {type:CommandType.ShellFile,file:filename,replaceHole:true};
        },

        runJS:function(str){
            return {type:CommandType.JavascriptString,value:str,replaceHole:true};
        },

        runJSFile:function(filename){
            return {type:CommandType.JavaScriptFile,file:filename,replaceHole:true};
        },

        runTask:function(taskName){
            return {type:CommandType.Task,name:taskName};
        },

        sudo:function(str){
            return {type:CommandType.Sudo,value:str,replaceHole:true};
        },

        sudoWrap:function(cmd){
            return {type:CommandType.SudoWrap,cmd:cmd,replaceHole:true};
        },

        options:{},

        addOption:function(key,value){
            this.options[key]=value;
        },

        addOptions:function(obj){
            yhnode.base.Core.mixin(true,this.options,obj);
        },

        //1.在书写代码的时候调用
        //2.在Parser的时候检查
        replaceOptionsHole:function(str){
            var options=this.options;
            return HoldRegex.test(str)?
                str.replace(HoldRegex,function(all,name){
                    return options[name]||all;
                })
                :str;
        },

        _:function(){
            return Command.replaceOptionsHole.apply(Command,arguments);
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
        var innerCmd=(this._config.value instanceof Command)?this._config.value.getExecString():
            ((this._config.value instanceof Array )?this._config.value[0]:this._config.value);
        return "sudo " + innerCmd;
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

    exec:function (connection,host) {
        this._config.task.continueRunActionOnHost(host);
    }
});

//Command.CommandFunction = yhnode.base.Core.Class(Command, {
//
//    exec:function (connection,host) {
//        var some=new Some(connection,host);//
//        this._config.func.apply(this,arguments);
//    }
//});
//
//var Some={
//    initialize:function(connection,host){
//        this._connection=connection;
//        this._host=host;
//    },
//    run:function(str){
//        var cmd=new Command({value:str,replaceHole:true});
//        cmd.exec(this._connection,this._host);
//    }
//};

module.exports = Command;