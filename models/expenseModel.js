const mongoose=require('mongoose')

const expenseSchema=new mongoose.Schema({
    title:{
        type:String
    },
    amount:{
        type:Number,
    }
})
module.exports=mongoose.model('Expense',expenseSchema)