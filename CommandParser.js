var fs=require('fs');
var CommandType=require('./CommandType');

exports.parseCommand=function(cmd,context){
    var ret=[];
    switch(typeof cmd){
        case 'object':
            switch(cmd.type){
                case CommandType.ShellString://shell string
                    ret.push(cmd.value);
                    break;
                case CommandType.ShellFile://shell file
                    ret.push(getScriptFilesContent(cmd.file));
                    break;
                case CommandType.JavaScriptString://js string
                    //不需要转义脚本中的引号，node会自动处理。
                    ret.push('node -e "'+cmd.value+'"');
                    break;
                case CommandType.JavaScriptFile://js file
                    var cmdContent=getScriptFilesContent(cmd.file);
                    //不需要转义脚本中的引号，node会自动处理。
                    ret.push('node -e "'+cmdContent+'"');
                    break;
                case CommandType.Task:
                    var taskDefine=context[cmd.name];
                    if(!taskDefine)
                        throw new Error("dependence task["+cmd.name+"] is not defined");
                    ret=ret.concat(taskDefine.action||taskDefine.getAction());
                    break;

                default:

                    break;
            }
            break;
        case 'function':
            var result=cmd(context);
            if(result){
                if(result instanceof Array){
                    ret=ret.concat(result);
                }else if(typeof result=="string"){
                    ret.push(result);
                }
            }
            break;
        case 'string':
            ret.push(cmd);
            break;
        default:
            throw "unkown command type";
            break;
    }
    return ret;
};

exports.parseAction=function(action,context){
    var ret=[];
    switch(typeof action){
        case 'object':
            for(var i in action){
                ret=ret.concat(exports.parseCommand(action[i],context));
            }
            break;
        case 'function':
            var result=action(context);
            if(result){
                if(result instanceof Array){
                    ret=ret.concat(result);
                }else if(typeof result=="string"){
                    ret.push(result);
                }
            }
            break;
        case 'string':
            ret.push(action);
            break;
        default:
            throw "unkown command type";
            break;
    }

    return ret;
};

exports.parseDefine=function(define){
    var ret={};
    for(var i in define){
        ret[i]=exports.parseAction(define[i]);
    }
    return ret;
};

function getScriptFilesContent(files){
    var content="";
    if(typeof files=="object"){
        for(var f in files){
            content+=fs.readFileSync(files[f]).toString()+"\n";
        }
    }else{
        content=fs.readFileSync(files).toString();
    }
    return content;
}