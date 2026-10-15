# Day 04 - Linux Practice: Processes and Services

## Process Commands
1. ps 
```
    PID TTY          TIME CMD
  20811 pts/1    00:00:00 sh
  20813 pts/1    00:00:00 bash
  31952 pts/1    00:00:00 ps
```
2. Pgrep -l ssh

```
3885 gcr-ssh-agent
3887 ssh-agent
```

## Service commands

1. systemctl status snapd 

```
● snapd.service - Snap Daemon
     Loaded: loaded (/usr/lib/systemd/system/snapd.service; enabled; preset: enabled)
     Active: active (running) since Thu 2026-08-27 08:39:38 IST; 3h 30min ago
 Invocation: c44b60cade614b88b9f7f917b62b75b0
TriggeredBy: ● snapd.socket
   Main PID: 1599 (snapd)
      Tasks: 18 (limit: 15307)
     Memory: 75.1M (peak: 82.4M)
        CPU: 3.747s
     CGroup: /system.slice/snapd.service
             └─1599 /snap/snapd/current/usr/lib/snapd/snapd
```

2. systemctl list-all --all 

```
  UNIT                                                                                 LOAD      ACTIVE   SUB  DESCRIPTION                                                                    >
● boot.automount                                                                       not-found inactive dead boot.automount                                                                 >
  dev-tpm0.device                                                                      loaded    inactive dead /dev/tpm0
  dev-tpmrm0.device                                                                    loaded    inactive dead /dev/tpmrm0                                                                    >
● boot.mount                                                                           not-found inactive dead boot.mount
● home.mount                                                                           not-found inactive dead home.mount
● sysroot.mount                                                                        not-found inactive dead sysroot.mount
```

## log commands 

1. journalctl -u cron

```
Aug 20 18:09:58 kv systemd[1]: Started cron.service - Regular background program processing daemon.
Aug 20 18:09:58 kv (cron)[5752]: cron.service: Referenced but unset environment variable evaluates to an empty string: EXTRA_OPTS
Aug 20 18:09:58 kv cron[5752]: (CRON) INFO (pidfile fd = 3)
Aug 20 18:09:58 kv cron[5752]: (CRON) INFO (Running @reboot jobs)
Aug 20 18:17:01 kv CRON[10496]: pam_unix(cron:session): session opened for user root(uid=0) by root(uid=0)
Aug 20 18:17:01 kv CRON[10498]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)
Aug 20 18:17:01 kv CRON[10496]: pam_unix(cron:session): session closed for user root
Aug 20 18:30:01 DevOps CRON[14587]: pam_unix(cron:session): session opened for user root(uid=0) by root(uid=0)
Aug 20 18:30:01 DevOps CRON[14589]: (root) CMD (if [ -x /etc/init.d/anacron ] && ! [ -d /run/systemd/system ]; then exec /usr/sbin/invoke-rc.d anacron start >/dev/null; fi)
Aug 20 18:30:01 DevOps CRON[14587]: pam_unix(cron:session): session closed for user root
Aug 20 18:50:44 DevOps systemd[1]: Stopping cron.service - Regular background program processing daemon...
Aug 20 18:50:44 DevOps systemd[1]: cron.service: Deactivated successfully.
```

2. journalctl -u cron | tail -n 10 

```
Aug 27 10:30:01 DevOps CRON[23830]: (root) CMD (if [ -x /etc/init.d/anacron ] && ! [ -d /run/systemd/system ]; then exec /usr/sbin/invoke-rc.d anacron start >/dev/null; fi)
Aug 27 10:30:01 DevOps CRON[23828]: pam_unix(cron:session): session closed for user root
Aug 27 11:17:02 DevOps CRON[26941]: pam_unix(cron:session): session opened for user root(uid=0) by root(uid=0)
Aug 27 11:17:02 DevOps CRON[26943]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)
Aug 27 11:17:02 DevOps CRON[26941]: pam_unix(cron:session): session closed for user root
Aug 27 11:30:01 DevOps CRON[28427]: pam_unix(cron:session): session opened for user root(uid=0) by root(uid=0)
Aug 27 11:30:01 DevOps CRON[28427]: pam_unix(cron:session): session closed for user root
Aug 27 12:17:01 DevOps CRON[33929]: pam_unix(cron:session): session opened for user root(uid=0) by root(uid=0)
Aug 27 12:17:01 DevOps CRON[33931]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)
Aug 27 12:17:01 DevOps CRON[33929]: pam_unix(cron:session): session closed for user root
```






























