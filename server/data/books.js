const mongoCollections = require('../config/mongoCollection');
const books = mongoCollections.books;
const library = mongoCollections.library;
const { ObjectId } = require('mongodb');
const users = mongoCollections.users;

function validateStringParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    } else if (typeof param !== 'string') {
        throw `Type Error: Argument ${param} passed is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw `Error: No element present in string ${paramName}`;
    } else if (!param.trim()) {
        throw `Error: Empty spaces passed to string ${paramName}`;
    }
}
function validateBoolParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    }
    if (typeof param != 'boolean') {
        throw `Type Error: Argument ${param} passed is not a boolean ${paramName}`;
    }
}

function validateNumberParams(param, paramName) {
    if (param < 0) {
        throw `${paramName} can not be negative`;
    }
    if (typeof param === 'number' || !isNaN(param)) {
        if (Number.isInteger(param)) {
            return true;
        } else {
            return true;
        }
    } else {
        throw `Type Error: Argument ${param} passed is not a numeric ${paramName}`;
    }
}

function validateRating(element) {
    if (element !== 0 && (!element || typeof element !== 'number')) {
        throw `Error : Ratings passed is not a number`;
    }

    if (element < 0 || element > 5) {
        throw `Rating does not lie in valid range`;
    }
}

function validateWebsite(websiteLink) {
    const validLink = /^http(s)/;
    websiteLink = websiteLink.trim().toLowerCase();
    if (!websiteLink.match(validLink)) {
        throw `Error: ${websiteLink} is not a valid web site link`;
    }
}

function validateDate(dateParams) {
    const validDateFormat = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateParams.match(validDateFormat)) {
        throw 'date is not in valid format';
    }
}

function validateDateOfPurchase(dateParams) {
    const validDateFormat = /^\d{1}\/\d{2}\/\d{4}$/;
    if (!dateParams.match(validDateFormat)) {
        throw 'purchase date is not in valid format';
    }
}

function validateEmail(email) {
    const emailRegex = /^\S+@[a-zA-Z]+\.[a-zA-Z]+$/;
    if (!emailRegex.test(email)) throw 'Given email id is invalid';
}

async function getById(searchId) {
    validateStringParams(searchId, 'Id');
    searchId = searchId.trim();
    if (!ObjectId.isValid(searchId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    let parseId = ObjectId(searchId);
    const booksCollection = await books();
    const bookFound = await booksCollection.findOne({ _id: parseId });
    if (bookFound === null) {
        throw `No book found with the id ${searchId}`;
    } else {
        bookFound['_id'] = searchId;
    }
    return bookFound;
}

async function getAll() {
    let len = arguments.length;
    if (len > 0) {
        throw `Error: getAll does not accept arguments`;
    }
    const booksCollection = await books();

    const booksList = await booksCollection
        .find({ price: { $ne: 'Not For Sale' } })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book['_id'];
        book['_id'] = id.toString();
    }
    return booksList;
}

async function getNewAddition() {
    let len = arguments.length;
    if (len > 0) {
        throw `Error: getNewAddition does not accept arguments`;
    }
    const booksCollection = await books();

    const booksList = await booksCollection
        .find({
            $and: [
                { originalPublicationYear: { $gte: 2016 } },
                {
                    price: { $ne: 'Not For Sale' },
                },
            ],
        })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book['_id'];
        book['_id'] = id.toString();
    }
    return booksList;
}

async function getBooksForRent() {
    let len = arguments.length;
    if (len > 0) {
        throw `Error: getBooksForRent does not accept arguments`;
    }
    const booksCollection = await books();

    const booksList = await booksCollection
        .find({
            price: 'Not For Sale',
        })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book['_id'];
        book['_id'] = id.toString();
    }
    return booksList;
}
function validateBookCreations(
    ISBN,
    url,
    description,
    author,
    averageRating,
    binding,
    genre,
    numberofPages,
    originalPublicationYear,
    price,
    publisher,
    title,
    yearPublished
) {
    validateStringParams(ISBN, 'ISBN');
    validateWebsite(url, 'url');
    validateStringParams(description, 'description');
    validateStringParams(author, 'author');
    validateStringParams(binding, 'binding');
    validateStringParams(genre, 'genre');
    validateStringParams(publisher, 'publisher');
    validateStringParams(title, 'title');
    validateRating(averageRating, 'averageRating');
    validateNumberParams(numberofPages, 'numberofPages');
    validateNumberParams(originalPublicationYear, 'originalPublicationYear');
    validateNumberParams(price, 'price');
    validateNumberParams(yearPublished, 'yearPublished');
    // validateBoolParams(popular, 'popular');
    // validateBoolParams(availableForRent, 'availableForRent');
}
async function addNewBook(
    ISBN,
    url,
    description,
    author,
    averageRating,
    binding,
    genre,
    numberofPages,
    originalPublicationYear,
    price,
    publisher,
    title,
    yearPublished,
    count
) {
    try {
        validateBookCreations(
            ISBN,
            url,
            description,
            author,
            averageRating,
            binding,
            genre,
            numberofPages,
            originalPublicationYear,
            price,
            publisher,
            title,
            yearPublished
        );
        console.log('add data');
        ISBN = ISBN.trim();
        description = description.trim();
        author = author.trim();
        binding = binding.trim();
        genre = genre.trim();
        publisher = publisher.trim();
        title = title.trim();
        const booksCollection = await books();
        let newBook = {
            ISBN: ISBN,
            url: url,
            description: description,
            author: author,
            averageRating: averageRating,
            binding: binding,
            genre: genre,
            numberofPages: numberofPages,
            originalPublicationYear: originalPublicationYear,
            price: price,
            publisher: publisher,
            title: title,
            yearPublished: yearPublished,
            count: count,
        };
        const insertedDatadetails = await booksCollection.insertOne(newBook);
        if (insertedDatadetails.insertedCount === 0) {
            throw 'Book could not be inserted ';
        }

        const insertedBookId = insertedDatadetails.insertedId.toString();

        const bookDetails = await getById(insertedBookId);
        return bookDetails;
    } catch (error) {
        console.log(error);
        throwCatchError(error);
    }
}
function validateCreations(email, bookId, startDate, endDate, flag) {
    validateEmail(email);
    validateStringParams(bookId, 'bookId');
    if (!ObjectId.isValid(bookId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    validateStringParams(flag, 'flag');
    validateStringParams(startDate, 'startDate');
    validateStringParams(endDate, 'endDate');
    validateDate(startDate);
    validateDate(endDate);
}

async function addRentedBook(email, bookId, startDate, endDate, flag) {
    validateCreations(email, bookId, startDate, endDate, flag);
    email = email.trim();
    bookId = bookId.trim();
    const libraryCollection = await library();
    let newBook = {
        email: email,
        bookId: bookId,
        startDate: startDate,
        endDate: endDate,
        flag: flag,
    };
    const insertedDatadetails = await libraryCollection.insertOne(newBook);
    if (insertedDatadetails.insertedCount === 0) {
        throw 'Book could not be inserted to rent';
    }

    const insertedBookId = insertedDatadetails.insertedId.toString();

    const bookDetails = await getRentedBookById(insertedBookId);

    const userCollection = await users();

    let constUserId = await userCollection.findOne({
        email: email,
    });
    if (constUserId === null) throw `No user with that email.`;

    const newRentedBook = {
        _id: ObjectId(bookId),
        startDate: startDate,
        endDate: endDate,
    };

    const booksArrUpdated = await userCollection.updateOne(
        { email: email },
        { $push: { bookRenting: newRentedBook } }
    );
    if (!booksArrUpdated.matchedCount && !booksArrUpdated.modifiedCount) {
        throw `Could not add rented book to the user db.`;
    }
    return bookDetails;
}

async function getRentedBookById(searchId) {
    validateStringParams(searchId, 'Id');
    searchId = searchId.trim();
    if (!ObjectId.isValid(searchId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    let parseId = ObjectId(searchId);
    const libraryCollection = await library();
    const bookFound = await libraryCollection.findOne({ _id: parseId });
    if (bookFound === null) {
        throw `No book found with the id ${searchId}`;
    } else {
        bookFound['_id'] = searchId;
    }
    return bookFound;
}

async function buyBook(email, bookId, quantity, totalPrice, dateOfPurchase) {
    validateEmail(email);
    validateStringParams(bookId, 'bookId');
    if (!ObjectId.isValid(bookId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    validateNumberParams(quantity, 'quantity');
    validateNumberParams(totalPrice, 'totalPrice');
    validateDateOfPurchase(dateOfPurchase);
    let totalCount = 0;
    email = email.trim();
    bookId = bookId.trim();

    const checkBookDetails = await getById(bookId);
    const booksCollection = await books();
    const userCollection = await users();
    totalCount = checkBookDetails.count + quantity;

    let constUserId = await userCollection.findOne({
        email: email,
    });
    if (constUserId === null) throw `No user with that id.`;

    const newBook = {
        _id: ObjectId(bookId),
        quantity: quantity,
        totalPrice: totalPrice,
        dateOfPurchase: dateOfPurchase,
    };

    const booksArrUpdated = await userCollection.updateOne(
        { email: email },
        { $push: { purchasedBooks: newBook } }
    );
    if (!booksArrUpdated.matchedCount && !booksArrUpdated.modifiedCount) {
        throw `Could not add purchased book to the user db.`;
    }

    const updateBookCount = await booksCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $set: { count: totalCount } }
    );
    if (!updateBookCount.matchedCount && !updateBookCount.modifiedCount) {
        throw `Could not add purchased book to the user db.`;
    }
    return newBook;
}

async function getMostPopular() {
    let len = arguments.length;
    if (len > 0) {
        throw `Error: getMostPopular does not accept arguments`;
    }

    const booksCollection = await books();
    const booksList = await booksCollection
        .find({
            count: { $gt: 1 },
        })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book['_id'];
        book['_id'] = id.toString();
    }
    booksList.sort((a, b) => b.count - a.count);
    return booksList;
}

async function searchBooks(searchVal) {
    validateStringParams(searchVal, 'searchVal');
    const booksCollection = await books();
    var re = new RegExp('^' + searchVal + '.*', 'i');
    const booksList = await booksCollection
        .find({ title: { $regex: re } })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book['_id'];
        book['_id'] = id.toString();
    }
    return booksList;
}

async function getBooksByGenre(genre) {
    validateStringParams(genre, "genre");
    const booksCollection = await books();
    const booksList = await booksCollection
        .find({
            genre: genre,
        })
        .toArray();
    if (booksList.length === 0) {
        return [];
    }
    for (let book of booksList) {
        let id = book["_id"];
        book["_id"] = id.toString();
    }
    return booksList;
}

module.exports = {
    addNewBook,
    getAll,
    getById,
    getNewAddition,
    getBooksForRent,
    addRentedBook,
    buyBook,
    getMostPopular,
    searchBooks,
    getBooksByGenre,
};
