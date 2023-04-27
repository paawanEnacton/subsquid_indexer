import { TypeormDatabase } from "@subsquid/typeorm-store";
import { EvmBatchProcessor } from "@subsquid/evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import assert from "assert";
import { Burn } from "./model";

const processor = new EvmBatchProcessor()
  .setDataSource({
    archive: lookupArchive("eth-mainnet"),
  })
  .addLog([], {
    data: {
      evmLog: {
        topics: true,
        data: true,
        // address: true,
        // index: true,
        // transactionIndex: true,
      },
      // transaction: {
      //   hash: true,
      //   to: true,
      //   index: true,
      // },
    },
  });
// .addTransaction([], {
//   data: {
//     transaction: {
//       id: true,
//       hash: true,
//       blockNumber: true,
//       blockHash: true,
//       from: true,
//       to: true,
//       value: true,
//       gas: true,
//       gasPrice: true,
//       nonce: true,
//       input: true,
//     },
//   },
// });

function formatID(height: any, hash: string) {
  return `${String(height).padStart(10, "0")}-${hash}`;
}

processor.run(new TypeormDatabase(), async (ctx) => {
  for (let c of ctx.blocks) {
    for (let i of c.items) {
      ctx.log.info(i, "Next item:");
    }
  }
  // const burns: Burn[] = []
  // for (let c of ctx.blocks) {
  //   for (let i of c.items) {
  //     assert(i.kind == 'transaction')
  //     // decode and normalize the tx data
  //     burns.push(new Burn({
  //       id: formatID(c.header.height, i.transaction.hash),
  //       block: c.header.height,
  //       address: i.transaction.from,
  //       value: i.transaction.value,
  //       txHash: i.transaction.hash
  //     }))
  //   }
  //  }
  //  // apply vectorized transformations and aggregations
  //  const burned = burns.reduce((acc, b) => acc + b.value, 0n)/1_000_000_000n
  //  const startBlock = ctx.blocks.at(0)?.header.height
  //  const endBlock = ctx.blocks.at(-1)?.header.height
  //  ctx.log.info(`Burned ${burned} Gwei from ${startBlock} to ${endBlock}`)

  //  // upsert batches of entities with batch-optimized ctx.store.save
  //  await ctx.store.save(burns)
});
