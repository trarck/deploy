var fs=require('fs');
var path=require('path');
var yhnode=require('yhnode');
var Deploy=require('./Deploy');

var opts = [
    {
        full:'configPath',
        description:"config file path.default is ./deploy"
    },

    {
        full:'help',
        type:"boolean",
        defaultValue:true,
        description:"show this"
    }
];

var result = yhnode.base.ArgParser.parse(opts);

var options = result.options;
var cmds = result.cmds;

var workPath=process.env.PWD;

var configPath=path.join(workPath,"./deploy");


//console.log(result);

if (options.help != null || cmds.length<2) {
    showUsage();
} else {
    configPath=options.configPath||configPath;

    var stage=cmds[0];
    var stageFile=path.join(configPath,stage);

    var stageConfig=require(stageFile);

    initLog(stageConfig.log);

    var deploy=new Deploy(stageConfig);
    deploy.initHosts();

//    deploy.setTaskManager(new TaskManager());
    deploy.initTasks();

    deploy.runTasks(cmds.slice(1));

}


function showUsage() {
    var out = "Usage:node deploy [options] stage task[,task]\n";
    console.log(out + "\n" + result.usage);
}


var logOut;

function initLog(log){
    if(log){
        if(typeof log=="string"){
            logOut=fs.openSync(log,'a+');
            global.DLog=fileLog;
        }else if(typeof log=="function"){
            global.DLog=log;
        }
    }else{
        global.DLog=console.log;
    }
}


function fileLog(){
    console.log.apply(console,arguments);
    var msg=Array.prototype.join.call(arguments," ");
//    msg=Utils.clearEscape(msg);
    msg+="\n";
    msg=(new Date()).getTime()+" "+msg;
    fs.write(logOut,msg);
}




