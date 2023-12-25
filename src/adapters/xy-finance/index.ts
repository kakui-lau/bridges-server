import find from 'lodash/find'
import { BridgeAdapter, ContractEventParams, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import {
  Chain,
  YBridgeContractAddress,
  YBridgeVaultsTokenContractAddress
} from './constants'

const getYBridgeSwapRequestedEventParams = (chain: Exclude<Chain, Chain.Numbers>) => {
  const contractAddress = YBridgeContractAddress[chain]
  return {
    target: contractAddress,
    topic: 'SwapRequested(uint256,address,(uint32,address,uint256,uint32),address,address,uint256,address,uint256,uint256,address)',
    abi: [
      "event SwapRequested(uint256 _swapId, address indexed _aggregatorAdaptor, tuple(uint32 dstChainId, address dstChainToken, uint256 expectedDstChainTokenAmount, uint32 slippage) _dstChainDesc, address _srcToken, address indexed _vaultToken, uint256 _vaultTokenAmount, address _receiver, uint256 _srcTokenAmount, uint256 _expressFeeAmount, address indexed _referrer)",
    ],
    logKeys: {
      blockNumber: "blockNumber",
      txHash: "transactionHash",
    },
    argKeys: {
      token: "_vaultToken",
      amount: "_vaultTokenAmount",
      from: "_receiver",
      to: "_referrer",
    },
    argGetters: {
      to: (log: any) => {
        const vaultToken = log?._vaultToken
        const toVaultContract = find(YBridgeVaultsTokenContractAddress[chain], { tokenAddress: vaultToken })?.contractAddress
        return toVaultContract ?? YBridgeContractAddress[chain]
      }
    },
    isDeposit: false,
  }
}

const constructParams = (chain: Chain) => {
  const eventParams: (ContractEventParams | PartialContractEventParams)[] = []
  
  if (chain !== Chain.Numbers) {
    eventParams.push(getYBridgeSwapRequestedEventParams(chain))
  }

  return async (fromBlock: number, toBlock: number) =>
    getTxDataFromEVMEventLogs("xy", chain, fromBlock, toBlock, eventParams);
};

const adapter: BridgeAdapter = {
  ethereum: constructParams(Chain.Ethereum),
  scroll: constructParams(Chain.Scroll),
  mantle: constructParams(Chain.Mantle),
  linea: constructParams(Chain.Linea),
  base: constructParams(Chain.Base),
  arbitrum: constructParams(Chain.Arbitrum),
  'zksync era': constructParams(Chain.ZkSync),
  bsc: constructParams(Chain.Bsc),
  polygon: constructParams(Chain.Polygon),
  klaytn: constructParams(Chain.Klaytn),
  'polygon zkevm': constructParams(Chain.PolygonZkevm),
  avax: constructParams(Chain.Avalanche),
  optimism: constructParams(Chain.Optimism),
  cronos: constructParams(Chain.Cronos),
  fantom: constructParams(Chain.Fantom),
  astar: constructParams(Chain.Astar),
  kcc: constructParams(Chain.Kcc),
  moonriver: constructParams(Chain.Moonriver),
  thundercore: constructParams(Chain.ThunderCore),
  wemix: constructParams(Chain.Wemix),
};

export default adapter;
