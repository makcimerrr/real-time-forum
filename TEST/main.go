package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

var bytes = []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05}
// This should be in an env file in production
const MySecret string = "abc&1*~#^2^#s0^=)^^7%b34"
func Encode(b []byte) string {
 return base64.StdEncoding.EncodeToString(b)
}
func Decode(s string) []byte {
 data, err := base64.StdEncoding.DecodeString(s)
 if err != nil {
  panic(err)
 }
 return data
}
// Encrypt method is to encrypt or hide any classified text
func Encrypt(text, MySecret string) (string, error) {
 block, err := aes.NewCipher([]byte(MySecret))
 if err != nil {
  return "", err
 }
 plainText := []byte(text)
 cfb := cipher.NewCFBEncrypter(block, bytes)
 cipherText := make([]byte, len(plainText))
 cfb.XORKeyStream(cipherText, plainText)
 return Encode(cipherText), nil
}
// Decrypt method is to extract back the encrypted text
func Decrypt(text, MySecret string) (string, error) {
 block, err := aes.NewCipher([]byte(MySecret))
 if err != nil {
  return "", err
 }
 cipherText := Decode(text)
 cfb := cipher.NewCFBDecrypter(block, bytes)
 plainText := make([]byte, len(cipherText))
 cfb.XORKeyStream(plainText, cipherText)
 return string(plainText), nil
}
func main() {
 // To decrypt the original StringToEncrypt
 decText, err := Decrypt("ByVt4QxJYvQRbOzycQKHDkGKi+TAhsZCu4awW5ZbgFCN1+ONewTJSpQPSPE=", MySecret)
 if err != nil {
  fmt.Println("error decrypting your encrypted text: ", err)
 }
 fmt.Println(decText)
} 

func generateSessionToken() (string, error) {
	token := make([]byte, 32) // Crée un slice de bytes de 32 octets

	_, err := rand.Read(token)
	if err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(token), nil
}



/*func main() {
	sessionToken, err := generateSessionToken()
	if err != nil {
		panic(err)
	}

	println("Session Token:", sessionToken)

	encryptedToken, err := HashString(sessionToken)
	if err != nil{
		return
	}
	println("Encrypted Session Token:", encryptedToken)

	decryptedToken, err := DehashString(encryptedToken)
	if err != nil{
		return
	}
	println("Decrypted Session Token:", decryptedToken)


}
*/