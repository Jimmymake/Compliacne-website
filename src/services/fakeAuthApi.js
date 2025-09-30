export const fakeAuthApi = {
  signup: (data) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.email === "exists@example.com")
          reject({ message: "Email already exists" })
        else resolve({ message: "Signed up" })
      }, 900)
    }),

  login: (data) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.email === "user@example.com" && data.password === "password")
          resolve({ token: "fake-jwt-token", user: { email: data.email } })
        else reject({ message: "Invalid credentials" })
      }, 900)
    }),

  forgot: (email) =>
    new Promise((resolve) => {
      setTimeout(
        () => resolve({ message: "If the email exists, a reset link was sent." }),
        900
      )
    }),
}
