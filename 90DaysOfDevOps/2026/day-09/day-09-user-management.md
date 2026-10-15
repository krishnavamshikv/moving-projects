# Day 09 - Linux User and Group Management Challenge

## Task 1: Create Users

```
cmd: sudo useradd tokyo

❯ cat /etc/passwd | tail -n 3 | awk -F ':' '{print $1}'
tokyo
berlin
professor
```

## Task 2: Create Groups

```
cmd: sudo groupadd developers (cat /etc/group)

❯ cat /etc/group | tail -n 2 | awk -F ":" '{print $1}'
developers
admins
```

## Task 3: Assign to groups 

```
cmd: sudo gpasswd -a tokyo developers 
cmd: sudo gpasswd -M tokyo,berlin,professor developers (add multiple users)

❯ cat /etc/group | tail -n 2 | awk -F ":" '{print $0}'
developers:x:1004:tokyo,berlin,professor
admins:x:1005:berlin
```

## Task 4: shared Directory

```
/opt/dev-project🔒
❯ whoami
kv

/opt/dev-project🔒
❯ touch hello
touch: cannot touch 'hello': Permission denied

/opt/dev-project🔒
❯ sudo su tokyo
$ whoami
tokyo
$ touch hello
$ ls
hello
```

## Task 5: Team workspace

```
drwxrwxr-x 2 root project-team 4096 Aug 31 18:51 team-workspace

/opt🔒
❯ cd team-workspace/

/opt/team-workspace🔒
❯ whoami
kv

/opt/team-workspace🔒
❯ touch hello
touch: cannot touch 'hello': Permission denied

/opt/team-workspace🔒
❯ sudo su nairobi
$ whoami
nairobi
$ touch hello
$ ls
hello
```













