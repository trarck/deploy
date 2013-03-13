var spawn = require('child_process').spawn;
var Connetcion=require('./Connection');
var Parser=require('./Parser');

/**
 * 支持多层gateway,直接到达。
 * 可以一步跳出
 * @param config
 */

var ConnectionGateway=Connetcion.extend({

    initialize:function(config){
        this.gateway=config.gateway;
        ConnectionGateway._super_.initialize.apply(this,arguments);
    },

    connect:function(options){
        //-t -t fix teminal err
        var sshOptions=['-t','-t'];

        if(this.gateway){
            sshOptions=sshOptions.concat(this.createGateWaryOptions());
        }else{
            sshOptions.push(this.host);
        }

        ConnectionGateway._super_.connect.call(this,sshOptions);
    },

    createGateWaryOptions:function(){
        var gatewayOptions=[null,""];

        if(typeof this.gateway=="string"){
            gatewayOptions[0]=this.gateway;
        }else{
            var gateway=this.gateway;
            gatewayOptions[0]=gateway[0];
            for(var i=1;i<gateway.length;i++){
                gatewayOptions[1]+="ssh -t -t "+gateway[i]+" ";
            }
        }

        gatewayOptions[1]+="ssh "+this.host;
        return gatewayOptions;
    },

    isUseGateway:function(){
        return this.gateway!=null;
    },

    isLoginToApp:function(){
        return true;
    }
});



module.exports=ConnectionGateway;