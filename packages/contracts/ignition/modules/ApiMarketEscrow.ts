import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ApiMarketEscrowModule = buildModule("ApiMarketEscrowModule", (m) => {
  const gateway = m.getParameter("gateway");
  const feeRate = m.getParameter("feeRate", 500n); // 기본 5%
  const escrow = m.contract("ApiMarketEscrow", [gateway, feeRate]);
  return { escrow };
});

export default ApiMarketEscrowModule;
