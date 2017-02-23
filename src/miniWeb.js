// miniWeb.js
// define your Request, Response and App objects here
// evenWarmer.js
// create Request and Response constructors...

const net = require("net");
const fs = require("fs");

// const HOST ="127.0.0.1";
// const PORT = 8080;




// const routes ={
	//  //Used in Part 1 
	//====================================
	// "/foo.css": {
	// 	"Content-Type":"text/css",
	// 	"body":"h2{color:red;}"
	// },
	// "/":{
	// 	"Content-Type":"text/html",
	// 	"body":"<link rel=\"stylesheet\" type=\"text/css\" href=\"foo.css\"><h2>This is a red header</h2><em>Hello</em><strong>World</strong>"

	// }
	// //Used in Part 2
	//=====================================
// 	"/test":"html/test.html",
// 	"/img/bmo1.gif":"/img/bmo1.gif",
// 	"/foo.css":"css/foo.css",
// 	"/":"html/part1.html"
// };

// const fileSupport={
// 	"jpge":"image/jpge",
// 	"png":"image/png",
// 	"gif":"image/gif",
// 	"html":"text/html",
// 	"css":"text/css",
// 	"txt":"text/plain"

// };





//Request 
class Request{
	constructor(httpRequest){
		const tokens = httpRequest.split("\r\n");
		const path = tokens[0].trim().split(" ")[1];
		const method =tokens[0].trim().split(" ")[0];
		let i=1;
		const headers={};
		while(tokens[i]!==""){
			const temp=tokens[i].trim().split(": ");
			headers[temp[0].trim()] = temp[1].trim();
			i++;

		}
		const body = tokens[i+1].trim();

		this.path = path;
		this.method=method;
		this.headers=headers;
		this.body=body;
	}

	toString(){
		let s="";
		s+=`${this.method} ${this.path} HTTP/1.1\r\n`;
		
		for(const key in this.headers){
			if(this.headers.hasOwnProperty(key)){
				s+=`${key}: ${this.headers[key]}\r\n`;

			}
			
		}
		s+="\r\n";
		s+=this.body;
		return s;
	}

}


//Response
class Response{
	constructor(socket){
		this.sock=socket;
		this.headers = {};
		this.body="";
		this.statusCode=0;
		this.codeMap = {
			200:"OK",
			404:"Not Found",
			201:"Created",
			204: "No Content",
			304:"Not Modified",
			400:"Bad Request",
			401:"Unauthorized",
			403:"Forbidden",
			409:"Conflict",
			500:"Internal Server Error",
			301:"Moved Permanently",
			302:"Found",
			303:"See Other"
		};
		this.fileSupport={
	"jpge":"image/jpge",
	"jpg":"image/jpg",
	"png":"image/png",
	"gif":"image/gif",
	"html":"text/html",
	"css":"text/css",
	"txt":"text/plain"

};


	}
	setHeader(name,value){
		this.headers[name]=value;
	}
	write(data){
		this.sock.write(data);

	}
	end(...s){
		this.sock.end(...s);
	}
	send(statusCode,body){
		this.body=body;
		this.statusCode=statusCode;
		const res = this.toString();
		this.end(res);


	}
	writeHead(statusCode){
		this.statusCode=statusCode;
		let res = `HTTP/1.1 ${this.statusCode} ${this.codeMap[this.statusCode]}\r\n`;
		for(const key in this.headers){
			if(this.headers.hasOwnProperty(key)){
				res+=`${key}: ${this.headers[key]}\r\n`;
			}
		}
		res+="\r\n";
		this.write(res);

	}
	redirect(...args){
		if(args.length>2){
			throw new Error("Incorrect number of arguments!");
		}
		const statusCode = args.length===2 ? args[0] : 301;
		const url = args.length===2 ? args[1] : args[0];
		this.setHeader("Location",url);
		this.statusCode=statusCode;
		this.send(statusCode,this.body);
	}
	toString(){
		let res = `HTTP/1.1 ${this.statusCode} ${this.codeMap[this.statusCode]}\r\n`;
		for(const key in this.headers){
			if(this.headers.hasOwnProperty(key)){
				res+=`${key}: ${this.headers[key]}\r\n`;
			}
		}
		res+="\r\n";
		res+=`${this.body}`;
		return res;

	}
	sendFile(fileName){
		const filePath=__dirname+"/../public/"+fileName;
		const extention = fileName.trim().split(".").slice(-1)[0];
		const fileType = this.fileSupport[extention].split("/")[0];
		const encoding = fileType==="text"? "utf8":null;
		
		fs.readFile(filePath,encoding,(err,data)=>{
			if(err){
				this.setHeader("Content-Type","text/plain");
				this.send(500,"Something is Wrong:(");
				throw err;
			}else{
				this.setHeader("Content-Type",this.fileSupport[extention]);
				this.writeHead(200);
				this.write(data);
				this.end();

			}

		});

		
		
	}
}






	// this.routes ={
	// 		"/test":"html/test.html",
	// 		"/img/bmo1.gif":"/img/bmo1.gif",
	// 		"/foo.css":"css/foo.css",
	// 		"/":"html/part1.html",
	// 		"":"html/part1.html"

	// 	};
