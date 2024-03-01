import express from 'express';
import { PORT2 } from './constant';

const app = express();

app.get('/*',(req,res)=>{
    res.status(200).send("Response from server2");
})

app.listen(PORT2,()=>{
    console.log(`Server started at http://localhost:${PORT2}/`)
})