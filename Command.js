var CommandType=require('./CommandType');
var CommandParser=require('./CommandParser');

exports.run=function(str){
    return {type:CommandType.ShellString,value:str};
};

exports.sudo=function(str){
    return {type:CommandType.ShellString,value:"sudo "+str};
};

exports.runFile=function(filename){
    return {type:CommandType.ShellFile,file:filename};
};

exports.runJSFile=function(filename){
    return {type:CommandType.JavaScriptFile,file:filename};
};

exports.runJS=function(str){
    return {type:CommandType.JavascriptString,value:str};
};

exports.runTask=function(taskName){
    return {type:CommandType.Task,name:taskName};
};

//for out
function CommandOut(){
    this._action=[];
}
CommandOut.prototype.run=function(str){
    this._action.push(exports.run(str));
};

CommandOut.prototype.sudo=function(str){
    this._action.push(exports.sudo(str));
};

CommandOut.prototype.runFile=function(filename){
    this._action.push(exports.runFile(filename));
};

CommandOut.prototype.runJSFile=function(filename){
    this._action.push(exports.runJSFile(filename));
};

CommandOut.prototype.runJS=function(str){
    this._action.push(exports.runJS(str));
};

CommandOut.prototype.runTask=function(taskName){
    this._action.push(exports.runTask(taskName));
};

CommandOut.prototype.getOut=function(context){
    var out=CommandParser.parseAction(this._action,context);
    this._action=[];
    return out;
};
exports.CommandOut=CommandOut;