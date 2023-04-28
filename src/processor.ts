import { TypeormDatabase } from "@subsquid/typeorm-store";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import assert from "assert";
import { Transfer } from "./model";
// import { Burn } from "./model";

const processor = new EvmBatchProcessor()
  .setDataSource({
    archive: lookupArchive("eth-mainnet"),
  })
  .addLog([], {
    data: {
      evmLog: {
        topics: true,
        data: true,
      },
      transaction: {
        hash: true,
      },
    } as const,
  });

function formatID(height: any, hash: string) {
  return `${String(height).padStart(10, "0")}-${hash}`;
}

processor.run(new TypeormDatabase(), async (ctx) => {
  let transferData: any = [];

  for (let c of ctx.blocks) {
    for (let item of c.items) {
      // console.log("items :>> ", item);
      if (item.kind === "evmLog") {
        // console.log({
        //   id: item.evmLog.id,
        //   extrinsicHash: item.transaction.hash,
        //   timestamp: new Date(c.header.timestamp),
        //   from: item.address,
        //   to: item.transaction.to,
        //   blockNumber: item.transaction.index,
        // });

        transferData.push(
          new Transfer({
            id: item.evmLog.id,
            extrinsicHash: item.transaction.hash,
            timestamp: new Date(c.header.timestamp),
            from: item.address,
            to: item.transaction.to,
            blockNumber: item.transaction.index,
            amount: null,
          })
        );
      }
    }
  }
  // console.log("transferData :>> ", transferData);
  await ctx.store.save(transferData);
});
