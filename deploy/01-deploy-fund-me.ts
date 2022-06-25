import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployFundMe: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    let ethUsdPriceFeed: string;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeed = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeed = networkConfig[network.name].ethUsdPriceFeed!;
    }

    //when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeed];
    // const fundMe = await deploy("FundMe", {
    //     from: deployer,
    //     args,
    //     log: true,
    //     waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    // });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify("0x373AA9876f8e9e910b0B956eA9Ae408ADBb53e9a", args);
    }
    log("------------------------------------------------------");
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];
