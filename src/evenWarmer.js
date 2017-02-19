// evenWarmer.js
// create Request and Response constructors...
const HOST ="127.0.0.1";
const PORT = 8080;
const net = require("net");
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
		}

	}
	setHeader(name,value){
		this.headers[name]=value;
	}
	write(data){
		this.sock.write(data);

	}
	end(s){
		this.sock.end(s);
	}
	send(statusCode,body){
		this.body=body;
		this.statusCode=statusCode;
		let res = this.toString();
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
		const statusCode = args.length==2 ? args[0] : 301;
		const url =  args.length==2 ? args[1] : args[0];
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

}


const routes ={
	"/": "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n<link rel=\"stylesheet\" type=\"text/css\" href=\"foo.css\"><h2>This is a red header</h2><em>Hello</em><strong>World</strong>",
	"/foo.css": "HTTP/1.1 200 OK\r\nContent-Type: text/css; charset=UTF-8\r\n\r\nh2{color:red}"
}

const server = net.createServer((sock)=>{
	console.log(`got connection from ${sock.remoteAddress}:${sock.remotePort}`);
	sock.on("data",(data)=>{
		console.log(data.toString());
		const request=new Request(data.toString());
		if(routes.hasOwnProperty(request.path)){
			sock.write(routes[request.path]);

		}else{
			sock.write("HTTP/1.1 404 OK\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nuh oh... 404 page not found");
		}
		sock.end();
		
		




	});
	sock.on("close",(data)=>{
		console.log(`closed - ${sock.remoteAddress}:${sock.remotePort}`);
	});
});

server.listen(PORT,HOST);




module.exports={
	Request:Request,
	Response:Response

};
//
