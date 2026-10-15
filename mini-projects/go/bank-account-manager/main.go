package main

import (
	"errors"
	"fmt"
)

// struct Account
type Account struct {
	AccountNumber string
	Balance       float64
	OwnerName     string
}

// Operations on Account
func (acc *Account) Depoist(amount float64) error {
	if amount <= 0 {
		return errors.New("depoist must be positive")
	}

	acc.Balance += amount
	fmt.Printf("Depoisted %.2f to %s. New Balance $%.2f\n", amount, acc.AccountNumber, acc.Balance)
	return nil
}

func (acc *Account) Withdraw(amount float64) error {
	if amount <= 0 {
		return errors.New("withdrawal must be positive\n")
	}

	if acc.Balance < amount {
		return fmt.Errorf("Insufficent funds in %s. Available Balance $%.2f\n", acc.AccountNumber, acc.Balance)
	}

	acc.Balance -= amount
	fmt.Printf("Withdrew %.2f from %s. New Balance $%.2f\n", amount, acc.AccountNumber, acc.Balance)
	return nil
}

func (acc *Account) GetBalance() float64 {
	return acc.Balance
}

func (acc *Account) String() string {
	return fmt.Sprintf("Account [%s] Owner: %s , Balance: $%.2f\n",
		acc.AccountNumber, acc.OwnerName, acc.Balance)
}

type SavingsAccount struct {
	Account      // embedded
	InterestRate float64
}

func (sa *SavingsAccount) AddInterest() {
	interest := sa.Balance * sa.InterestRate
	fmt.Printf("Adding interest $%.2f to savings account %s\n", interest, sa.AccountNumber)
	err := sa.Depoist(interest)
	if err != nil {
		fmt.Printf("Error Depoisting interest.")
	}
}

type OverDraftAccount struct {
	Account        // embedded
	OverDraftLimit float64
}

// below method will override the account Withdraw method.
func (oa *OverDraftAccount) Withdraw(amount float64) error {
	if amount <= 0 {
		return errors.New("withdrawal must be positive")
	}

	if (oa.Balance + oa.OverDraftLimit) < amount {
		return fmt.Errorf("Withdrawal of $%.2f exceeds overdraft limit for %s. Available including overdraft: $%.2f",
			amount, oa.AccountNumber, oa.Balance)
	}

	oa.Balance -= amount
	fmt.Printf("Withdrew %.2f from %s. New Balance $%.2f\n", amount, oa.AccountNumber, oa.Balance)
	return nil
}

func main() {
	fmt.Println("----Bank Account System----")

	savAcc := SavingsAccount{
		Account: Account{
			AccountNumber: "SAV001",
			Balance:       1000,
			OwnerName:     "krishna Vamshi",
		},
		InterestRate: 0.02,
	}

	fmt.Println("----Savings account operations----")
	fmt.Println(savAcc.Account.String())

	err := savAcc.Depoist(200) // promoted , cause savings account doesn't have this method its coming from Account.
	if err != nil {
		fmt.Printf("Error: %s", err)
	}
	savAcc.AddInterest()
	err = savAcc.Withdraw(50)
	if err != nil {
		fmt.Printf("Error: %s", err)
	}
	fmt.Printf("Final Savings Details: %s", savAcc.Account.String())

	ovdAcc := OverDraftAccount{
		Account: Account{
			AccountNumber: "OVD001",
			Balance:       100,
			OwnerName:     "krishna Vamshi OVD",
		},
		OverDraftLimit: 200,
	}

	fmt.Println("----Overdraft account operations----")
	fmt.Println(ovdAcc.Account.String())

	err = ovdAcc.Depoist(50)
	if err != nil {
		fmt.Println("Error:", err)
	}

	err = ovdAcc.Withdraw(100)
	if err != nil {
		fmt.Println("Error: ", err)
	}

	err = ovdAcc.Withdraw(300) // overridden , cause OVD type has a withdraw method.
	if err != nil {
		fmt.Println("Error: ", err)
	}

	fmt.Printf("Final Overdraft Details: %s", ovdAcc.Account.String())

}
