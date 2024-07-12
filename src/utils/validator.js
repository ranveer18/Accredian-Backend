const validateReferral = (data) => {
  const { name, email, referredName, referredEmail } = data;
  if (!name || !email || !referredName || !referredEmail) {
    return "All fields except message are required";
  }
  return null;
};

module.exports = {
  validateReferral,
};
