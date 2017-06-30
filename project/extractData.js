const xlsx = require('xlsx');
const fs = require('fs');

function getNum(str) {
    if (typeof str !== 'string') {
        if (typeof str === 'number')
            return str;
        return 0;
    }

    return +str.replace(/\D+/g, '');
}

function writeData(fileName, data) {
    fs.writeFileSync(fileName, JSON.stringify(data));
}

function extractApp1Data() {
    const rawDataFilename = 'rawData/01_ISTAT, Forze di lavoro per anno, 1959-2015.xls'
    const workbook = xlsx.readFile(rawDataFilename);
    const sheetName = workbook.SheetNames[0];
    const ws = workbook.Sheets[sheetName];
    const fullSheetData = xlsx.utils.sheet_to_json(ws, { header: 1 });
    const marketJobData = fullSheetData.slice(8, 65).map(r => ({
        year: getNum(r[0]),
        maleOccupied: getNum(r[1]),
        maleNotOccupied: getNum(r[2]),
        maleNotWorkforce: getNum(r[4]),
        femaleOccupied: getNum(r[6]),
        femaleNotOccupied: getNum(r[7]),
        femaleNotWorkforce: getNum(r[9])
    }));
    writeData('data/app1.json', marketJobData);
}


function extractApp2Data() {
    const regions = [
        {
            cod: 1,
            name: "PIEMONTE"
        },
        {
            cod: 2,
            name: "VALLE D'AOSTA"
        },
        {
            cod: 3,
            name: "LOMBARDIA"
        },
        {
            index: 4,
            cod: 4,
            name: "TRENTINO ALTO-ADIGE"
        },
        {
            cod: 5,
            name: "VENETO"
        },
        {
            cod: 6,
            name: "FRIULI-VENEZIA-GIULIA"
        },
        {
            cod: 7,
            name: "LIGURIA"
        },
        {
            cod: 8,
            name: "EMILIA-ROMAGNA"
        },
        {
            cod: 9,
            name: "TOSCANA"
        },
        {
            cod: 10,
            name: "UMBRIA"
        },
        {
            cod: 11,
            name: "MARCHE"
        },
        {
            cod: 12,
            name: "LAZIO"
        },
        {
            cod: 13,
            name: "ABRUZZO"
        },
        {
            cod: 14,
            name: "MOLISE"
        },
        {
            cod: 15,
            name: "CAMPANIA"
        },
        {
            cod: 16,
            name: "PUGLIA"
        },
        {
            cod: 17,
            name: "BASILICATA"
        },
        {
            cod: 18,
            name: "CALABRIA"
        },
        {
            cod: 19,
            name: "SICILIA"
        },
        {
            cod: 20,
            name: "SARDEGNA"
        },
        {
            cod: 21,
            name: "ITALIA"
        }
    ];

    const rawDataFilename = 'rawData/03_MINLAV, Avviamenti e cessazioni, Italia, 2013-2016 (elaborazioni).xlsx'
    const workbook = xlsx.readFile(rawDataFilename);

    const startsXls = workbook.Sheets[workbook.SheetNames[0]];
    const startsRaw = xlsx.utils.sheet_to_json(startsXls, { header: 1 });
    const startsRawWithTrentino = startsRaw.map(
        row => row.slice(0, 5)
            .concat([getNum(row[5]) + getNum(row[6])])
            .concat(row.slice(7))
    );
    const starts = startsRawWithTrentino.slice(43, 47).map(
        row => ({
            year: getNum(row[0].replace('-TOT', '')),
            data: row.slice(2, 21)
                .concat([row[23]])
                .map(n => getNum(n))
        })
    );

    const voucherXls = workbook.Sheets[workbook.SheetNames[3]]
    const voucherRaw = xlsx.utils.sheet_to_json(voucherXls, { header: 1 });


    const voucher = [
        {
            year: 2013,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[1]))
        },
        {
            year: 2014,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[4]))

        },
        {
            year: 2015,
            data: voucherRaw.slice(2, 23).map(v => getNum(v[7]))

        },
    ];

    writeData('data/app2.json', {
        regions,
        starts,
        voucher
    });
}

extractApp1Data();
extractApp2Data();