/**
* 关于task的定义。
* 版本1(直接包含)：在处理阶段生成命令的字符串。如果某个task需要另外一个task，则把被需要的task的内容，复制到当前的task命令中。因此，被需要的task要事先定义，
*              有一个问题，由于在处理命令阶段已经生成最终执行的命令字符串，无法动态替换主机名。可以通过在Host,执行execCommand时进行替换。
* 版本2(引用执行):在处理阶段生成Command对象，当执行时，调用Command的exec方法。
 *             就是Task调用另外一个Task时的role问题。比如一个app的调用一个通用的task.
 *             解决办法：被调用的任务只作用在当前调用任务的那个host上，不作用其它host.其它host上被调用的任务会被其它调用的任务调用。
* 这里使用版本2。
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
                Command.runTask("init"),
                Command.run("ll"),
                Command.runTask("exit")
            ],

            role:"app"
        }
    ]
};

module.exports=config;