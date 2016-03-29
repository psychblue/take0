/*
 * Board
 */

var BoardController = function(box, options, data){

  var defaultOptions = {
    cols: {
      num: 2,
      labels: ["label1", "label2"],
      widths: ["50%", "50%"],
      dataKeys: []
    },
    rows: {
      num: 2,
      for: undefined,
      height: "40px",
      headerHeight: "40px"
    },
    layout: {
      width: "100%",
      showTableHeader: true
    },
    onClickRow: undefined
  };

  var boardOptions = options || defaultOptions;

  var boardComponents = {
    $box: $("<div></div>"),
    $table: $("<table></table>"),
    $thead: $("<thead></thead>"),
    $theadTr: $("<tr></tr>"),
    $tbody: $("<tbody></tbody>")
  };

  (function(){
    makeComponent();
    bindEvents();
  }());

  function makeComponent(){

    var colIndex, rowIndex;

    if(boardOptions.layout.showTableHeader){

      for(colIndex = 0; colIndex < boardOptions.cols.num; colIndex++){

        var $thSpan = $("<div></div>")
          .addClass("col-label")
          .css({
            "height": boardOptions.rows.headerHeight,
            "line-height": boardOptions.rows.headerHeight
          })
          .text(boardOptions.cols.labels[colIndex]);

        var $theadTh = $("<th></th>")
          .css({
            "width": boardOptions.cols.widths[colIndex],
            "height": boardOptions.rows.headerHeight
          })
          .append($thSpan);

        boardComponents.$theadTr.append($theadTh);
      }

      boardComponents.$thead.append(boardComponents.$theadTr);
      boardComponents.$table
        .css({
          "width": boardOptions.layout.width
        })
        .append(boardComponents.$thead);
    }

    for(rowIndex = 0; rowIndex < boardOptions.rows.num; rowIndex++){

      var $tbodyTr = $("<tr></tr>");

      if(data){
        $tbodyTr.attr("for", data[rowIndex][boardOptions.rows.for]);
      }

      for(colIndex = 0; colIndex < boardOptions.cols.num; colIndex++){

        var $tbodyTd = $("<td></td>")
          .css({
            "width": boardOptions.cols.widths[colIndex],
            "line-height": boardOptions.rows.height
          });

        if(data){
          var $tdSpan = $("<span></span>").text(data[rowIndex][boardOptions.cols.dataKeys[colIndex]]);
          $tbodyTd.append($tdSpan);
        }

        $tbodyTr.append($tbodyTd);
      }

      boardComponents.$tbody.append($tbodyTr);
    }

    boardComponents.$table.append(boardComponents.$tbody);

    boardComponents.$box
      .addClass("take-board-box")
      .append(boardComponents.$table);

    box.append(boardComponents.$box);
  }

  function bindEvents(){
    boardComponents.$tbody.children("tr").click(boardOptions.onClickRow);
  }

};
