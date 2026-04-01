import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";
import {
  getMyBasket,
  addToBasket,
  updateBasketItem,
  removeBasketItem,
  clearMyBasket,
} from "../controllers/basketController.js";

const router = express.Router();

router.use(protect, allowRoles(ROLES.CUSTOMER));

router.get("/", getMyBasket);
router.post("/items", addToBasket);
router.put("/items/:itemId", updateBasketItem);
router.delete("/items/:itemId", removeBasketItem);
router.delete("/", clearMyBasket);

export default router;
