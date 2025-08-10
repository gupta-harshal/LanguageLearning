import * as fs from 'fs';
import { Model, Recognizer } from 'vosk';

const MODEL_PATH = '/path/to/vosk-model-small-ja'; 
const SAMPLE_RATE = 16000;

async function transcribeAudio(filePath: string): Promise<string> {
  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error('Model path does not exist.');
  }

  const model = new Model(MODEL_PATH);
  const rec = new Recognizer(model, SAMPLE_RATE);

  const buffer = fs.readFileSync(filePath);
  rec.acceptWaveform(buffer);
  const result = rec.finalResult();

  rec.free();
  model.free();

  return JSON.parse(result).text;
}
