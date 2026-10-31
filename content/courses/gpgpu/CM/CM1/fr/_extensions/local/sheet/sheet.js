const { Workbook } = FortuneSheet;

const data = [
  {
    name: "Feuille 1",
    celldata: [
      { r: 0, c: 0, v: { v: "Valeur" } },
      { r: 0, c: 1, v: { v: "Formule" } },
      { r: 1, c: 0, v: { v: 10 } },
      { r: 2, c: 0, v: { v: 20 } },
      { r: 3, c: 0, v: { v: 30 } },
      { r: 1, c: 1, v: { f: "=SUM(A2:A4)" } }
    ],
    row: 30,
    column: 12
  }
];

ReactDOM.render(
  <Workbook data={data} />,
  document.getElementById("app")
);
