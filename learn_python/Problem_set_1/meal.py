def main():
    current_time = input("What time is it? ")
    converted_time = convert(current_time)

    if 7 <= converted_time <= 8:
        print("breakfast time")
    elif 12 <= converted_time <= 13:
        print("lunch time")
    elif 18 <= converted_time <= 19:
        print("dinner time")

def convert(time):
    words = time.split(":")
    hours = int(words[0])
    minutes = round(int(words[1])/60)
    return hours + minutes


if __name__ == "__main__":
    main()