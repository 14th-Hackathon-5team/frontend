const SIGNUP_TOKEN_KEY = 'signupToken'

export function setSignupToken(signupToken) {
  sessionStorage.setItem(SIGNUP_TOKEN_KEY, signupToken)
}

export function getSignupToken() {
  return sessionStorage.getItem(SIGNUP_TOKEN_KEY)
}

export function clearSignupToken() {
  sessionStorage.removeItem(SIGNUP_TOKEN_KEY)
}
