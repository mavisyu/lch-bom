const fs = require("fs");
var moment = require('moment-timezone');

var PdfPrinter = require('pdfmake');

var getFonts = function() {
  var fonts = {
    Roboto: {
      normal: 'node_modules/source-han-sans-sc-ttf/dist/SourceHanSansSC-Regular.ttf',
      bold: 'node_modules/source-han-sans-sc-ttf/dist/SourceHanSansSC-Bold.ttf',
      italics: 'node_modules/source-han-sans-sc-ttf/dist/SourceHanSansSC-Light.ttf',
      bolditalics: 'node_modules/source-han-sans-sc-ttf/dist/SourceHanSansSC-Heavy.ttf'
    }
  };
  return fonts;
}

var getDesignMaterialList = function(reportData) {
  const header = reportData.header;
  const content = reportData.content;
  const datetime = moment().tz("Asia/Taipei").format('YYYY 年 MM 月 DD 日');

  const reportBody = [
    [ { text: '圖         號\n階  件  號', colSpan: 2, alignment: 'center' }, {},
      { text: '工  件  名  稱\n工  件  規  格', alignment: 'center'},
      { text: '來源別\n材    質', alignment: 'cneter' },
      { text: '數量\n重量', alignment: 'center' },
      { text: '整台數\n總重量', alignment: 'center' },
      { text: '供應商\n備料別', alignment: 'center' },
      { text: '訂購日\n領料人', alignment: 'center' },
      { text: '交貨日\n領料日', alignment: 'center' },
      { text: '料    號\n備    註', alignment: 'center' }
    ]
  ];
  content.forEach(function(row) {
    reportBody.push(
      [ { text: `${row[7]}`, colSpan: 2, alignment: 'center' }, {},
        { text: `${row[2]}`, alignment: 'center' },
        { text: `${row[8]}`, alignment: 'center' },
        { text: `${row[5]}`, alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' }
      ]
    );

    reportBody.push(
      [ { text: `${row[0]}`, alignment: 'center' },
        { text: `${row[1]}`, alignment: 'center' },
        { text: `${row[3]}`, alignment: 'center' },
        { text: `${row[4]}`, alignment: 'center' },
        { text: `${row[6]}`, alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' },
        { text: '', alignment: 'center' }
      ]
    );
  });

  var docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 110, 40, 40],
    header: function(currentPage, pageCount, pageSize) {
      return [
        {
          text: '\n連傑油壓工業股份有限公司',
          style: 'header',
          alignment: 'center'
        },
        {
          text: '設 計 材 料 單 清 表',
          style: 'header',
          alignment: 'center'
        },
        {
          style: 'headerInfo',
          table: {
            widths: [ 60, 200, 50, '*' ],
            body: [
              [ { text: '製造編號：', border: [false, false, false, false] },
                { text: `${header[0]}`, border: [false, false, false, true] },
                { text: '頁數：', border: [false, false, false, false] },
                { text: `${currentPage} / ${pageCount}`, border: [false, false, false, true] }
              ]
            ]
          }
        },
        {
          style: 'headerInfo',
          table: {
            widths: [ 60, 200, 50, '*' ],
            body: [
              [ { text: '上層編號：', border: [false, false, false, false] },
                { text: `${header[1]}`, border: [false, false, false, true] },
                { text: '日期：', border: [false, false, false, false] },
                { text: `${datetime}`, border: [false, false, false, true] }
              ]
            ]
          }
        },
        {
          style: 'headerInfo',
          table: {
            widths: [ 60, 100, 50, 50, 70, '*' ],
            body: [
              [ { text: '組件編號：', border: [false, false, false, false] },
                { text: `${header[2]}`, border: [false, false, false, true] },
                { text: '數量：', border: [false, false, false, false], alignment: 'right' },
                { text: `${header[6]}`, border: [false, false, false, true] },
                { text: '組件名稱：', border: [false, false, false, false], alignment: 'right' },
                { text: `${header[5]}`, border: [false, false, false, true] }
              ]
            ]
          }
        }
      ]
    },
    content: [
      {
        style: 'content',
        table: {
          headerRows: 1,
          // widths: [ 2, 75, 110, '*', '*', '*', '*', '*', '*', 50 ],
          widths: [ 2, 75, 110, '*', '*', '*', '*', '*', '*', 55 ],
          body: reportBody
        }
      }
    ],
    footer: {
      columns: [
        { text: '核淮：', width: 50 },
        { text: '', width: 60 },
        { text: '審查：', width: 50 },
        { text: '', width: 80 },
        { text: '製表：', width: 50 },
        { text: `${header[7]}`, width: 80 },
        { text: '表單編號：', width: 60 },
        { text: '', width: '*' },
      ],
      style: 'footer'
    },
    styles: {
      header: {
        margin: [0, 2, 0, 0]
      },
      headerInfo: {
        margin: [50, 2, 40, 0]
      },
      content: {
        margin: [0, 5, 0, 0],
        fontSize: 10
      },
      footer: {
        margin: [40, 5, 40, 0]
      }
    }
  };

  return docDefinition;
}

var printDesignMaterialList = function(reportData) {
  var printer = new PdfPrinter(getFonts());

  var docDefinition = getDesignMaterialList(reportData);

  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream('design_material_list.pdf'));
  pdfDoc.end();
}

var ReportUtil = function() {
  var self = this;

  self.printDesignMaterialList = printDesignMaterialList;

}

module.exports = ReportUtil;