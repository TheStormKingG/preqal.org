'use strict';
const ExcelJS = require('exceljs');
const fs = require('fs');
const { applyPreqalHeader, applyDataHeader, applyDataRow } = require('../lib/register-branding.cjs');

(async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  applyPreqalHeader(ws, {
    title: 'TEST REGISTER',
    dcn: 'PQL-REG-99',
    scope: 'TEST SCOPE',
    creationDate: '2026-05-14',
    versionNumber: '1.0',
    bigNumber: 42,
    bigNumberLabel: 'TOTAL ROWS',
    breakdown: [['Type A', 20], ['Type B', 22]],
    status: { created: 42, revised: 0, approved: 0 },
    dataColCount: 6,
  });
  applyDataHeader(ws, ['A','B','C','D','E','F'], [10,20,15,15,15,15]);
  applyDataRow(ws, ['1','2','3','4','5','6'], false);

  await wb.xlsx.writeFile('/tmp/test-register.xlsx');

  const buf = fs.readFileSync('/tmp/test-register.xlsx');
  if (buf.length < 5000) throw new Error('Output too small');
  console.log('PASS basic write — size:', buf.length);
})().catch(e => { console.error('FAIL:', e); process.exit(1); });
