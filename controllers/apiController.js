const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const moment = require('moment');
const config = require('../config');

const con = mysql.createConnection(config.db);

module.exports = function(app) {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    /* get */
        /* get */
            /* get */
    app.get('/api/list/category', function (req, res) {
      let sql = `
        SELECT *
        FROM category
        ORDER BY name
      `;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });

    });
    //
    app.get('/api/list/purchaseloc', function (req, res) {
      let sql = `
        SELECT *
        FROM purchaseloc
        ORDER BY name
      `;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });

    });
    //
    app.get('/api/list/sellingplat', function (req, res) {
      let sql = `
        SELECT *
        FROM sellingplatform
        ORDER BY name
      `;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });

    });
    //
    app.get('/api/sale/sales', function (req, res) {
      let sql = `
        SELECT *
        FROM vw_salesreport
        ORDER by saledate DESC
      `;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
    });
    //
    app.get('/api/sale/salesreport', function (req, res) {
      let queryID = req.query.ID;
      let sql = `
        SELECT *
        FROM vw_salesreport
        WHERE ID = ?
      `;
      con.query(sql, queryID, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
    });
    //
    app.get('/api/metric/taxreport', function (req, res) {
      let dateMonth = req.query.dateMonth;
      let dateYear = req.query.dateYear;
      //get month values
      let sql = `
        SELECT
          SUM(saleprice - purchaseprice - purchasetax - shippingprice - platformfee) as taxable,
          ((SUM(saleprice - purchaseprice - purchasetax - shippingprice - platformfee)) * .2) as tax
        FROM soupysells.vw_salesreport
        WHERE
          MONTH(saledate) = ?
          AND
          YEAR(saledate) = ?
      `;
      con.query(sql, [dateMonth, dateYear], function (err, result, fields) {
        if (err) throw err;
        let tax = result[0].tax;
        let taxable = result[0].taxable;
        sql = `
          SELECT ((SUM(saleprice - purchaseprice - purchasetax - shippingprice - platformfee)) * .2) as ytd
          FROM soupysells.vw_salesreport
          WHERE
          	YEAR(saledate) = ?
        `
        con.query(sql, dateYear, function (err, result, fields) {
          if (err) throw err;
          let ytd = result[0].ytd;
          res.send(JSON.stringify(
            {
              tax: tax,
              taxable: taxable,
              ytd: ytd
            }
          ));
        });
      });
    });
    //
    app.get('/api/metric/salesreport', function (req, res) {
      let dateFilter = req.query.dateFilter;
      let dataArr;
      switch (dateFilter) {
        case "Weekly":
          dataArr = [moment().subtract(7, "days").format(), moment().format()];
          break;
        case "Monthly":
          dataArr = [moment().subtract(1, "months").format(), moment().format()];
          break;
        case "Annual":
          dataArr = [moment().subtract(1, "years").format(), moment().format()];
      }
      let sql = `
        SELECT
          IFNULL(SUM((saleprice - purchaseprice - purchasetax
            - shippingprice - platformfee)),0) as profit,
          COUNT(*) as sold
        FROM soupysells.vw_salesreport
        WHERE (saledate BETWEEN ? AND ?)
      `;
      con.query(sql, dataArr, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
    });
    //
    app.get('/api/metric/itemsreport', function (req, res) {
      let dateFilter = req.query.dateFilter;
      let dataArr;
      switch (dateFilter) {
        case "Weekly":
          dataArr = [moment().subtract(7, "days").format(), moment().format()];
          break;
        case "Monthly":
          dataArr = [moment().subtract(1, "months").format(), moment().format()];
          break;
        case "Annual":
          dataArr = [moment().subtract(1, "years").format(), moment().format()];
      }
      let sql = `
        SELECT
          IFNULL(SUM((purchaseprice + purchasetax)),0) as cost,
          COUNT(*) as purchased
        FROM soupysells.vw_items
        WHERE (purchasedate BETWEEN ? AND ?)
      `;
      con.query(sql, dataArr, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
    });
    //
    app.get('/api/item/items', function (req, res) {
      let sql = `
        SELECT *
        FROM vw_items
        WHERE isactive = 1
        ORDER BY purchasedate DESC
      `;
      con.query(sql, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
    });
    //
    app.get('/api/item/archiveitem', function (req, res) {
      let queryID = req.query.ID;
      let sql = `
        UPDATE items
        SET isactive = 0
        WHERE ID = ?
      `;
      con.query(sql, queryID, function (err, result, fields) {
        if (err) throw err;
        res.send("")
      });
    });
    //
    app.get('/', function (req, res) {
        res.sendFile('/public/index.html', { 'root': './' });
    });


    /* post */
        /* post */
            /* post */
    app.post('/api/item/newitem', function (req, res) {
      if (req.body) {
        let updateObj = {
          name: req.body.name,
          description: req.body.description,
          fk_categoryID: req.body.category,
          fk_purchaselocID: req.body.purchaseloc,
          purchaseprice: parseFloat(req.body.purchaseprice),
          purchasetax: parseFloat(req.body.purchasetax),
          physloc: req.body.physloc,
          purchasedate: moment(req.body.purchasedate).toDate()
        }
        let sql = 'INSERT INTO items SET ?';
        con.query(sql, updateObj, function (err, result, fields) {
          if (err) throw err;
          res.send("");
        });

      }
    })
    app.post('/api/sale/newsale', function (req, res) {
      if (req.body) {
        let updateObj = {
          saleprice: parseFloat(req.body.saleprice),
          platformfee: parseFloat(req.body.platformfee),
          shippingprice: parseFloat(req.body.shippingprice),
          saledate: moment(req.body.saledate).toDate(),
          fk_itemsID: req.body.itemID,
          fk_platformID: req.body.platformID
        }
        let itemID = req.body.itemID;
        let sql = 'INSERT INTO sales SET ?';
        con.query(sql, updateObj, function (err, result, fields) {
          if (err) throw err;
          let insertID = result.insertId;
          con.query('UPDATE items SET isactive = 0 WHERE ID = ?', itemID,
            function (err, result, fields) {
              if (err) throw err;
              res.send(JSON.stringify({ ID: insertID }));
          });
        });
      }
    })
    app.post('/api/item/updateitem', function (req, res) {
      if (req.body) {
        let itemID = req.body.ID;
        let updateObj = {
          name: req.body.name,
          description: req.body.description,
          fk_categoryID: req.body.fk_categoryID,
          fk_purchaselocID: req.body.fk_purchaselocID,
          purchaseprice: parseFloat(req.body.purchaseprice),
          purchasetax: parseFloat(req.body.purchasetax),
          physloc: req.body.physloc,
          purchasedate: moment(req.body.purchasedate).toDate()
        }
        let sql = 'UPDATE items SET ? WHERE ID = ?';
        con.query(sql, [updateObj, itemID], function (err, result, fields) {
          if (err) throw err;
          res.send("");
        });

      }
    })
    app.post('/api/lists/addcat', function (req, res) {
      if (req.body) {
        let updateObj = {
          name: req.body.name
        }
        let sql = 'INSERT INTO category SET ?';
        let insertID;
        con.query(sql, updateObj, function (err, result, fields) {
          if (err) throw err;
          let insertID = result.insertId
          res.send(JSON.stringify({ ID: insertID }));
        });
      }
    })
    app.post('/api/lists/addpurchloc', function (req, res) {
      if (req.body) {
        let updateObj = {
          name: req.body.name
        }
        let sql = 'INSERT INTO purchaseloc SET ?';
        let insertID;
        con.query(sql, updateObj, function (err, result, fields) {
          if (err) throw err;
          let insertID = result.insertId
          res.send(JSON.stringify({ ID: insertID }));
        });
      }
    })
    app.post('/api/lists/addsellingplat', function (req, res) {
      if (req.body) {
        let updateObj = {
          name: req.body.name
        }
        let sql = 'INSERT INTO sellingplatform SET ?';
        let insertID;
        con.query(sql, updateObj, function (err, result, fields) {
          if (err) throw err;
          let insertID = result.insertId
          res.send(JSON.stringify({ ID: insertID }));
        });
      }
    })
}
