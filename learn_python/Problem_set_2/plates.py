def main():
    plate = input("Plate: ")
    if is_valid(plate):
        print("Valid")
    else:
        print("Invalid")


def is_valid(s):
    #check if the length is greater than 2 and less than 6
    if not ( 2 <= len(s) <= 6):
        return False
    
    #check if there any punctuations or spaces
    if not s.isalnum():
        return False
    
    #check if first two characters are numbers
    if not (s[0].isalpha() and s[1].isalpha()):
        return False
    
    for i, char in enumerate(s):
        
        if char.isdigit():
            #check if first number is 0
            if char == "0":
                return False
            #check if there is any alphabates after the numbers
            return s[i:].isdigit()
        
    #if it checks all conditions then its a valid plate
    return True
     

main()