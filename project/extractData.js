const xlsx = require('xlsx');
const fs = require('fs');

const rawDataFilename = 'rawData/01_ISTAT, Forze di lavoro per anno, 1959-2015.xls'
const workbook = xlsx.readFile(rawDataFilename);
const sheetName = workbook.SheetNames[0];
const ws = workbook.Sheets[sheetName];
const fullSheetData = xlsx.utils.sheet_to_json(ws, { header: 1 });
const marketJobData = fullSheetData.slice(8, 65).map(r => r.filter(v => v !== null));
const dataFilename = 'data/app1.json';
fs.writeFileSync(dataFilename, JSON.stringify(marketJobData));