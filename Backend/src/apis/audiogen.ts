import fs from 'fs';
import OpenAI from 'openai';
import axios from 'axios';

const api_key=process.env.OPEN_API_KEY;
export default function generateText(req:Request,res:Response){
  const { prompt } = req.body;
  try{
    const data=axios.post()

  }

}