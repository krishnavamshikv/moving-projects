while True:
  fraction = input("Fraction: ")

  try: 
    x, y = fraction.split("/")
    x = int(x)
    y = int(y)

    if x < 0 or y <= 0 or x > y:
      continue

    percentage = round(x/y *100)
    if percentage >= 99:
      print("F")
    elif percentage <= 1:
      print("E")
    else:
      print( f"{percentage}%")

    break
  except(ValueError , ZeroDivisionError):
    pass 
