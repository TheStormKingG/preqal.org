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
    breakdown: [['Type A', 20], ['Type B', 22]],
    status: { created: 42, revised: 0, approved: 0 },
    dataColCount: 6,
  });
  applyDataHeader(ws, ['A','B','C','D','E','F'], [10,20,15,15,15,15]);
  applyDataRow(ws, ['1','2','3','4','5','6'], false);

  await wb.xlsx.writeFile('/tmp/test-register.xlsx');

  const buf = fs.readFileSync('/tmp/test-register.xlsx');
  if (buf.length < 5000) throw new Error('FAIL output too small');
  console.log('PASS basic write — size:', buf.length);

  // Re-open and verify structure
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile('/tmp/test-register.xlsx');
  const ws2 = wb2.getWorksheet('Test');

  const assertEq = (actual, expected, label) => {
    if (actual !== expected) {
      throw new Error(`FAIL ${label} — expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
    }
  };

  assertEq(ws2.getCell('C2').value, 'TITLE', 'C2 label');
  assertEq(ws2.getCell('D2').value, 'TEST REGISTER', 'D2 title value');
  assertEq(ws2.getCell('E2').value, 42, 'E2 big number');
  assertEq(ws2.getCell('H2').value, 'CREATED', 'H2 status label');

  if (!ws2.views || !ws2.views[0] || ws2.views[0].ySplit !== 12) {
    throw new Error(`FAIL freeze pane — expected ySplit=12 got ${JSON.stringify(ws2.views && ws2.views[0])}`);
  }

  // Verify merges. ExcelJS exposes merges on ws.model.merges as ["A2:B10", ...]
  const merges = (ws2.model && ws2.model.merges) || [];
  const wantMerges = ['A2:B10', 'E2:E9'];
  for (const want of wantMerges) {
    if (!merges.includes(want)) {
      throw new Error(`FAIL merge missing — expected ${want} in ${JSON.stringify(merges)}`);
    }
  }

  console.log('PASS C2/D2/E2/H2 values, freeze pane row=12, merges A2:B10 and E2:E9 present');
})().catch(e => { console.error(e && e.message ? e.message : e); process.exit(1); });
