# Day 06 - Linux Fundamentals: Read and Write Text Files

## steps 

1. touch notes.txt -> to create file
2. echo "Line 1" > notes.txt -> redirect text to notes.txt which will insert the text
3. echo "Line 2" >> notes.txt -> apped the text in file
4. echo "Line 3" | tee -a notes.txt -> to print the output to screen and the append the output to file
5. cat notes.txt -> to view the file 
6. head -n 2 notes.txt -> show top 2 lines of file 
7. tail -n 2 notes.txt -> show bottom 2 lines of file. 
