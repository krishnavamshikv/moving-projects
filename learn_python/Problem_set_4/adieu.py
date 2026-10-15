import inflect
p = inflect.engine()

names = []
while True: 
  try: 
    name = input("Name: ")
    names.append(name)
  except EOFError:
    break

grammtically_named = p.join(names)
print(f"Adieu, adieu to {grammtically_named}")