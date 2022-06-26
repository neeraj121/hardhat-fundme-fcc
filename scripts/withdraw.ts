import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain";

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing.....");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(0);
    console.log("Withdrew");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
