# Day 18 - Shell Scripting: Functions and Intermediate Concepts

## Functions 

```
#!/bin/bash

function greet() {
 echo "Hello $1 !"
}

greet kv

function add() {
sum=$(($1+$2))
echo "$sum"
}

add 2 3

check_disk() {
        echo "$(df -h /)"
}

echo "Disk size"
check_disk

echo "Ram Details"
check_memory() {
        echo "$(free -h)"
}

check_memory
```


## strict demo 

```
set -e →
Exit the script immediately if a command fails (returns a non-zero exit status).

set -u →
Treat the use of an undefined/unset variable as an error and exit the script.

set -o pipefail →
Makes a pipeline fail if ANY command in the pipeline fails, rather than only
considering the exit status of the final command.
```

## local variable in function 

it is used for only the specified function 