import random


def main():
    level_num = get_level()
    
    score = 0
    for _ in range(10):  
      x = generate_integer(level_num)
      y = generate_integer(level_num)
      ans = x + y
      trys = 3

      while trys > 0:
          try: 
           user_ans = int(input(f"{x} + {y} = "))
           if ans == user_ans:
               score += 1
               break
           else:
               print("EEE")
               trys -= 1
           
          except ValueError:
              print("EEE")
              trys -= 1
              pass
      if trys== 0:
          print(f"{x} + {y} = {ans}")


    print(f"Score: {score}")
          

def get_level():
    while True: 
        try:
            l = int(input("Level: "))
            if l in [1, 2, 3]:
                return l
            else:
                continue
        except ValueError:
            pass


def generate_integer(level):
    if level == 1: 
        return random.randint(0, 9)
    elif level == 2:
        return random.randint(10,99)
    elif level == 3:
        return random.randint(100,999)
    else: 
        raise ValueError("Invalid level")


if __name__ == "__main__":
    main()