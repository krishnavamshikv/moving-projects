months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

while True:
    d = input("Date: ").strip()
    try:
      if "/" in d:
        month, day, year = d.split("/")
        month = int(month)
        day = int(day)
        year = int(year)
      elif "," in d: 
        parts = d.replace(",", "").split()

        if len(parts) != 3:
           continue

        if month not in months:
           continue
        
        month, day, year = parts
        month = months.index(month) + 1
        day = int(day)
        year = int(year)
      else: 
         continue

      if  1 <= month <= 12 and 1 <= day <= 31:
         print(f"{year:04}-{month:02}-{day:02}")
         break
            
    except ValueError:
      pass
