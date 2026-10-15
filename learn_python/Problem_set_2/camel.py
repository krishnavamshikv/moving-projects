variable_name = input("camelCase: ")

char_list = list(variable_name)

for i in range(len(char_list)):
  if char_list[i].isupper():
    char_list[i] = f"_{char_list[i].lower()}"

snake_case = "".join(char_list)

print("snake_case:", snake_case)
