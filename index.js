const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
const port = 3010;

app.use(express.static('static'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to database');
})
.catch((error) => {
  console.error('Error connecting to database:', error);
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});
app.post('/api/users',async(req,res)=>{
  try{
      const {name,email,password}=req.body
      if(!name||!email|| !password)
          return res.status(400).json({message:"all fields are required"})
      const existUser= await User.findOne({email});
      if(existUser)
          return res.status(400).json({message:"email already registered"})
      const user = await User.create({name,email,password})
      return res.status(201).json({message:'User Created successfully',user});
  }
  catch(error){
      if(error.name==='validationError'){
          return res.status(400).json({
              message: 'Validation error',
              errors: error.errors, 
          })
      }
      return res.status(500).json({message:'Server error'})
  }
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});