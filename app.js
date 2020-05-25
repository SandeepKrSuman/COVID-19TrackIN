const express = require("express");
const request = require("request");
const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');



app.get("/", function(req, res) {

  const url1 = "https://api.covid19india.org/data.json"
  const url2 = "https://api.covid19india.org/v2/state_district_wise.json"

  request(url1, function(error, response, body) {
    const data = JSON.parse(body);

    // console.log(response.statusCode);

    request(url2, function(err, resp, bdy) {
      const districtdata = JSON.parse(bdy);

      // console.log(resp.statusCode);

      if (response.statusCode != 200 && resp.statusCode != 200) {
        console.log("API 1 : " + response.statusCode);
        console.log("API 2 : " + resp.statusCode);
        console.log("API did not connect correctly, redirecting!!");
        res.redirect("/");
      }

      res.render("index", {
        covidData: data,
        disCovidData: districtdata
      });
    });

  });

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully");
})
