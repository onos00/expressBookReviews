const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
  
      if (!isValid(username)) {
  
        users.push({
          "username": username,
          "password": password
        });
  
        return res.status(200).json({
          message: "User successfully registered. Now you can login"
        });
  
      } else {
        return res.status(404).json({
          message: "User already exists!"
        });
      }
  
    }
  
    return res.status(404).json({
      message: "Unable to register user."
    });
  
  });

// Internal endpoint used by Axios to retrieve book data
public_users.get('/books-data', function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books-data');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get('http://localhost:5000/books-data')
    .then(response => {
      const book = response.data[isbn];

      if (!book) {
        return res.status(404).json({
          message: "Book not found"
        });
      }

      return res.status(200).json(book);
    })
    .catch(error => {
      return res.status(500).json({
        message: "Unable to retrieve book"
      });
    });
});

// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get('http://localhost:5000/books-data');

    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to retrieve books"
    });
  }
});

// Get books based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  axios.get('http://localhost:5000/books-data')
    .then(response => {
      const result = Object.values(response.data).filter(
        book => book.title.toLowerCase() === title.toLowerCase()
      );

      if (result.length === 0) {
        return res.status(404).json({

          message: "No books found with this title"
        });
      }

      return res.status(200).json(result);
    })
    .catch(error => {
      return res.status(500).json({
        message: "Unable to retrieve books"
      });
    });
});

// Get book review

public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;
  
    return res.status(200).json(books[isbn].reviews);
  
  });

module.exports.general = public_users;
