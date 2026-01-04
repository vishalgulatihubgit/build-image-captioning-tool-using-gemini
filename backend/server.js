const express = require("express")
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv  = require("dotenv");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const multer = require("multer");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());


//Configure Gemini API

const googleGenAI = new GoogleGenerativeAI(process.env.API_KEY);

console.log(process.env.API_KEY);
const geminiProVisionModel = googleGenAI.getGenerativeModel({
    model: "gemini-2.5-flash"
})

//Configure uploads multer
const storage = multer.diskStorage({
    destination: (req, file, cb)  => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage : storage
})


app.get("/", (req, res) => {
    res.send("Welcome to our AI Caption Generation API")

})


app.post("/generate-caption", upload.single("file"), async (req,res) =>  {
    const filePath = req.file.path;
    const mimeType = mime.lookup(filePath);

    const imagePath = {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };

    const images = [imagePath];

    const prompt = "Write an appropriate caption for this image to help visually-impaired users";

    const request = await geminiProVisionModel.generateContent([prompt, ...images]);

    const response = await request.response;
    caption = response.text();
    res.send(caption);
})


const PORT = process.env.PORT || 1330;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);

})
