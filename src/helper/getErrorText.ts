
export const getErrorText = (err: any, initialText: string) => {

    const errorOject = Object.getOwnPropertyDescriptors(err);
    console.log("errorOject", errorOject)

    let text = initialText;

    if (err.message.includes("user rejected transaction")) {
        text = "User rejected transaction";
        return text;
    }
    if (err.message.includes("transaction failed")) {
        text = "Transaction failed by gas limit";
        return text;
    }

    // console.log("errorOject.reason.value", errorOject.reason.value)

    // if(errorOject.reason.value){
    //     text = errorOject.reason.value.includes(":") 
    //         ? errorOject.reason.value.split(":")[2] ? errorOject.reason.value.split(":")[2] : errorOject.reason.value.split(":")[1]
    //         : initialText;
    //     return text;
    // }

    return text;

};



// console.log("err----", err )

    // if (err.message.includes("user rejected transaction")) {
    //     text = "user rejected transaction";
    // }
    // if (err.message.includes("transaction failed")) {
    //     text = "transaction failed by gas limit";
    // }

    // const error = errorOject.error.value;
    // console.log("error----", error )


    // if (error.code && error.code === -32603) {
    //     if (error.message.indexOf("ds-math-sub-underflow") >= 0) {
    //         text = "You may be trying more than your balance!";
    //     }

    //     if (error.data && error.data.message) {
    //         text = error.data.message.includes(":") 
    //             ? error.data.message.split(":")[2] ? error.data.message.split(":")[2] : error.data.message.split(":")[1]
    //             : initialText;
    //     }

    //     if (error.data && error.data.message && error.data.message.includes("gas required exceeds allowance")) {
    //         text = "Insufficient balance to make a transaction";
    //     }
    // }