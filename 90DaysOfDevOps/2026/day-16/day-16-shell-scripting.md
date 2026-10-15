# Day 16 - Shell Scripting Basics

## Notes

**shebang** -> makes the file a bash script 

**variables** -> $name 

**input** -> read name , read -p "this is for the prompt" name
**if-else** 
```
if [[ num -gt 0 ]];
then 
  echo "Positive"
elif [[ num == 0 ]];
then 
  echo "Zero"
else 
  echo "Negative"
```

** check if file is exists** 
```
if [[ -f "$filename" ]]
```