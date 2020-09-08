export function createState() {
    return {
        subscribed: false,
        unclassifiedTransactions: [],
        sharedTransactions: [],
        separateTransactions: []
    };
}

export const SHARED = "shared";
export const SEPARATE = "separate";

export function shouldSubscribeToDataChanges(state) {
    return !state.subscribed;
}

export function didSubscribeToDataChanges(state) {
    state.subscribed = true;
    return state;
}

export function getAllTransactionIds(state) {
    return state.unclassifiedTransactions.map(t => t.id).concat(...state.sharedTransactions.map(t => t.id), ...state.separateTransactions.map(t => t.id));
}

export function receiveTransactions(state, data) {
    let ids = getAllTransactionIds(state);
    state.unclassifiedTransactions = state.unclassifiedTransactions.concat(...data.filter(t => ids.indexOf(t.id) === -1));
    return state;
}

export function handleClassification(state, transactionId, classification) {
    let index = state.unclassifiedTransactions.findIndex(t => t.id === transactionId);
    let transaction = state.unclassifiedTransactions[index];

    state.unclassifiedTransactions.splice(index, 1);
    if (classification === SHARED) {
        state.sharedTransactions.push(transaction);
    } else {
        state.separateTransactions.push(transaction);
    }

    return state;
}

export function getSharedTotal(state) {
    return state.sharedTransactions.reduce(function (acc, t) {
        return acc + t.data.amount;
    }, 0);
}

export function getSeparateTotal(state) {
    return state.separateTransactions.reduce(function (acc, t) {
        return acc + t.data.amount;
    }, 0);
}