import { describe, it, expect } from "bun:test";
import { createWalletTransferTool, generateConfirmationToken } from "../tools/wallet_transfer";
import { createMockConfig, createMockContext } from "./helpers";

describe("wallet_transfer", () => {
  it("rejects when amount exceeds max", async () => {
    const tool = createWalletTransferTool(createMockConfig());
    const context = createMockContext();
    const token = generateConfirmationToken(
      context.config.wallet.confirmationSecret!,
      {
        fromWallet: "from",
        toWallet: "to",
        amountSol: 20
      }
    );
    await expect(
      tool.handler(context, {
        fromWallet: "from",
        toWallet: "to",
        amountSol: 20,
        confirmationToken: token,
        idempotencyKey: "big-transfer-idempotency-key-0001"
      })
    ).rejects.toThrow("exceeds configured max");
  });

  it("enforces idempotency", async () => {
    const config = createMockConfig();
    config.wallet.maxSol = 5;
    const tool = createWalletTransferTool(config);
    const context = createMockContext({ config });
    const payload = {
      fromWallet: "from",
      toWallet: "to",
      amountSol: 1
    };
    const token = generateConfirmationToken(config.wallet.confirmationSecret!, payload);
    const input = {
      ...payload,
      confirmationToken: token,
      idempotencyKey: "transfer-idempotency-key-0001"
    };
    const first = await tool.handler(context, input);
    expect(first.wasDuplicate).toBe(false);
    const second = await tool.handler(context, input);
    expect(second.wasDuplicate).toBe(true);
    expect(second.status).toBe("duplicate");
  });
});
