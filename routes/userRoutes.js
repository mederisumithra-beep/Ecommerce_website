const express = require("express")
const router = express.Router()
const {registerUser,loginUser,updateUserRole} = require("../controllers/userControllers")

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put("/:id/role",updateUserRole);

module.exports = router;