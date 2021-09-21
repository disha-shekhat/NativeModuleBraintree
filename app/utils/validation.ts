export const validation = {
  // TextInput Empty
  textInputCheck(txtInput: any) {
    if (txtInput !== undefined) {
      if (
        txtInput !== null &&
        txtInput.trim().length > 0 &&
        txtInput !== undefined
      ) {
        return true;
      }
      return false;
    }
    return false;
  },

  // Email Validation
  isValidEmail(email: any) {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regex.test(email)) {
      return false;
    }
    return true;
  },
  onlyAlphabets(value: string) {
    let reg = /^[^-\s][a-zA-Z]+[a-zA-Z ]*[^-\s]$/; ///^[a-zA-Z]+$/
    if (!/[^\sa-zA-Z]/.test(value)) {
      return true;
    } else {
      return false;
    }
  },
};
