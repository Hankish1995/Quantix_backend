const OpenAI = require('openai');
const fs = require('fs')
const path = require('path')
// const AWS = require('../utils/awsUpload')



const openai = new OpenAI({
    apiKey: process.env.CHATGPT_KEY,
});



exports.getDimensions = async (req, res) => {
    try {
        let userId = req.result.id
        const file = await openai.files.create({
        file: fs.createReadStream(path.join(__dirname, '../public/csv', 'costing.xlsx')),
        purpose: "assistants",
        });

        const assistant = await openai.beta.assistants.create({
        name: "Quanti",
        description: "Assists with quantity surveying by analyzing drawings, calculating materials and costs in a casual tone.",
        instructions: "Quanti is designed to assist with quantity surveying. It reads and analyzes architectural drawings to calculate the volume and area of various elements. Once these calculations are made, it refers to an uploaded pricing spreadsheet to determine the cost of the project. Quanti provides accurate, clear, and detailed responses based on the data provided. It emphasizes precision and clarity in its calculations and avoids any assumptions without data. Quanti communicates in a casual tone, making it approachable and easy to understand for tradesmen. When a house plan is uploaded, Quanti the total quote based on rates from an uploaded spreadsheet",
        model: "gpt-4o",
        tools: [{ "type": "code_interpreter" }],
        tool_resources: {
        "code_interpreter": {
        "file_ids": [file.id]
        }}});

        
        // var planImage = ''
        // let img = req.files.planImage
        // if (img.mimetype === "image/jpeg" || img.mimetype === "image/png" || img.mimetype === "image/jpg") {
        // const planImagePath = `planImage/${userId}`;
        // const contentType = img.mimetype;
        // const url = await AWS.uploadS3(img, planImagePath, contentType);
        // planImage = url;
        // } else {return res.status(400).json({ message: "This file format is not allowed. You can only add images having extensions :jpeg,png,jpg .",type:'error'})}

        const thread = await openai.beta.threads.create({
        messages: [
        {
        "role": "user",
        "content": [
        {
        "type": "text",
        "text": "use pricing from uploaded spreadsheet file, please analyse the house plan pixel to pixel each dimension should be correct as mentioned in the image.Don't give output like chat just a professional output for which you are trained for."
        },
        {
        "type": "image_url",
        "image_url": { "url": "https://testnewaman.s3.ap-south-1.amazonaws.com/Floor-plan-with-dimensions+(1)+(1).jpg" }
        // "image_url": { "url": planImage }
        }]}]
        });

        const stream = openai.beta.threads.runs
        .stream(thread.id, {
        assistant_id: assistant.id,
        })
        .on("textCreated", () => console.log("assistant >"))
        .on("toolCallCreated", (event) => console.log("assistant " + event.type))
        .on("messageDone", async (event) => {
        if (event.content[0].type === "text") {
        const text = event.content[0].text;
        const annotations = text.annotations || [];
        const citations = [];

        let index = 0;
        for (let annotation of annotations) {
        text.value = text.value.replace(annotation.text, "[" + index + "]");
        const file_citation = annotation.file_citation;
        if (file_citation) {
        const citedFile = await openai.files.retrieve(file_citation.file_id);
        citations.push("[" + index + "]" + citedFile.filename);
        }
        index++;
        }

        res.write(`${text.value}\n`);
        res.write(`${citations.join("\n")}\n`);

        console.log(text.value);
        console.log(citations.join("\n"));

        }});
        stream.on('end', () => {
        res.end();
        });

    }catch (error) {
        if(error.message==="Cannot read properties of undefined (reading 'planImage')"){return res.status(400).json({message:"Please add image.",type:'error'})}
        console.log('ERROR::',error)
        return res.status(500).json({message:"Internal Server Error.",type:"error",error:error.message})
    }
}



