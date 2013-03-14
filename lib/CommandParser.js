var yhnode=require('yhnode');
var CommandType=require('./CommandType');
var Utils = require('./Utils');
var Command=require('./Command');

exports.parseCommand=function(cmd,context,options){
    var ret=[];
    var conf=yhnode.base.Core.mixin({},options);
    switch(typeof cmd){
        case 'object':
            conf.replaceHole=cmd.replaceHole;
            switch(cmd.type){
                case CommandType.Command://shell string
                    conf.value=cmd.value;
                    ret.push(new Command(conf).getExecString());
                    break;
                case CommandType.CommandFile://shell file
                    conf.value=Utils.getFilesContent(cmd.file);
                    ret.push(new Command(conf).getExecString());
                    break;
                case CommandType.ShellString://shell string
                    conf.value=cmd.value;
                    ret.push(new Command.CommandShell(conf).getExecString());
                    break;
                case CommandType.ShellFile://shell file
                    conf.value=Utils.getFilesContent(cmd.file);
                    ret.push(new Command.CommandShell(conf).getExecString());
                    break;
                case CommandType.JavaScriptString://js string
                    conf.value=cmd.value;
                    ret.push(new Command.CommandJavaScript(conf).getExecString());
                    break;
                case CommandType.JavaScriptFile://js file
                    conf.value=Utils.getFilesContent(cmd.file);
                    ret.push(new Command.CommandJavaScript(conf).getExecString());
                    break;
                case CommandType.Task:
                    var task=context.getTask(cmd.name);
                    if(!task)
                        throw new Error("dependence task["+cmd.name+"] is not defined");
                    ret=ret.concat(task.getAction());
                    break;
                case CommandType.Sudo:
                    conf.value=cmd.value;
                    ret.push(new Command.Sudo(conf).getExecString());
                    break;
                case CommandType.SudoWrap:
                    conf.value=exports.parseCommand(cmd.cmd,context,options)[0];
                    ret.push(new Command.SudoWrap(conf).getExecString());
                    break;
                default:
                    break;
            }
            break;
        case 'function':
            var result=cmd(context,options);
            if(result){
                if(result instanceof Array){
                    ret=ret.concat(result);
                }else if(typeof result=="string"){
                    ret.push(result);
                }
            }
            break;
        case 'string':
            conf.value=cmd;
            conf.replaceHole=true;
            ret.push(new Command(conf).getExecString());
            break;
        default:
            throw "unkown command type "+cmd;
            break;
    }
    return ret;
};

exports.parseAction=function(action,context,options){
    var ret=[];
    switch(typeof action){
        case 'object':
            for(var i in action){
                ret=ret.concat(exports.parseCommand(action[i],context,options));
            }
            break;
        case 'function':
            var result=action(context,options);
            if(result){
                if(result instanceof Array){
                    ret=ret.concat(result);
                }else if(typeof result=="string"){
                    ret.push(result);
                }
            }
            break;
        case 'string':
            ret=exports.parseCommand(action,context,options);
            break;
        default:
            throw "unkown command type "+action;
            break;
    }

    return ret;
};