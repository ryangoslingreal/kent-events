const sent = [];

function record({ to, token, verifyUrl}) {
    sent.push({ to, token, verifyUrl, at: Date.now() });
}

function last() {
    return sent[sent.length - 1];
}

function reset() {
    sent.length = 0;
}

module.exports = {
    record,
    last,
    reset
};