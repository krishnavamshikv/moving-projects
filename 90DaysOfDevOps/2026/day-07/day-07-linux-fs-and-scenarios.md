# Day 07 - Linux File System Hierarchy and Scenario-Based Practice

## File system Hierarchy

* / (root) ->  starting point of everything
* /root -> root users directory
* /home -> user home directories
* /etc(et-see) -> configurations 
* /bin -> binaries
* /sbin -> system binaries
* /dev -> device files (Everything in linux is a file , even hardware components )
* /dev/null -> blackhole ( it will not store anything)
* /var -> variable dir used for storing logs 
* /mnt & media -> hdd and usb 
* /tmp -> temporary files (this will be cleaned after every reboot)

## Scenario 1: 

```
A web application service called 'myapp' failed to start after a server reboot.
What commands would you run to diagnose the issue?
Write at least 4 commands in order.
```

1. systemctl status myapp -> to check if its running 
2. systemctl is-enabled myapp -> if its not enabled then it will not run after reboot so will check this. 
3. journalctl -u myapp -n 50 -> to check the logs of app 

## Scenario 2: 

```
Your manager reports that the application server is slow.
You SSH into the server. What commands would you run to identify
which process is using high CPU?.
```

1. i would use top command to check if any other process is using high cpu 
2. i will kill if its a zombie process using the cpu 


## Scenario 3: 

```
A developer asks: "Where are the logs for the 'docker' service?"
The service is managed by systemd.
What commands would you use?
```

```
systemctl status docker

journalctl -u docker -n 50 -> to show only 50 lines 

journalctl -u docker -f -> watch logs
```

## Scenario 4: 

```
A script at /home/user/backup.sh is not executing.
When you run it: ./backup.sh
You get: "Permission denied"

What commands would you use to fix this?
```

1. I would grant executable permissions using chmod 

```
chmod +x ./backup.sh
```



















