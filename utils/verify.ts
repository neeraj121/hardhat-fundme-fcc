import { run } from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
    console.log("Verifying Contract....");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArgs: args,
        });
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already verified");
        } else {
            console.log(error);
        }
    }
}
