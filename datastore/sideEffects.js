export function read(db, path) {
    db.collection(path).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
        });
    });
}

export function write(db, path, data) {
    db.collection(path).add(data)
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });
}

export function listen(db, path, swapState, swapFn) {
    db.collection(path).onSnapshot(function (querySnapshot) {
        let transactions = [];
        querySnapshot.forEach(function (doc) {
            transactions.push({id: doc.id, data: doc.data()});
        });
        swapState(swapFn, transactions);
        console.log("Change detected, current data:", transactions);
    });
}