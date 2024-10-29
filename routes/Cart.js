const express =  require("express");
const {fetchCartByUser, addToCart, updateCart, deleteFromCart} =  require("../controller/Cart");

const router=express.Router();

//cart router
router.get('/',fetchCartByUser)
      .post('/',addToCart)
      .patch('/:id',updateCart)
      .delete('/:id',deleteFromCart)

exports.router=router;