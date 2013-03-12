/**
 * 关于task的定义。
 * 版本1(直接包含)：如果某个task需要另外一个task，则把被需要的task的内容，复制到当前的task命令中。因此，被需要的task要事先定义，
 * 版本2(引用执行):Command的每条指令为一个对象，当执行时，调用Command的exec方法。
 */
var Command=require('../Command');
var CommandOut=require('../CommandOut');
/**
 * action=[command,command]
 */
var config={
    version:1,
    gateway:"root@119.15.138.4",
    log:"test.log",
    apps:["mgsys@cgwdev22","mgsys@cgwdev09"],//,"root@119.15.138.4"
    dbs:[],

    shell:false,//use command

    tasks:[
        {
            name:"exit",
            //default is shell command
            action:[Command.run("exit")]
        },
        {
            name:"init",
            //default is shell command
            action:function(context,options){
                var cmdOut=new CommandOut;
                cmdOut.run("cd test");
                cmdOut.run("ls");
                return cmdOut.getOut(context,options);
            }
        },
        {
            name:"test",

            action:[
                Command.runJSFile("./scripts/t.js"),
                function(context,options){
                    var cmdOut=new CommandOut;
                    cmdOut.runTask("exit");
                    return cmdOut.getOut(context,options);
                }
            ],
            role:"app"
        },
        {
            name:"update",

            dependences:[],

            action:[
                Command.runJSFile("./scripts/t.js"),
                Command.run("ll"),
                Command.runTask("exit")
            ],

            role:"app"
        }
    ]
};

module.exports=config;