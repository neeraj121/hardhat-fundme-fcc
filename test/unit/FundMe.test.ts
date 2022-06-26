import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain";

describe("FundMe", async function () {
    let fundMe: FundMe;
    let mockV3Aggregator: MockV3Aggregator;
    let deployer: string;
    const sendValue = ethers.utils.parseEther("1"); //1 ETH
    beforeEach(async function () {
        //deploy our fundMe contract
        //using Hardhat deploy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    describe("Constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed();
            expect(response).to.equal(mockV3Aggregator.address);
        });
    });

    describe("fund", async function () {
        it("Fails if you dont send enough eth", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            );
        });

        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getAddressToAmountFunded(deployer);
            expect(response).to.equal(sendValue);
        });

        it("adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.getFunder(0);
            expect(response).to.equal(deployer);
        });
    });

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single founder", async function () {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalancer = await fundMe.provider.getBalance(
                deployer
            );
            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            //Assert
            expect(endingFundMeBalance).to.equal(0);
            expect(endingDeployerBalance).to.equal(
                startingDeployerBalancer.add(startingFundMeBalance).sub(gasCost)
            );
        });

        it("allows us to withdraw with multiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6 && i < accounts.length; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalancer = await fundMe.provider.getBalance(
                deployer
            );

            //Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            //Assert
            expect(endingFundMeBalance).to.equal(0);
            expect(endingDeployerBalance).to.equal(
                startingDeployerBalancer.add(startingFundMeBalance).sub(gasCost)
            );

            //Make sure that funders are reset properly
            for (let i = 1; i < 6 && i < accounts.length; i++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                ).to.equal(0);
            }
            await expect(fundMe.getFunder(0)).to.be.reverted;
        });

        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner");
        });

        it("cheaper withdraw ETH from a single founder", async function () {
            //Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalancer = await fundMe.provider.getBalance(
                deployer
            );
            //Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            //Assert
            expect(endingFundMeBalance).to.equal(0);
            expect(endingDeployerBalance).to.equal(
                startingDeployerBalancer.add(startingFundMeBalance).sub(gasCost)
            );
        });

        it("cheaperwithdraw allows us to withdraw with multiple funders", async function () {
            //Arrange
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6 && i < accounts.length; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalancer = await fundMe.provider.getBalance(
                deployer
            );

            //Act
            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            //Assert
            expect(endingFundMeBalance).to.equal(0);
            expect(endingDeployerBalance).to.equal(
                startingDeployerBalancer.add(startingFundMeBalance).sub(gasCost)
            );

            //Make sure that funders are reset properly
            for (let i = 1; i < 6 && i < accounts.length; i++) {
                expect(
                    await fundMe.getAddressToAmountFunded(accounts[i].address)
                ).to.equal(0);
            }
            await expect(fundMe.getFunder(0)).to.be.reverted;
        });
    });
});
