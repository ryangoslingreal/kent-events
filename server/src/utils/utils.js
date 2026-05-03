function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidURL(url) {
    return typeof url === "string" && /^https?:\/\/\S+\.\S+$/.test(url);
}

function isValidID(id) {
    return typeof id === "string" && /^-?\d+$/.test(id);
}

function isValidVerificationCode(code) {
    return typeof code === "string" && /^\d{6}$/.test(code);
}

module.exports = {
    isValidEmail,
    isValidURL,
    isValidID,
    isValidVerificationCode
}