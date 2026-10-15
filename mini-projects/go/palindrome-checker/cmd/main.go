package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func isPalindrome(name string) bool {
	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, " ", "")

	runes := []rune(name)

	left := 0
	right := len(runes) - 1

	for left < right {
		if runes[left] == runes[right] {
			left++
			right--
		} else {
			return false
		}
	}
	return true
}

func main() {

	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("Enter a word or phrase: ")
	scanner.Scan()
	name := scanner.Text()

	if isPalindrome(name) {
		fmt.Printf("Given string %s is a palindrome \n", name)
	} else {
		fmt.Printf("Given string %s is not a palindrome \n", name)
	}

}
