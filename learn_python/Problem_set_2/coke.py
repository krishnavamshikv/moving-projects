amount_due = 50

while amount_due > 0:
  print(f"Amount Due: {amount_due}")
  inserted_coin = int(input("Insert Coin: "))
  if inserted_coin in {25, 10, 5}:
    amount_due -= inserted_coin


#abs changes negative number to positive -10 -> 10, in other words no sign
print(f"Change Owed:{abs(amount_due)}")
