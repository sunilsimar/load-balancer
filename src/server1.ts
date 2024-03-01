import express from 'express';
import { PORT1 } from './constant';

const app = express();

app.use('/*',(req,res)=>{
    res.status(200).send("Response from server1");
})

app.listen(PORT1,()=>{
    console.log(`server 1 started at http://localhost:${PORT1}/` )
})