var spawn = require('child_process').spawn;
var util = require("util");
var events = require("events");
var yhnode=require('yhnode');

var Parser=require('./Parser');
var MessageDefine=require('./MessageDefine');
var Connection=require('./Connection');


/**
 * 复杂的网关，支持多层。使用命令跳转
 * @param config
 */
var ConnectionGatewayMulty=Connection.extend({

    initialize:function(config){
        ConnectionGatewayMulty._super_.initialize.apply(this,arguments);
        this.gateway=typeof config.gateway=="string"?[config.gateway]:config.gateway;
        this._loginedGatewayIndex=0;
    },
    connect:function(){

        var options=['-t','-t'];
        if(this.gateway && this.gateway.length){
            options.push(this.gateway[this._loginedGatewayIndex]);
        }else{
            options.push(this.host);
        }

        ConnectionGatewayMulty._super_.connect.call(this,options);

        this.loginToHost();
    },
    loginToHost:function(){
        var self=this;
        this.on(MessageDefine.GatewayLogin,function(){
            self._loginedGatewayIndex++;
            console.log("loginToHost:",self._loginedGatewayIndex)
            if(self._loginedGatewayIndex<self.gateway.length){
                var gateway=self.gateway[this._loginedGatewayIndex];
                gateway && self.exec("ssh -t -t "+gateway);
            }else{
                self.exec("ssh  "+self.host);
            }
        });
    },
    isLoginToApp:function(){
        if(this._loginedGatewayIndex>=this.gateway.length){
            return true;
        }
        return false;
    },
    isUseGateway:function(){
        return this.gateway!=null && this.gateway.length;
    }
});

module.exports=ConnectionGatewayMulty;