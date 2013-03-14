var MessageDefine=require('./MessageDefine');

var Token={
    Login:"login",
    Logout:"logout",
    CommandIdle:[0x24,0x23,0x3e],
    ConnectionClose:/Connection to .* closed/
};

var Status={
    None:0,
    Gateway:1,
    Logined:2,
    Logout:3
};

function Parser(connection){
	this._connection=connection;
    this._status=0;
}

Parser.prototype={
	
	parse:function(data){

//        this._connection._log("status:"+this._status,data.toString());

        var dataString=Buffer.isBuffer(data)?data.toString():data;

        switch(this._status){
            case Status.None:
                if(this.checkLogined(dataString)){
                    this.doLogin();
                }
                break;
            case Status.Gateway:
                if(this.checkLogined(dataString)){
                    this.doLogin();
                }
                break;
            case Status.Logined:
                //recive out put
//                this._connection.emit(MessageDefine.Data,data);

                if(this.checkLogout(dataString)){
                    this._status=Status.Logout;
                    this._connection.emit(MessageDefine.Logout);
                }
//                var dataString=Buffer.isBuffer(data)?data.toString():data;
//                if(this.checkCommandIdle(dataString)){
//                    this._connection.emit(MessageDefine.CommandIdle);
//                }
                break;
            case Status.Logout:

                break;
            default:
                break;
        }

	},

    parseError:function(data){
        var dataString=Buffer.isBuffer(data)?data.toString():data;
        if(!this.check(dataString,Token.ConnectionClose)){
            this._connection.emit(MessageDefine.Error,data);
        }
    },

    doLogin:function(){
        if(this._connection.isLoginToApp()){
            this._status=Status.Logined;
            this._connection.emit(MessageDefine.Login);
        }else{
            this._status=Status.Gateway;
            this._connection.emit(MessageDefine.GatewayLogin);
        }
    },

	checkLogined:function(str){
		return str.indexOf(Token.Login)>-1;
	},

    checkLogout:function(str){
        return str.indexOf(Token.Logout)>-1;
    },

    checkCommandFinish:function(str){

//        return str.indexOf(this._connection.getHost())>-1 && ()

    },

    checkCommandIdle:function(str){
        var last2Code=str.charCodeAt(str.length-2);

        var ret=Token.CommandIdle[0]==last2Code||Token.CommandIdle[1]==last2Code||Token.CommandIdle[2]==last2Code;

//        console.log(ret,last2Code);
        return ret;
    },

    check:function(str,exp){
        if(exp instanceof RegExp){
            return exp.test(str);
        }else if(typeof exp!="object"){
            return str.indexOf(exp)>-1;
        }else{
            var handle=exp.handle;
            var data=exp.data;
            var context=exp.context||this;
            var args=[str];

            if(data instanceof Array){
                args=args.concat(data);
            }else{
                args.push(data);
            }

            if(typeof handle=="function"){
                handle.apply(context,args);
            }else if(this[handle]){
                this[handle].apply(context,args);
            }
        }
    }
};

Parser.Status=Status;
module.exports=Parser;
