BASE_DIR=~/git/PorscheServer
PIDFILE=$BASE_DIR/run/ngCore-Server.pid

func_stop()
{
   if [ -f $PIDFILE ]; then
     kill -TERM `cat $PIDFILE`
     echo stop ngServer1 `cat $PIDFILE`
     rm $PIDFILE
   else
     echo stoped ngServer2
   fi
}

func_start()
{
   if [ -f $PIDFILE ]; then
      if [ -d /proc/`cat $PIDFILE` ]; then
         echo stop ngServer$AppNum first
         exit;
      else
         rm $PIDFILE
      fi
   fi

   cd $BASE_DIR
   node0.6 ngCore/bin/ngServer server > /dev/null 2>&1 &
   sleep 1
   echo start ngServer `cat $PIDFILE`
}


