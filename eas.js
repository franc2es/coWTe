import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const EAS_CONTRACT_ADDRESS = process.env.EAS_CONTRACT_ADDRESS;
const EAS_RPC = process.env.EAS_RPC;
const EAS_PRIVATE_KEY = process.env.EAS_PRIVATE_KEY;

// 初始化 Provider 和 Wallet
const provider = new ethers.JsonRpcProvider(EAS_RPC);
const signer = new ethers.Wallet(EAS_PRIVATE_KEY, provider);

// 初始化 EAS 实例
const eas = new EAS(EAS_CONTRACT_ADDRESS);
eas.connect(signer);

// Schema 示例（应提前部署）
const SCHEMA_UID = "0xYourDeployedSchemaUID"; // 需要你在 EAS Scan 上部署 schema 并复制 UID

const schemaEncoder = new SchemaEncoder("string tokenAddress, uint256 tokenId, string orderHash");

export async function easWriteAttestation({ tokenAddress, tokenId, orderHash }) {
  try {
    const encodedData = schemaEncoder.encodeData([
      { name: "tokenAddress", value: tokenAddress, type: "string" },
      { name: "tokenId", value: tokenId.toString(), type: "uint256" },
      { name: "orderHash", value: orderHash, type: "string" },
    ]);

    const tx = await eas.attest({
      schema: SCHEMA_UID,
      data: {
        recipient: signer.address,        // 可以是指定的地址
        expirationTime: 0,                // 永不过期
        revocable: true,                  // 可撤销
        data: encodedData,
      },
    });

    const txHash = await tx.wait();
    console.log("✅ EAS Attestation Success:", txHash.transactionHash);
    return txHash.transactionHash;
  } catch (err) {
    console.error("❌ EAS attestation failed:", err);
    throw err;
  }
}
