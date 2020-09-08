import * as core from "./core";
import * as dbSideEffects from "./datastore/sideEffects";

export default function performAppSideEffects({state, swapState, db}) {
    if (core.shouldSubscribeToDataChanges(state)) {
        swapState(core.didSubscribeToDataChanges);
        dbSideEffects.listen(db, "transactions", swapState, core.receiveTransactions);
    }
}