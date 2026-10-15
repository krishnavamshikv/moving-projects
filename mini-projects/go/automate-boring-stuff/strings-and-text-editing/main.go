package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"unicode"
)

func isAlpha(r rune) bool {
	return unicode.IsDigit(r) || unicode.IsLetter(r)
}

func main() {

	reader := bufio.NewReader(os.Stdin)

	fmt.Println("Enter the English message to translate into pig latin:")
	message, _ := reader.ReadString('\n')

	// VOWELS := []rune{'a' , 'i' , 'e' , 'o' , 'u'}
	pig_latin := make([]string, 3)

	for word := range strings.SplitSeq(message, " ") {
		prefixNonLetters := ""

		for len(word) > 0 && !isAlpha(int32(word[0])) {
			prefixNonLetters += string(word[0])
			word = word[1:]
		}

		if len(word) == 0 {
			pig_latin = append(pig_latin, prefixNonLetters)
		}

	}
}
