def main():
    dollars = dollars_to_float(input("How much was the meal? "))
    percent = percent_to_float(input("What percentage would you like to tip? "))
    tip = dollars * percent
    print(f"Leave ${tip:.2f}")


def dollars_to_float(d):
    clean_str = d.replace("$","")
    return float(clean_str)


def percent_to_float(p):
    clean_str = p.replace("%","")
    percentage = int(clean_str)/100
    return float(percentage)


main()