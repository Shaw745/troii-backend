const USER = require("../models/user");
const bcrypt = require("bcryptjs")

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


    const user = await USER.create({
     fullName, email, phoneNumber,role:role|| 'tenant', password:hashedPassword
    });
    
    return res.status(201).json({success: true, message: "user registered successfully", user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleRegister };
