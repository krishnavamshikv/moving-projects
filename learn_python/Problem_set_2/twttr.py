VOWELS = {"a", "e", "i", "o", "u", "A", "E", "I", "O", "U" }

input_string = input("Input: ")

for c in input_string:
  if c in VOWELS:
    input_string = input_string.replace(c, "")

print(f"Output: {input_string}")