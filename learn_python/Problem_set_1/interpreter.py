def main():
  expression = input("Expression: ")
  x, y, z = split(expression)

  match y: 
    case "+":
      print( x+z)
    case "-":
      print(x-z)
    case "*":
      print(x*z)
    case "/":
      if z == 0:
        print("Zero division error.")
      else: 
        print(x/z)
    case _:
      print("Undefined operation")

def split(expr) -> tuple[int, str, int]:
  x, y, z = expr.split(' ')
  return int(x), y, int(z)

main()