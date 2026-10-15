# Day 05 - Linux Troubleshooting Drill: CPU, Memory, and Logs

# Scenario: Web app is not responding

1. Check the status of nginx using 
```
sudo systemctl stauts nginx
```

2. if nginx in running state , check if there any long running process that is causing CPU and memory usage spike 
```
top and free -h 
```

3. kill the process ID
```
kill 8432
```

4. check the open ports using 
```
ss -tulpn
```

5. make sure the service is up and running by monitoring logs

```
tail -f /var/log/myapp.log
```
