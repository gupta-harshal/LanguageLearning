import express from 'express';

const chatRouter = express.Router();

chatRouter.get("/joinRoom/:id")
chatRouter.get("/joinRoom/random")

export default chatRouter;
