/**
 * use Worker threads parse excel data, avoid master thread blocked
 */
const {
  isMainThread, parentPort, workerData,
} = require('node:worker_threads');

// const moment = require('moment');
const fetch = require('node-fetch');
const ExcelJS = require('exceljs');
const _ = require('lodash');

//excel title maps
const excelKeyMapping = {
  'SKU': 'sku',
  'Category': 'category',
  'Product Name': 'productName',
  'Store Code': 'storeCode',
  'Store Name': 'storeName',
  'Combo': 'combo',
  'Sub-SKU': 'subSku',
}


if (!isMainThread) {

  const parseExcel = async () => {
    let result = [];
    let keys = [];
    let error = '';
    try {
      const excelUrl = workerData;
      // console.log('-----worker---excelUrl-', excelUrl);
      const workbooks = new ExcelJS.Workbook();

      //read excel file from remote
      // const excelBody = await fetch(excelUrl);
      // await workbooks.xlsx.load(await excelBody.arrayBuffer());

      //read excel file from local
      await workbooks.xlsx.readFile(excelUrl);

      console.log('--worker--load===ok========= ');
      const worksheet = workbooks.getWorksheet(1);

      //worksheet.rowCount  //all row count

      const mappingKeys = _.keys(excelKeyMapping);


      worksheet.eachRow((row, rowNumber) => {
        let obj = {};
        // cell.type:6-formula;2-number;3-string;0-merge
        row.eachCell((cell, colNumber) => {
          let value = cell.value;

          if (_.isPlainObject(value)) {
            value = _.get(value, 'text', '');
          }

          if (rowNumber === 1) {
            keys.push(value);
          } else {
            const key = keys[colNumber - 1];
            if (_.includes(mappingKeys, key)) {
              obj[key] = value;
              const isMerged = _.get(cell, 'isMerged', false);
              const modelType = _.get(cell, 'model.type', 0); //0-merge cell
              if (key == 'SKU' && isMerged && modelType == 1) {
                obj['isSubItemType'] = true; //sub item
              }
            }
          }
        });
        if (rowNumber > 1) {
          result.push(obj)
        }
      });

    } catch (err) {
      console.log('--worker--err========= ', err);
      error = err.message;
    }

    if (parentPort) {
      parentPort.postMessage({ error, data: result, headers: keys });
    }
    else process.exit(0);

  };
  parseExcel();
}

