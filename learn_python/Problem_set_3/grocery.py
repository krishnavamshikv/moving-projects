item_list = {}

while True:
  try:
    item = input().strip().upper()
    
    if item in item_list:
      item_list[item] += 1
    else:
      item_list[item] = 1
  except EOFError:
    break


for item, count in sorted(item_list.items()):
  print(f"{count} {item}")


