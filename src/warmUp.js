// warmUp.js
const net = require("net");

const HOST ="127.0.0.1";
const PORT = 8080;





const server = net.createServer((sock)=>{
	console.log(`got connection from ${sock.remoteAddress}:${sock.remotePort}`);
	sock.on("data",(data)=>{
		console.log(data.toString());
		sock.write("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n<em>Hello</em> <strong>World</strong>");
		sock.end();
		
		




	});
	sock.on("close",(data)=>{
		console.log(`closed - ${sock.remoteAddress}:${sock.remotePort}`);
	});
});

server.listen(PORT,HOST);