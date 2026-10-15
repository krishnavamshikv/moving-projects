from pyfiglet import Figlet
import sys
import random

# to know the methods available in this module
#help(Figlet)

f = Figlet()
fonts = f.getFonts()

if len(sys.argv) ==1:
  font = random.choice(fonts)
  print(f"Selected font: {font}")
elif len(sys.argv) ==3:
  if sys.argv[1] not in {"-f", "--font"} or sys.argv[2] not in fonts:
    sys.exit("Invalid usage")
  font = sys.argv[2]
else:
  sys.exit("Invalid usage")

f.setFont(font=font)
message = input("Input: ")
print(f.renderText(message))

