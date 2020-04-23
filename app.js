const express = require("express");
const app = express();
const https = require("https");
const mongoose = require('mongoose');
const auth = require(__dirname + "/db.js");

app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://" + auth() + "@cluster0-n1qle.mongodb.net/covidDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const caseSchema = new mongoose.Schema({
  apidata: Object,
  tincrease: Number,
  rincrease: Number,
  dincrease: Number,
  date: Object
});

const Case = mongoose.model('Case', caseSchema);


app.get("/", function(req, res) {

  const url = "https://covid19-mohfw.herokuapp.com/"

  https.get(url, function(response) {
    console.log(response.statusCode);

    response.on("data", function(data) {
      const covidData = JSON.parse(data)

      Case.find({}, function(err, found) {

        if (found.length === 0) {

          const defaultCase = new Case({
            apidata: covidData,
            tincrease: 0,
            rincrease: 0,
            dincrease: 0,
            date: Date()
          });

          defaultCase.save();
          console.log("Default Data added successfully, Redirecting");
          res.redirect("/");

        } else {

          if (found[0].apidata.totals.total !== covidData.totals.total) {
            const tinc = covidData.totals.total - found[0].apidata.totals.total;
            const rinc = covidData.totals.recoveries - found[0].apidata.totals.recoveries;
            const dinc = covidData.totals.deaths - found[0].apidata.totals.deaths;


            Case.deleteMany({}, function() {
              console.log("Last data Deletedfrom DB");
            });

            const addingnew = new Case({
              apidata: covidData,
              tincrease: tinc,
              rincrease: rinc,
              dincrease: dinc,
              date: Date()
            });
            addingnew.save();
            console.log("New Data added to DB");
          }


          res.render("index", {
            covidData: covidData,
            tincr: found[0].tincrease,
            rincr: found[0].rincrease,
            dincr: found[0].dincrease,
            updateDate: found[0].date
          });

        }

      });

    })
  })

});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}
app.listen( port, function() {
  console.log("Server has started Successfully");
})
