import requests
import json
import sys

if len(sys.argv) == 1:
    sys.exit("Missing command-line argument")

try:
    quantity = float(sys.argv[1])
except ValueError:
    sys.exit("Command-line argument is not a number")

try:
    response = requests.get("https://rest.coincap.io/v3/assets/bitcoin?apiKey=I_wont_give_my_apikey")
    response.raise_for_status()
    response_dict = response.json()
    price=response_dict["data"]["priceUsd"] 
    amount = quantity * float(price)

    print(f"${amount:,.4f}")
except requests.RequestException:
    sys.exit("Link not found/ Rate limit")