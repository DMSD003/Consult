import app from './src/app';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("The Server is running on port" + PORT);
});