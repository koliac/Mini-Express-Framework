// fansite.js
// create your own fansite using your miniWeb framework
const App = require("./miniWeb.js").App;
const app = new App();

app.get("/",(req,res)=>{
   res.sendFile("html/fansite.html");
});
app.get("/about",(req,res)=>{
   res.sendFile("html/about.html");
});
app.get("/rando",(req,res)=>{
   res.sendFile("html/rando.html");
});
app.get("/img",(req,res)=>{
	const paths = ["img/image1.png","img/image2.jpg","img/image3.gif","img/bmo1.gif"];
   const path = paths[Math.floor(Math.random()*paths.length)];
   res.sendFile(path);

});
app.get("/home",(req,res)=>{
	res.redirect("http://localhost:8080/");
});
app.get("/main.css",(req,res)=>{
	res.sendFile("css/main.css");
});


app.listen(8080,'127.0.0.1');