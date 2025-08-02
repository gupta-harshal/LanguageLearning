import { Request, Response } from "express";
import axios from "axios";

export default async function grammarEngine(req: Request, res: Response) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const params = new URLSearchParams();
    params.append("text", text);
    params.append("language", "ja"); 

    const result = await axios.post('https://api.languagetool.org/v2/check', params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    res.json(result.data.matches); 
  } catch (error: any) {
    console.error("Error in grammarEngine:", error.message || error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
