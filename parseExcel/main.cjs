const { Worker } = require('node:worker_threads');
const path = require('path');

/**
   * parse excel using worker thread
   * @param p 
   * @param rpcTransactionId 
   * @param queryRunner 
   * @returns 
   */
const parseExcelWorker = async (p) => {
  console.log('--parseWorker--start----');
  const { excelUrl } = p;
  try {
    const result = await new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, './parse.cjs'), { workerData: excelUrl });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
    console.log('--parseWorker--end----');
    return result;
  } catch (err) {
    console.log('--parseWorker--err----', err);
    throw new Error('Parse Excel Worker error, Please try again! ');
  }

}

const main = async () => {
  //get excel results
  const results = await parseExcelWorker({ excelUrl: path.join(__dirname, './product-test.xlsx') });
  console.log('results======', results);
}

main().catch(err => console.error(err));

