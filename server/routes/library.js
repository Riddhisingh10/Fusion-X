const express = require('express');
const router = express.Router();
const LibraryBook = require('../models/LibraryBook');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/library
// @desc    Get all books
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const books = await LibraryBook.find(query).populate('borrowedBy', 'name');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/library/my-books
// @desc    Get books borrowed by current user
// @access  Private
router.get('/my-books', protect, async (req, res) => {
    try {
        const books = await LibraryBook.find({ borrowedBy: req.user.id });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/library/:id/borrow
// @desc    Borrow a book
// @access  Private
router.post('/:id/borrow', protect, async (req, res) => {
    try {
        const book = await LibraryBook.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.status !== 'Available') {
            return res.status(400).json({ message: 'Book is not available' });
        }

        book.status = 'Borrowed';
        book.borrowedBy = req.user.id;
        book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        await book.save();

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/library/:id/return
// @desc    Return a borrowed book
// @access  Private
router.post('/:id/return', protect, async (req, res) => {
    try {
        const book = await LibraryBook.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.borrowedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not your book to return' });
        }

        book.status = 'Available';
        book.borrowedBy = null;
        book.dueDate = null;
        await book.save();

        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/library
// @desc    Add a new book (Admin)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { title, author, isbn } = req.body;
        const book = await LibraryBook.create({ title, author, isbn });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
