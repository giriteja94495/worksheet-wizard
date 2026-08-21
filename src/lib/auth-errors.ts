function errorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
    return err.code
  }
  return ''
}

export function explainAuthError(err: unknown): string {
  switch (errorCode(err)) {
    case 'auth/unauthorized-domain':
      return 'Google sign-in isn’t allowed on this website yet. Firebase still needs giriteja94495.github.io added as an authorised domain. Email and password should still work, or try Google again after that domain is added.'
    case 'auth/operation-not-allowed':
      return 'That sign-in method isn’t enabled on this Firebase project yet. Try email and password, or check Authentication providers.'
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Try again when you’re ready.'
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked. Allow popups for this site, or use email and password.'
    case 'auth/email-already-in-use':
      return 'That email already has an account. Sign in instead, or reset from a different browser session.'
    case 'auth/invalid-email':
      return 'That doesn’t look like a valid email address.'
    case 'auth/weak-password':
      return 'Use at least 6 characters for the password.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password doesn’t match. Try again, or create an account.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is already used with a different sign-in method. Try that method instead.'
    default:
      return 'Couldn’t sign in. Check the details and try again.'
  }
}
