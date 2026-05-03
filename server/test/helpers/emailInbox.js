const sent = [];

function record({ to, code }) {
    sent.push({ to, code, at: Date.now() });
}

function last() {
    return sent[sent.length - 1];
}

function all() {
    return sent;
}

function reset() {
    sent.length = 0;
}

module.exports = {
    record,
    last,
    all,
    reset
};