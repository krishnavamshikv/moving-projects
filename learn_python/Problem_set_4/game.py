import random

while True:
  try: 
    n = int(input("Level: "))
    if n > 0:
      break
  except ValueError:
    pass
    

rand_int = random.randint(1,n)

while True:
  try: 
    guess = int(input("Guess: "))

    if guess <= 0:
      continue
  except ValueError:
    continue

  if guess > rand_int:
    print("Too large!")
  elif guess < rand_int:
    print("Too small!")
  else: 
    print("Just right!")
    break