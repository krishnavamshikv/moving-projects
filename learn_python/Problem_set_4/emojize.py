import emoji

message = input("Input: ")
print(f"Output: {emoji.emojize(message, language='alias')}")