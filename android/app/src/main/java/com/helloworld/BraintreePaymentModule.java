package com.helloworld;

import android.app.Activity;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.braintreepayments.api.BraintreeFragment;
import com.braintreepayments.api.Card;
import com.braintreepayments.api.dropin.DropInActivity;
import com.braintreepayments.api.dropin.DropInRequest;
import com.braintreepayments.api.dropin.DropInResult;
import com.braintreepayments.api.exceptions.InvalidArgumentException;
import com.braintreepayments.api.interfaces.BraintreeErrorListener;
import com.braintreepayments.api.interfaces.PaymentMethodNonceCreatedListener;
import com.braintreepayments.api.models.CardBuilder;
import com.braintreepayments.api.models.CardNonce;
import com.braintreepayments.api.models.PaymentMethodNonce;
import com.braintreepayments.api.models.ThreeDSecureInfo;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

public class BraintreePaymentModule extends ReactContextBaseJavaModule {
  private Promise mPromise;
  private static final int DROP_IN_REQUEST = 0x444;
  private boolean isVerifyingThreeDSecure = false;

  public BraintreePaymentModule(ReactApplicationContext reactContext) {
    super(reactContext);
    ActivityEventListener mActivityListener = new BaseActivityEventListener() {
      @Override
      public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != DROP_IN_REQUEST || mPromise == null) {
          return;
        }
        if (resultCode == Activity.RESULT_OK) {
          DropInResult result = data.getParcelableExtra(DropInResult.EXTRA_DROP_IN_RESULT);
          PaymentMethodNonce paymentMethodNonce = result.getPaymentMethodNonce();
          String deviceData = result.getDeviceData();

          if (isVerifyingThreeDSecure && paymentMethodNonce instanceof CardNonce) {
            CardNonce cardNonce = (CardNonce) paymentMethodNonce;
            ThreeDSecureInfo threeDSecureInfo = cardNonce.getThreeDSecureInfo();
            if (!threeDSecureInfo.isLiabilityShiftPossible()) {
              mPromise.reject("3DSECURE_NOT_ABLE_TO_SHIFT_LIABILITY", "3D Secure liability cannot be shifted");
            } else if (!threeDSecureInfo.isLiabilityShifted()) {
              mPromise.reject("3DSECURE_LIABILITY_NOT_SHIFTED", "3D Secure liability was not shifted");
            } else {
              resolvePayment(paymentMethodNonce, deviceData);
            }
          } else {
            resolvePayment(paymentMethodNonce, deviceData);
          }
        } else if (resultCode == Activity.RESULT_CANCELED) {
          mPromise.reject("USER_CANCELLATION", "The user cancelled");
        } else {
          Exception exception = (Exception) data.getSerializableExtra(DropInActivity.EXTRA_ERROR);
          mPromise.reject(exception.getMessage(), exception.getMessage());
        }
        mPromise = null;
      }
    };
    reactContext.addActivityEventListener(mActivityListener);
  }

  @ReactMethod
  public void getCardNonce(String cardNumber, String expiryMonth, String expiryYear, String cvv, String key, Promise promise) {
    WritableMap map = new WritableNativeMap();
    map.putString("token", "");
    map.putBoolean("status", false);
    try {
      BraintreeFragment mBraintreeFragment = BraintreeFragment.newInstance((AppCompatActivity) getCurrentActivity(), key);
      PaymentMethodNonceCreatedListener nonceListener = paymentMethodNonce -> {
        String nonce = paymentMethodNonce.getNonce();
        map.putString("token", nonce);
        map.putBoolean("status", true);
        promise.resolve(map);
      };
      BraintreeErrorListener errorListener = paymentMethodError -> {
        promise.resolve(map);
      };
      mBraintreeFragment.addListener(nonceListener);
      mBraintreeFragment.addListener(errorListener);
      CardBuilder cardBuilder = new CardBuilder()
              .cardNumber(cardNumber)
              .expirationDate(expiryMonth + "/" + expiryYear)
              .cvv(cvv);
      Card.tokenize(mBraintreeFragment, cardBuilder);
    } catch (InvalidArgumentException e) {
      promise.resolve(map);
    }
  }

  @ReactMethod
  public void show(final ReadableMap options, final Promise promise) {
    mPromise = promise;
    isVerifyingThreeDSecure = false;
    Activity currentActivity = getCurrentActivity();
    if (currentActivity == null) {
      promise.reject("NO_ACTIVITY", "There is no current activity");
      return;
    }
    DropInRequest dropInRequest = new DropInRequest()
            .tokenizationKey("sandbox_rz2z5yvd_8fvhdzyrn8t7vcp8");
    currentActivity.startActivityForResult(dropInRequest.getIntent(currentActivity), DROP_IN_REQUEST);
  }

  private void resolvePayment(PaymentMethodNonce paymentMethodNonce, String deviceData) {
    WritableMap jsResult = Arguments.createMap();
    jsResult.putString("nonce", paymentMethodNonce.getNonce());
    jsResult.putString("type", paymentMethodNonce.getTypeLabel());
    jsResult.putString("description", paymentMethodNonce.getDescription());
    jsResult.putBoolean("isDefault", paymentMethodNonce.isDefault());
    jsResult.putString("deviceData", deviceData);
    mPromise.resolve(jsResult);
  }


  @NonNull
  @Override
  public String getName() {
    return "BraintreePaymentModule";
  }

}
