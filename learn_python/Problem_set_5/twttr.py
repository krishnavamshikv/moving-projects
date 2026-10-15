def main():
    print(shorten("twitter"))


def shorten(word):
    
    VOWELS = {"a", "e", "i", "o", "u", "A", "E", "I", "O", "U" }

    return "".join([c for c in word if c not in VOWELS])


if __name__ == "__main__":
    main()