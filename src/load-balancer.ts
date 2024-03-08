import express from 'express';
import expressHttpProxy from 'express-http-proxy'
import { PORT, PORT1, PORT2 } from './constant';
import http from 'http'

const app = express();

//list of servers
const allServers = [
    `http://localhost:${PORT1}/`,
    `http://localhost:${PORT2}/`,
]

//healthy Servers
let healthyServers = [...allServers];
let currentServer = 0;

function checkServerHealth(server: string) {
    return new Promise((resolve) => {
      http
        .get(server, (res) => {
          if (res.statusCode === 200) {
            resolve(true)
          } else {
            resolve(false)
          }
        })
        .on('error', () => {
          resolve(false)
        })
    })
  }

//Perform Health checks
async function perfromHealthChecks(){
    const healthStatus = await Promise.all(allServers.map(checkServerHealth));
    healthyServers = allServers.filter((_,index)=> healthStatus[index])
}

//Periodically perfom health checks
setInterval(()=>{
    perfromHealthChecks()
    .then(()=>{
        console.log("Heatlh Check Performed");
    })
    .catch((err)=>{
        console.error("Health check failed",err)
    })
},10000) //every 10 seconds

// Round Robin algorithm for healthy servers
function getNextServer(){
    if(healthyServers.length === 0){
        return null;
    }

    const server = healthyServers[currentServer % healthyServers.length];
    currentServer = (currentServer + 1) % healthyServers.length;
    return server;
}

app.use('/', (req, res, next) => {
    const target = getNextServer();
  
    if (target) {
      // Proxy the request to the selected healthy server
      expressHttpProxy(target)(req, res, next);
    } else {
      // If no healthy servers are available, respond with a 502 Bad Gateway
      res.status(502).send('No healthy backends available to handle the request.');
    }
  });
  
console.log(`load balancer started on port ${PORT}` );

app.listen(PORT)