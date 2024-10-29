const express =  require("express");
const {fetchUserById,updateUser} =  require("../controller/User");

const router=express.Router();

//user router
router.get('/own',fetchUserById)
      .patch('/:id',updateUser)

exports.router=router;