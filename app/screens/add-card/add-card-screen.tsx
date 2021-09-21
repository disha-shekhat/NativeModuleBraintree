import React, { useState, FC } from "react"
import { View, Alert, TextInput } from "react-native"
import BraintreePaymentModule from "../../native-modules/braintree-payment-module"
import { goBack } from "../../navigators"
import { color } from "../../theme"
import { validation } from "../../utils/validation"
import { styles } from "./styles"
import { Screen, Header, Button } from "../../components"
import { StackScreenProps } from "@react-navigation/stack"
import { NavigatorParamList } from "../../navigators"
import { observer } from "mobx-react-lite"
import { cardholderName } from "card-validator/dist/cardholder-name"

export const AddCardScreen: FC<StackScreenProps<NavigatorParamList, "addCard">> = observer(
  ({ navigation }) => {
    const [cardName, setCardName] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [cvvNumber, setCvvNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [sellerToken, setSellerToken] = useState("")
    var valid = require("card-validator")
    // TextInput Reference

    // Handle Input
    const handleCardNumber = (text) => {
      let formattedText = text.split(" ").join("")
      if (formattedText.length > 0) {
        formattedText = formattedText.match(new RegExp(".{1,4}", "g")).join(" ")
      }
      setCardNumber(formattedText)
      return formattedText
    }

    const handleDateChnage = (text) => {
      if (text.indexOf(".") >= 0 || text.length > 5) {
        return
      }
      if (text.length === 2 && expiryDate.length === 1) {
        text += "/"
      }
      setExpiryDate(text)
    }

    // Check Card Validation
    const handleError = (message) => {
      Alert.alert(message)
    }

    const checkMonthAndYear = () => {
      if (
        parseInt(expiryDate.slice(-2)) >=
          parseInt(new Date().getFullYear().toString().substr(-2)) &&
        parseInt(expiryDate.substring(0, 2)) < 13
      ) {
        var isExpiryValid = true
        if (
          parseInt(expiryDate.slice(-2)) ===
          parseInt(new Date().getFullYear().toString().substr(-2))
        ) {
          if (
            parseInt(expiryDate.substring(0, 2)) < 13 &&
            parseInt(expiryDate.substring(0, 2)) > new Date().getMonth()
          ) {
          } else {
            isExpiryValid = false
          }
        }
        if (isExpiryValid) {
        } else {
          isExpiryValid = false
        }
      } else {
        isExpiryValid = false
      }
      return isExpiryValid
    }

    const checkValidation = async () => {
      const numberValidation = valid.number(cardNumber.trim())
      const maxCardNumber = 19
      let cond1 =
        parseInt(expiryDate.slice(-2)) === parseInt(new Date().getFullYear().toString().substr(-2))
      let cond2 = parseInt(expiryDate.substring(0, 2)) < new Date().getMonth()
      switch (false) {
        case validation.textInputCheck(cardName):
          handleError("ALERT_PAYMENT_CARDHOLDER_NAME_BLANK")
          break
        case validation.textInputCheck(cardNumber):
          handleError("ALERT_PAYMENT_CARD_NUMBER_BLANK")
          break
        case validation.textInputCheck(expiryDate):
          handleError("ALERT_PAYMENT_CARD_DATE_BLANK")
          break
        case validation.textInputCheck(cvvNumber):
          handleError("ALERT_PAYMENT_CARD_CVV_BLANK")
          break
        case validation.onlyAlphabets(cardName):
          handleError("ALERT_PAYMENT_CARD_HOLDER_WRONG")
          break
        case numberValidation.isValid:
          handleError("ALERT_PAYMENT_CARD_NUMBER_WRONG")
          break
        case cardNumber.toString().trim().length ===
          (numberValidation.card.lengths[0] + 3 || maxCardNumber):
          handleError("ALERT_PAYMENT_CARD_NUMBER_WRONG")
          break
        case parseInt(expiryDate.slice(-2)) >=
          parseInt(new Date().getFullYear().toString().substr(-2)):
          handleError("ALERT_PAYMENT_CARD_DATE_WRONG")
          break
        case checkMonthAndYear():
          handleError("ALERT_PAYMENT_CARD_DATE_WRONG")
          break
        case cvvNumber.toString().trim().length === (numberValidation.card.code.size || 4):
          handleError("ALERT_PAYMENT_CARD_CVV_WRONG")
          break
        default:
          generateTokenAPI()
      }
    }

    //generate payment token
    const generateTokenAPI = async () => {
      console.log("TOKEN IS GOING to get")

      let cardResponse = await BraintreePaymentModule.getCardNonce(
        cardNumber,
        expiryDate.substring(0, 2),
        expiryDate.slice(-2),
        cvvNumber,
        "sandbox_rz2z5yvd_8fvhdzyrn8t7vcp8",
      )
      console.log("cardResponse", cardResponse)
      if (cardResponse.status) {
        console.log("token ===>", cardResponse.token)
        Alert.alert(cardResponse.token)
      } else {
        Alert.alert("ALERT_SOMETHING_WRONG")
      }
    }

    return (
      <View testID="addCardScreen" style={styles.FULL}>
        <Screen style={styles.FULL} preset="scroll" backgroundColor={color.transparent}>
          <Header headerText="Add card" style={styles.HEADER} titleStyle={styles.HEADER_TITLE} />
          <TextInput
            value={cardName}
            style={styles.textInput}
            placeholder="Enter name"
            onChangeText={(text) => {
              setCardName(text)
            }}
            maxLength={30}
          />
          <TextInput
            value={cardNumber}
            style={styles.textInput}
            placeholder="Enter Card Number"
            onChangeText={(text) => {
              handleCardNumber(text)
            }}
            maxLength={19}
          />
          <TextInput
            value={expiryDate}
            style={styles.textInput}
            placeholder="MM/YY"
            onChangeText={(text) => {
              handleDateChnage(text)
            }}
            maxLength={5}
          />
          <TextInput
            value={cvvNumber}
            style={styles.textInput}
            placeholder="CVV"
            onChangeText={(text) => {
              setCvvNumber(text)
            }}
            maxLength={4}
          />

          <Button
            style={styles.BUTTON_CONTAINER}
            textStyle={styles.BUTTON_TITLE}
            text="Get Token"
            onPress={() => {
              checkValidation()
            }}
          />
        </Screen>
      </View>
    )
  },
)
