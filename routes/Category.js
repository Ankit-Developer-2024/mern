const express =  require("express");
const {fetchCategories, createCategory} =  require("../controller/Category");

const router=express.Router();

//fetchCategories router
router.get('/',fetchCategories)
      .post('/',createCategory)

exports.router=router;