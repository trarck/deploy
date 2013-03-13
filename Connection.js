var spawn = require('child_process').spawn;
var BaseObject=require('./BaseObject');
var Parser=require('./Parser');

/*
 * 没有gateway，跳转在命令里实现。
 */
var Connection=BaseObject.extend({

    initialize:function(config){

        this.host=config.host;
        this._parser=new Parser(this);
        this._log=config.log;

        this._isConnected=false;
    },

    connect:function(options){
        //-t -t fix teminal err
        var sshOptions=options||['-t','-t',this.host];

        this._ssh=spawn('ssh',sshOptions);

        this._initEvent();

        this._isConnected=true;

        this._initParserEvent();

    },

    close:function(options){
        if(this._isConnected && this._ssh){
            this._ssh.kill();
            this._close();
        }
    },

    exec:function(cmd,env,cb){
        if (typeof env === 'function') {
            cb = env;
            env = undefined;
        }
        //add \n
        cmd=cmd[cmd.length-1]!="\n"?cmd+"\n":cmd;
        this._ssh.stdin.write(cmd);
    },

    _cleanup:function(options){
        if( this._ssh){
            console.log("Connection:cleanup");
            this._ssh.stdin.removeAllListeners();
            this._ssh.stdin.destroySoon();
            this._ssh.stdout.removeAllListeners();
            this._ssh.stdout.destroy();
            this._ssh.stderr.removeAllListeners();
            this._ssh.stderr.destroy();
            this._ssh.removeAllListeners();
            this._ssh=null;
        }
    },

    _close:function(){
        this._cleanup();
        this._isConnected=false;
    },

    _initEvent:function(){

        var self=this;
        var ssh=this._ssh;

        ssh.on('exit',function(code,signal){
            self._log("exit:",code,signal);
            self.emit("exit",code,signal);
        });

        ssh.on('close',function(){
            self._log("close:");
            self.emit("close");
            self._close();
        });

        ssh.on('disconnect',function(){
            self.emit("disconnect");
        });

        ssh.stdout.on('data', function (data) {
            self._log("stdout[data]",data.toString());
            self.emit("data",data);
        });

        ssh.stdout.on('end', function (data) {
            self.emit("end");
        });

        ssh.stdout.on('error',function(ex){
            self.emit("exception",ex);
        });

        ssh.stdin.on('drain',function(){
            self.emit("drain");
        });

        ssh.stdin.on('error',function(ex){
            self.emit("exception",ex);
        });

        ssh.stderr.on('data', function (data) {
            self._log("stderr[data]",data.toString());
            self.emit("error",data);
        });

    },

    _initParserEvent:function(){
        var self=this;
        this._ssh.stdout.on("data",function(data){
            self._parser.parse(data);
        });

        this._ssh.stderr.on("error",function(data){
            self._parser.parseError(data);
        });
    },

    isLoginToApp:function(){
        return true;
    },

    isConnected:function(){
        return this._isConnected;
    },

    setHost:function(host){
        this.host=host;
        return this;
    },

    getHost:function(){
        return this.host;
    }
});

module.exports=Connection;