//
//  BraintreePayment.swift
//  bl297_reactnative_2
//
//  Created by MAC241 on 07/06/21.
//

import Foundation

@objc(BraintreePaymentModule)
class BraintreePaymentModule: NSObject {
  
  @objc func getCardNonce(_ cardNumber: String, expiryMonth: String, expiryYear: String, cvv: String, key: String,  callback: @escaping (RCTPromiseResolveBlock), reject: @escaping (RCTPromiseRejectBlock)) {
   NSLog("%@ %@ %@", cardNumber, expiryMonth,expiryYear, cvv, key)
   let braintreeClient = BTAPIClient(authorization: key)!
   let cardClient = BTCardClient(apiClient: braintreeClient)
   let card = BTCard()
   card.number = cardNumber
   card.expirationMonth = expiryMonth
   card.expirationYear = expiryYear
   card.cvv = cvv
   cardClient.tokenizeCard(card) { (tokenizedCard, error) in
    if let tempError = error {
      let errorDict = ["token":" ","status": false,"message":tempError.localizedDescription] as [String : Any]
      callback(errorDict)
    } else {
      if let nonce = tokenizedCard?.nonce {
        let respDict = ["token":nonce,"status": true,"message":""] as [String : Any]
        callback(respDict)
      } else {
        let errorDict = ["token":" ","status": false,"message":"Some thing went wrong. Please try again."] as [String : Any]
       
        callback(errorDict)
      }
    }
   }
  }
}

