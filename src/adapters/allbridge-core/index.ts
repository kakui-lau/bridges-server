import { Chain } from "@defillama/sdk/build/general";
import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";

const lpAddresses = {
  bsc: [
    '0x8033d5b454Ee4758E4bD1D37a49009c1a81D8B10',
    '0xf833afA46fCD100e62365a0fDb0734b7c4537811',
  ],
  ethereum: [
    "0x7DBF07Ad92Ed4e26D5511b4F285508eBF174135D",
    "0xa7062bbA94c91d565Ae33B893Ab5dFAF1Fc57C4d",
  ],
  polygon: [
    '0x58Cc621c62b0aa9bABfae5651202A932279437DA',
    '0x0394c4f17738A10096510832beaB89a9DD090791',
    '0x4C42DfDBb8Ad654b42F66E0bD4dbdC71B52EB0A6',
  ],
  avax: [
    '0xe827352A0552fFC835c181ab5Bf1D7794038eC9f',
    '0x2d2f460d7a1e7a4fcC4Ddab599451480728b5784',
  ],
  arbitrum: [
    '0x690e66fc0F8be8964d40e55EdE6aEBdfcB8A21Df',
    '0x47235cB71107CC66B12aF6f8b8a9260ea38472c7',
  ],
  base: [
    '0xDA6bb1ec3BaBA68B26bEa0508d6f81c9ec5e96d5',
  ],
  optimism: [
    '0x3B96F88b2b9EB87964b852874D41B633e0f1f68F',
    '0xb24A05d54fcAcfe1FC00c59209470d4cafB0deEA',
  ],
} as {
  [chain: string]: string[];
};

const constructParams = (chain: string) => {
  let eventParams = [] as PartialContractEventParams[];
  const lps = lpAddresses[chain];

  for (const lpAddress of Object.values(lps)) {
    const depositParams: PartialContractEventParams = {
      target: lpAddress,
      topic: "SwappedToVUsd(address,address,uint256,uint256,uint256)",
      abi: [
        "event SwappedToVUsd(address sender, address token, uint amount, uint vUsdAmount, uint fee)"
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash"
      },
      argKeys: {
        from: "sender",
        token: "token",
        amount: "amount"
      },
      fixedEventData: {
        to: lpAddress,
      },
      isDeposit: true
    };

    const withdrawParams = {
      target: lpAddress,
      topic: "SwappedFromVUsd(address,address,uint256,uint256,uint256)",
      abi: [
        "event SwappedFromVUsd(address recipient, address token, uint256 vUsdAmount, uint256 amount, uint256 fee)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        amount: "amount",
        token: "token",
        to: "recipient",
      },
      fixedEventData: {
        from: lpAddress,
      },
      isDeposit: false,
    };
    eventParams.push(depositParams, withdrawParams);
  }
  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("allbridge-core", chain as Chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  polygon: constructParams("polygon"),
  avalanche: constructParams("avax"),
  bsc: constructParams("bsc"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  optimism: constructParams("optimism"),
};

export default adapter;
