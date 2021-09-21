//
//  BraintreePayment.m
//  bl297_reactnative_2
//
//  Created by MAC241 on 07/06/21.
//

#import <React/RCTBridgeModule.h>
@interface RCT_EXTERN_MODULE(BraintreePaymentModule, NSObject)
RCT_EXTERN_METHOD(getCardNonce:(NSString *)cardNumber expiryMonth:(NSString *)expiryMonth expiryYear:(NSString *)expiryYear cvv:(nonnull NSString *)cvv key:(NSString *)key callback:(RCTPromiseResolveBlock)callback reject:(RCTPromiseRejectBlock)reject );
@end
