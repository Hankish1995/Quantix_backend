let mongoose = require('mongoose')
let planModel = require("../models/planModel")



exports.addPlans = async (req, res) => {
    try {
    let userId = req.result.id
    let { planName, planAddress } = req.body
    var planImage = ''

    // if(req.files===null){return res.status(400).json({message:"Please add Image",type:'error'})}

    // let file = req.files.planImage
    // if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    // const planImagePath = `planImage/${userId}`;
    // const contentType = file.mimetype;
    // const url = await AWS.uploadS3(file, planImagePath, contentType);
    // planImage = url;
    // } else {
    // return res.status(400).json({ message: "This file format not allowed. You can only add images having extensions :jpeg,png,jpg ." })
    // }

    let planObj = {
    userId: userId,
    planName: planName,
    planAddress: planAddress,
    imageUrl: planImage
    }
    await planModel.create(planObj)
    return res.status(200).json({ message: "Plan added successfully.", type: "success" })
    }catch(error){
    console.log("ERROR::", error)
    return res.status(500).json({ message: "Internal Server Error", type: "error", error: error.message })
    }
}



exports.deletePlan = async (req, res) => {
    try {
    let planId = req.query.planId;
      
    let isPlanExist = await planModel.findOne({_id:planId})
    if(!isPlanExist){return res.status(400).json({message:"No plan exist with this id",type:"error"})}

    await planModel.findOneAndDelete({_id:planId})

    return res.status(200).json({message: isPlanExist.planName + " plan deleted successfully.",type:'success'})

    }catch (error) {
    console.log('ERROR::', error)
    return res.status(500).json({ message: "Internal server error.", type: 'error', error: error.message })
    }
}




exports.getAllPlans = async (req, res) => {
try{
    const userId = req.result.id
    const {  page = 1, limit = 10, search = '' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) { return res.status(400).json({ message: 'Invalid user ID', type: 'error' })}

    const matchStage = {
    $match: {
    userId:new mongoose.Types.ObjectId(userId),
    planName: { $regex: search, $options: 'i' },
    }};

    const facetStage = {
    $facet: {
    data: [
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit, 10) }
    ],
    totalCount: [
    { $count: 'count' }
    ]}};

    const aggregationPipeline = [matchStage, facetStage];

    const aLLPlans = await planModel.aggregate(aggregationPipeline);

    const plans = aLLPlans[0].data;
    const totalCount = aLLPlans[0].totalCount[0] ? aLLPlans[0].totalCount[0].count : 0;

    res.status(200).json({
      plans,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page, 10),
      type: 'success'
    });
}catch(error){
console.log('ERROR::',error)
return res.status(500).json({message:"Internal Server Error.",type:"error",error:error.message})
}
}


