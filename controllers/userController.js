const USER = require("../models/user");
const bcrypt = require("bcryptjs")
const generateToken = require("../helpers/generateToken");
const {sendWelcomeEmail} = require("../email/sendEmail");

const handleRegister = async (req, res) => {
  const { fullName, email, phoneNumber, role, password } = req.body;

  try {
    const existingUser = await USER.findOne({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone number already exists",
      });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password,salt);
      const verificationToken = generateToken()
      const verificationTokenExpires = Date.now() + 14 * 60 * 60 * 1000

    const user = await USER.create({
     fullName, email, phoneNumber,role:role|| 'tenant', password:hashedPassword,verificationToken,verificationTokenExpires 
    });

    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    
    return res.status(201).json({success: true, message: "user registered successfully", user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleVerifyEmail = async (req,res) =>{
  const {token} = req.params;
  try{
    const user = await USER.findOne({
      verificationToken:token,
      verificationTokenExpires: {$gt: Date.now()},
    });
    if(!user){
      return res.status(404).json({message: "Invalid or expired verification token", email: user.email})
    }
    user.isVerified= true
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return res.status(200).json({success:true, message:"email verified successfully"})   
  }catch(error){
    console.error(error);
    res.status(500).json({message:error.message})
  }
};

module.exports = { handleRegister, handleVerifyEmail };
