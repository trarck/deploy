var BaseObject=require('./BaseObject');

var DataReceiver=BaseObject.extend({

    initialize:function(){
        this.reset();
    },

    reset:function(){
        this._receiveBuffers=[];
        this._receiveSize=0;
        this._data=null;
    },

    receive:function(buffer){
//        if(!this._data){
//            this._data=buffer;
//        }else{
//            this._data=Buffer.concat([this._data,buffer]);
//        }

        this._receiveBuffers.push(buffer);
        this._receiveSize+=buffer.length;
        this._data=null;
    },

    getData:function(){
        if(!this._data){
//            var buffer = new Buffer(this._receiveSize), pos = 0;
//            for(var i = 0, l = this._receiveBuffers.length; i < l; i++) {
//                this._receiveBuffers[i].copy(buffer, pos);
//                pos += this._receiveBuffers[i].length;
//            }
//            this._data=buffer;
            this._data=Buffer.concat(this._receiveBuffers,this._receiveSize);
        }
        return this._data;
    },

    receiveEnd:function(){
        this.reset();
    }

});