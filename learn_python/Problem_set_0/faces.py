def main():
  message = input("Enter your message \n")

  print(convert(message))

def convert(message):
  emoticon_map = {
    ":)" : "🙂" , 
    ":(" : "🙁"
  }

  #split message into words

  words = message.split(" ")

  converted_words = [emoticon_map.get(word , word) for word in words]

  return " ".join(converted_words)

main()