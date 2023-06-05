function generateCode() {
  let code = "";
  for (let i = 0; i < 4; i++) {
    const randomNumber = Math.floor(Math.random() * 10); // Generates a random number between 0 and 9
    code += randomNumber.toString();
  }
  return code;
}

exports.generateCode = generateCode;
