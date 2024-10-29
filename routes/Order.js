const express =  require("express");
const { createOrder, fetchOrderByUser, deleteOrder, updateOrder, fetchAllOrder } =  require("../controller/Order");

const router=express.Router();

//order router
router.post('/',createOrder)
      .get('/own',fetchOrderByUser)
      .get('/',fetchAllOrder)
      .delete('/:id',deleteOrder)
      .patch('/:id',updateOrder)

exports.router=router;