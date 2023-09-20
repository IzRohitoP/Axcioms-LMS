const express = require("express");
const {
  addBook,
  getBook,
  updateBook,
  issueBook,
  getBookCategory,
  getIssuedBooksByUser,
  returnBook,
  searchBook,
  deleteBook,
} = require("../controller/bookController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/book/get").get(getBook);
router.route("/book/search/:query").get(searchBook);
router.route("/book/add").post(addBook);
router.route("/book/update").put(updateBook);
router.route("/book/delete/:serialno").delete(deleteBook);
router.route("/book/issue").post(issueBook);
router.route("/book/return").post(returnBook);
router.route("/book/category/:category").get(getBookCategory);
router.route("/book/user/:id").get(getIssuedBooksByUser);

module.exports = router;