class App{
	constructor(){
		this.server = net.createServer(this.handleConnection.bind(this));
		this.routes={};
	
	}
	get(path,cb){
		this.routes[path]=cb;
		this.routes[path+"/"]=cb;

	}
	listen(port,host){
		this.server.listen(port,host);
	}
	handleConnection(sock){
		sock.on("data",this.handleRequestData.bind(this,sock));


	}
	handleRequestData(sock,binayData){
		const request=new Request(binayData.toString());
		const response=new Response(sock);
		const path = request.path;
		if(request.headers["Host"]!=="localhost:8080"){
			response.setHeader("Content-Type","text/plain");
			response.send(400,"You made a bad request");

		}
		else if(this.routes.hasOwnProperty(path)){
			this.routes[path](request,response);

		}else{
			response.setHeader("Content-Type","text/plain");
			response.send(404,"You have set your foot in an uncharted territory!");
		}
		sock.on("close",this.logResponse.bind(this,request,response));


	}
	logResponse(req,res){
		console.log(`${req.method} ${req.path} ${res.statusCode} ${res.codeMap[res.statusCode]}`);


	}

}



// const server = net.createServer((sock)=>{
// 	console.log(`got connection from ${sock.remoteAddress}:${sock.remotePort}`);
// 	sock.on("data",(data)=>{
// 		const request=new Request(data.toString());
// 		const response = new Response(sock);
// 		const path = request.path;
// 		if(routes.hasOwnProperty(path)){
// 			response.sendFile(routes[path]);

// 		}else{
// 			response.setHeader("Content-Type","text/plain");
// 			response.send(404,"uh oh... 404 page not found");

// 		}


		/*
		

		Part 2 code



		*/	

		// if(routes.hasOwnProperty(path)){
		// 	response.setHeader("Content-Type",routes[path]["Content-Type"]);
		// 	response.send(200,routes[path].body);
		// 	console.log(response.toString());

		// }
		// else{
		// 	response.setHeader("Content-Type","text/plain");
		// 	response.send(404,"uh oh... 404 page not found");
		// 	console.log(response.toString());
		// }
		// response.end();

		/*

         Part 1 code

         */



		// if(routes.hasOwnProperty(request.path)){
		// 	sock.write(routes[request.path]);

		// }else{
		// 	sock.write("HTTP/1.1 404 OK\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nuh oh... 404 page not found");
		// }
		// sock.end();
		
		




// 	});
// 	sock.on("close",(data)=>{
// 		console.log(`closed - ${sock.remoteAddress}:${sock.remotePort}`);
// 	});
// });

// server.listen(PORT,HOST);





module.exports={
	Request:Request,
	Response:Response,
	App:App

};
//
