import { expect } from "chai";
import hre from "hardhat";
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { parseEther, getAddress } from "viem";

describe("ApiMarketEscrow", function () {
  async function deployFixture() {
    const [owner, gateway, buyer, seller, other] =
      await hre.viem.getWalletClients();

    const escrow = await hre.viem.deployContract("ApiMarketEscrow", [
      gateway.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return { escrow, owner, gateway, buyer, seller, other, publicClient };
  }

  describe("Deployment", function () {
    it("should set owner and gateway correctly", async function () {
      const { escrow, owner, gateway } = await loadFixture(deployFixture);
      expect(getAddress(await escrow.read.owner())).to.equal(
        getAddress(owner.account.address)
      );
      expect(getAddress(await escrow.read.gateway())).to.equal(
        getAddress(gateway.account.address)
      );
    });

    it("should start with nextPaymentId = 0", async function () {
      const { escrow } = await loadFixture(deployFixture);
      expect(await escrow.read.nextPaymentId()).to.equal(0n);
    });
  });

  describe("API Approval", function () {
    it("should approve an API", async function () {
      const { escrow } = await loadFixture(deployFixture);
      await escrow.write.approveApi([1n]);
      expect(await escrow.read.approvedApis([1n])).to.be.true;
    });

    it("should emit ApiApproved event", async function () {
      const { escrow, publicClient } = await loadFixture(deployFixture);
      const hash = await escrow.write.approveApi([1n]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      expect(receipt.status).to.equal("success");
    });

    it("should revoke an API", async function () {
      const { escrow } = await loadFixture(deployFixture);
      await escrow.write.approveApi([1n]);
      await escrow.write.revokeApi([1n]);
      expect(await escrow.read.approvedApis([1n])).to.be.false;
    });

    it("should revert if non-owner calls approveApi", async function () {
      const { escrow, other } = await loadFixture(deployFixture);
      const escrowAsOther = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: other } }
      );
      await expect(escrowAsOther.write.approveApi([1n])).to.be.rejectedWith(
        "Only owner"
      );
    });

    it("should revert if non-owner calls revokeApi", async function () {
      const { escrow, other } = await loadFixture(deployFixture);
      const escrowAsOther = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: other } }
      );
      await expect(escrowAsOther.write.revokeApi([1n])).to.be.rejectedWith(
        "Only owner"
      );
    });
  });

  describe("Payment", function () {
    it("should accept payment for approved API", async function () {
      const { escrow, buyer, seller } = await loadFixture(deployFixture);
      await escrow.write.approveApi([1n]);

      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );

      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const payment = await escrow.read.getPayment([0n]);
      expect(getAddress(payment.buyer)).to.equal(
        getAddress(buyer.account.address)
      );
      expect(payment.apiId).to.equal(1n);
      expect(getAddress(payment.seller)).to.equal(
        getAddress(seller.account.address)
      );
      expect(payment.amount).to.equal(parseEther("1"));
      expect(payment.completed).to.be.false;
      expect(payment.refunded).to.be.false;
    });

    it("should increment nextPaymentId", async function () {
      const { escrow, buyer, seller } = await loadFixture(deployFixture);
      await escrow.write.approveApi([1n]);

      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );

      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      expect(await escrow.read.nextPaymentId()).to.equal(1n);
    });

    it("should revert for unapproved API", async function () {
      const { escrow, buyer, seller } = await loadFixture(deployFixture);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );

      await expect(
        escrowAsBuyer.write.pay([99n, seller.account.address], {
          value: parseEther("1"),
        })
      ).to.be.rejectedWith("API not approved");
    });

    it("should revert with zero value", async function () {
      const { escrow, buyer, seller } = await loadFixture(deployFixture);
      await escrow.write.approveApi([1n]);

      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );

      await expect(
        escrowAsBuyer.write.pay([1n, seller.account.address], { value: 0n })
      ).to.be.rejectedWith("Payment must be > 0");
    });
  });

  describe("Complete", function () {
    it("should accumulate funds in pendingWithdrawals on complete", async function () {
      const { escrow, buyer, seller, gateway } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);

      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );

      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );

      await escrowAsGateway.write.complete([0n]);

      const pending = await escrow.read.pendingWithdrawals([seller.account.address]);
      expect(pending).to.equal(parseEther("1"));

      const payment = await escrow.read.getPayment([0n]);
      expect(payment.completed).to.be.true;
    });

    it("should allow seller to claim accumulated funds", async function () {
      const { escrow, buyer, seller, gateway, publicClient } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);

      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.complete([0n]);

      const sellerBalBefore = await publicClient.getBalance({
        address: seller.account.address,
      });

      const escrowAsSeller = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: seller } }
      );
      await escrowAsSeller.write.claim();

      const sellerBalAfter = await publicClient.getBalance({
        address: seller.account.address,
      });

      expect(sellerBalAfter > sellerBalBefore).to.be.true;
      expect(await escrow.read.pendingWithdrawals([seller.account.address])).to.equal(0n);
    });

    it("should revert claim if nothing to withdraw", async function () {
      const { escrow, seller } = await loadFixture(deployFixture);
      const escrowAsSeller = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: seller } }
      );
      await expect(escrowAsSeller.write.claim()).to.be.rejectedWith(
        "Nothing to claim"
      );
    });

    it("should revert if not gateway", async function () {
      const { escrow, buyer, seller, other } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsOther = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: other } }
      );
      await expect(escrowAsOther.write.complete([0n])).to.be.rejectedWith(
        "Only gateway"
      );
    });

    it("should revert if already completed", async function () {
      const { escrow, buyer, seller, gateway } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.complete([0n]);

      await expect(escrowAsGateway.write.complete([0n])).to.be.rejectedWith(
        "Already completed"
      );
    });
  });

  describe("Refund", function () {
    it("should refund funds to buyer", async function () {
      const { escrow, buyer, seller, gateway, publicClient } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const buyerBalBefore = await publicClient.getBalance({
        address: buyer.account.address,
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.refund([0n]);

      const buyerBalAfter = await publicClient.getBalance({
        address: buyer.account.address,
      });

      expect(buyerBalAfter - buyerBalBefore).to.equal(parseEther("1"));

      const payment = await escrow.read.getPayment([0n]);
      expect(payment.refunded).to.be.true;
    });

    it("should revert if not gateway", async function () {
      const { escrow, buyer, seller, other } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsOther = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: other } }
      );
      await expect(escrowAsOther.write.refund([0n])).to.be.rejectedWith(
        "Only gateway"
      );
    });

    it("should revert if already refunded", async function () {
      const { escrow, buyer, seller, gateway } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.refund([0n]);

      await expect(escrowAsGateway.write.refund([0n])).to.be.rejectedWith(
        "Already refunded"
      );
    });

    it("should not allow complete after refund", async function () {
      const { escrow, buyer, seller, gateway } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.refund([0n]);

      await expect(escrowAsGateway.write.complete([0n])).to.be.rejectedWith(
        "Already refunded"
      );
    });

    it("should not allow refund after complete", async function () {
      const { escrow, buyer, seller, gateway } =
        await loadFixture(deployFixture);

      await escrow.write.approveApi([1n]);
      const escrowAsBuyer = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: buyer } }
      );
      await escrowAsBuyer.write.pay([1n, seller.account.address], {
        value: parseEther("1"),
      });

      const escrowAsGateway = await hre.viem.getContractAt(
        "ApiMarketEscrow",
        escrow.address,
        { client: { wallet: gateway } }
      );
      await escrowAsGateway.write.complete([0n]);

      await expect(escrowAsGateway.write.refund([0n])).to.be.rejectedWith(
        "Already completed"
      );
    });
  });

  describe("Admin functions", function () {
    it("should allow owner to change gateway", async function () {
      const { escrow, other } = await loadFixture(deployFixture);
      await escrow.write.setGateway([other.account.address]);
      expect(getAddress(await escrow.read.gateway())).to.equal(
        getAddress(other.account.address)
      );
    });

    it("should allow owner to transfer ownership", async function () {
      const { escrow, other } = await loadFixture(deployFixture);
      await escrow.write.transferOwnership([other.account.address]);
      expect(getAddress(await escrow.read.owner())).to.equal(
        getAddress(other.account.address)
      );
    });
  });
});
