const { StatusCodes } = require("http-status-codes");
const Book = require("../model/bookModel");
const User = require("../model/userModel");
const CustomError = require("../middleware/CustomError");

exports.addBook = async (req, res) => {
  const books = await Book.create(req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    books,
  });
};

exports.getBook = async (req, res) => {
  console.log("get book called");
  const books = await Book.find();
  res.status(StatusCodes.OK).json({
    success: true,
    books,
  });
};

exports.getBookCategory = async (req, res) => {
  const categoryPrefix = req.params.category;

  const categoryRegex = new RegExp(`^${categoryPrefix}`);

  try {
    const books = await Book.find({
      $or: [{ category: categoryRegex }, { name: categoryRegex }],
    });

    if (!books || books.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No books found with the specified category prefix.",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      books: books,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while retrieving books.",
    });
  }
};

exports.updateBook = async (req, res) => {
  const { name, author, quantity, category } = req.body;
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { serialno: req.body.serialno },
      { name, author, quantity, category },
      {
        new: true,
      }
    );

    if (!updatedBook) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Book not found with the given serialno.",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      books: updatedBook,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while updating the book.",
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const serialno = req.params.serialno;
    const book = await Book.findOneAndDelete({ serialno: serialno });
    const books = await Book.find();
    res.status(StatusCodes.OK).json({
      success: true,
      books,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { userid, serialno, quantity } = req.body;
    const c_user = await User.findOne({ userid });
    const books = await Book.findOneAndUpdate(
      { serialno },
      {
        $inc: { quantity: -1 },
        $push: { issuedBy: { userid } },
      },
      { new: true }
    );
    c_user.issuedBooks.push({ serialno });
    await c_user.save();

    const allBooks = await Book.find();
    res.status(StatusCodes.OK).json({
      success: true,
      books: allBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while issuing the book.",
    });
  }
};

exports.getIssuedBooksByUser = async (req, res) => {
  try {
    const userid = req.params.id;

    const user = await User.findOne({ userid });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }
    // console.log(user);
    const issuedSerialNos = user.issuedBooks.map((book) => book.serialno);

    const issuedBooks = await Book.find({ serialno: { $in: issuedSerialNos } });

    res.status(StatusCodes.OK).json({
      success: true,
      books: issuedBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while fetching issued books.",
    });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { userid, serialno } = req.body;
    console.log(req.body);
    const user = await User.findOne({ userid });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedIssuedBooks = user.issuedBooks.filter(
      (book) => book.serialno !== serialno
    );

    user.issuedBooks = updatedIssuedBooks;
    await user.save();

    const book = await Book.findOneAndUpdate(
      { serialno: serialno },
      {
        $inc: { quantity: 1 },
        $pull: { issuedBy: { userid } },
      },
      { new: true }
    );

    if (!book) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Book not found",
      });
    }

    const issuedSerialNos = user.issuedBooks.map((book) => book.serialno);

    const issuedBooks = await Book.find({ serialno: { $in: issuedSerialNos } });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Book returned successfully",
      books: issuedBooks,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while returning the book.",
    });
  }
};

exports.searchBook = async (req, res) => {
  try {
    const query = req.params.query;

    const books = await Book.find({
      $or: [
        { category: { $regex: new RegExp(query, "i") } },
        { name: { $regex: new RegExp(query, "i") } },
      ],
    });

    res.status(StatusCodes.OK).json({
      success: true,
      books: books,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while searching for books.",
    });
  }
};
