var BaseObject=require('./BaseObject');
var MessageDefine=require('./MessageDefine');
var Utils=require('./Utils');
var Host=require('./Host');
var TaskManager=require('./TaskManager');

var Deploy=BaseObject.extend({

    initialize:function(config){
        this._config=config;

        this._hosts=[];
        this._apps={

        };
        this._dbs={

        };

        this._taskManager=null;

        this._hostsRunningStatus={};
    },

    initHosts:function(){

        //create application
        var apps=this._config.apps;
        //user the same conf
        var conf;
        if(apps instanceof Array){
            for(var i in apps){
                conf=apps[i];
                this.createApp(conf);
            }
        }else{
            this.createApp(apps);
        }

        //create database
        var dbs=this._config.dbs;
        //user the same conf
        var conf;
        if(dbs instanceof Array){
            for(var i in dbs){
                conf=dbs[i];
                this.createDB(conf);
            }
        }else{
            this.createDB(dbs);
        }
    },

    initTasks:function(){
        var options={
            env:this._config.env,
            shell:this._config.shell
        };
        this._taskManager=new TaskManager(this);
        this._tasks= this._taskManager.parse(this._config.tasks,options);
    },

    createApp:function(appConf){
        var self=this;
        var app=new Host();

        var connConfig=this.createConnectionConfig(appConf);
        app.setup(connConfig);
        app.connect();
        app.on(MessageDefine.ExecAllComplete,function(host){
            self.onTaskComplete(host);
        });

        this._hosts.push(app);
        this._apps[app.getName()]=app;
    },

    createDB:function(appConf){
        var self=this;
        var db=new Host();

        var connConfig=this.createConnectionConfig(appConf);
        db.setup(connConfig);
        db.connect();
        db.on(MessageDefine.ExecAllComplete,function(host){
            self.onTaskComplete(host);
        });

        this._hosts.push(db);
        this._dbs[db.getName()]=db;
    },

    createConnectionConfig:function(appConf){

        var connectionConf={};

        if(this._config.gateway){
            connectionConf.gateway=this._config.gateway;
        }

        if(this._config.log){
            connectionConf.log=this._config.log;
        }

        //check conf
        if(typeof appConf=="string"){
            connectionConf.host=appConf;
        }else{
            connectionConf=Utils.mixin(true,connectionConf,appConf);
        }
        return connectionConf;
    },

    getHosts:function(role){
        switch(role){
            case "app":
                return this._apps;
                break;
            case "db":
                return this._dbs;
                break;
            case "all":
            default:
                return this._hosts;
                break;
        }
        return null;
    },

    runTask:function(taskName){

        console.log("runTask:"+taskName);

        this._runningTask=this._taskManager.getTask(taskName);
        if(!this._runningTask)
            throw new Error("no task fined named "+taskName);

        this._hostsRunningStatus={};

        switch(this._runningTask.getRole()){
            case "app":
                var appHost;
                for(var hostName in this._apps){
                    this._hostsRunningStatus[hostName]=false;
                    appHost=this._apps[hostName];
                    appHost.initAction(this._runningTask.getAction());
                    appHost.execNextCommand();
                }
                break;
            case "db":
                var dbHost;
                for(var hostName in this._apps){
                    this._hostsRunningStatus[hostName]=false;
                    dbHost=this._apps[hostName];
                    dbHost.initAction(this._runningTask.getAction());
                    dbHost.execNextCommand();
                }
                break;
            case "all":
            default:
                var host;
                for(var i in this._hosts){
                    host=this._hosts[i];
                    this._hostsRunningStatus[host.getName()]=false;
                    host.initAction(this._runningTask.getAction());
                    host.execNextCommand();
                }
                break;
        }
    },

    runTasks:function(taskNames){
        var self=this;
        var currentIndex=0;
        this.runTask(taskNames[currentIndex++]);
        this.on(MessageDefine.TaskONRunningHostsComplete,function(){
            if(currentIndex<taskNames.length ){
                self.runTask(taskNames[currentIndex++]);
            } else{
                //all task done
                console.log("all task done");
            }
        });
    },

    onTaskComplete:function(host){
        this._hostsRunningStatus[host.getName()]=true;
        this._checkTaskOnAllRunningHostsComplete();
    },

    _checkTaskOnAllRunningHostsComplete:function(){
        for(var appName in this._hostsRunningStatus){
            if(!this._hostsRunningStatus[appName]){
                return false;
            }
        }
        this.emit(MessageDefine.TaskONRunningHostsComplete);
        return true;
    },
    /**
     *
     * @param conf app config
     */
    createCmds:function(conf,type){
        //通常每个发布执行的命令都一样，可以扩展成每个app运行的命令不同
        var cmds=conf.cmds;
        var befores=cmds.befores||[];
        var afters=cmds.afters||[];
        var types=cmds[type]||[];
        return befores.concat(types).concat(afters);
    },

    setTaskManager:function(taskManager){
        this._taskManager=taskManager;
        return this;
    },

    getTaskManager:function(taskManager){
        return this._taskManager;
    }
});

module.exports=Deploy;


