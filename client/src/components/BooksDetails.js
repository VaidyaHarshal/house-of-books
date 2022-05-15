import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../store/selector/cartSelector';
import { addItemToCart } from '../store/actions/cartAction';
import noImage from '../assets/images/no-image.jpeg';
import { auth } from '../firebase/firebase';
import AddToWishlist from './AddToWishlist';
import { UserContext } from '../contexts/userContext';
// import Button from './Button';
import {
  makeStyles,
  Card,
  Grid,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import { Button } from '@mui/material';
const useStyles = makeStyles({
  card: {
    maxWidth: 550,
    height: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 5,
    border: '1px solid #222',
    boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);',
    color: '#222',
  },
  titleHead: {
    borderBottom: '1px solid #222',
    fontWeight: 'bold',
    color: '#222',
    fontSize: 'large',
  },
  grid: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  media: {
    height: '100%',
    width: '100%',
  },
  button: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

const defaultFormFields = {
  review: '',
  rating: 0,
};

const BookDetails = (props) => {
  const [loading, setLoading] = useState(true);
  const [reviewDetails, setReviewDetails] = useState(defaultFormFields);
  const { review, rating } = reviewDetails;
  const classes = useStyles();
  const [bookDetailsData, setBookDetailsData] = useState(undefined);
  const user = auth.currentUser;
  let { id } = useParams();
  const history = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [userWishlistData, setUserWishlistData] = useState([]);
  const [isInserted, setIsInserted] = useState(0);
  const { currentUser } = useContext(UserContext);
  const [error, setError] = useState(false);
  let checkBook;

  useEffect(() => {
    console.log('useEffect fired');
    async function fetchData() {
      try {
        const url = `http://localhost:4000/books/${id}`;
        const { data } = await axios.get(url);
        console.log(data);
        setBookDetailsData(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [id]);

  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  function formatDate(date) {
    return [
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
      date.getFullYear(),
    ].join('-');
  }

  function formatDateNextMonth(date) {
    return [
      padTo2Digits(date.getMonth() + 2),
      padTo2Digits(date.getDate()),
      date.getFullYear(),
    ].join('-');
  }

  //   function alertFunc(date) {
  //     alert(
  //       'Book has been rented. Please return it within 30 days. Your end date for return is ' +
  //         date
  //     );
  //   }
  const buyBook = (title, bookId, price, imageUrl) => {
    let todayDate = formatDate(new Date());
    console.log(todayDate);

    let dataBody = {
      email: user.email,
      name: title,
      price: price,
      bookId: bookId,
      imageUrl: imageUrl,
      flag: 'B',
    };
    dispatch(addItemToCart(cartItems, dataBody));
    // axios
    //   .post('https://houseof-books.herokuapp.com/books/purchase', {
    //     data: dataBody,
    //   })
    //   .then(function (response) {
    //     console.log(response.data);
    //     history('/', { replace: true }); //to be changed to cart
    //   });
  };

  const rentBook = (title, bookId, quantity, price, imageUrl) => {
    let todayDate = formatDate(new Date());
    let endDate = formatDateNextMonth(new Date());
    console.log(todayDate);
    let dataBody = {
      email: user.email,
      name: title,
      price: 7.0,
      bookId: bookId,
      quantity: quantity,
      totalPrice: quantity * price,
      imageUrl: imageUrl,
      flag: 'B',
      startDate: todayDate,
      endDate: endDate,
    };
    dispatch(addItemToCart(cartItems, dataBody));
    // axios
    //   .post('https://houseof-books.herokuapp.com/library', {
    //     data: dataBody,
    //   })
    //   .then(function (response) {
    //     console.log(response.data);
    //     alertFunc(endDate);
    //     history('/', { replace: true }); //to be changed to cart
    //   });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setReviewDetails({ ...reviewDetails, [name]: value });
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault();

    let dataBody = {
      bookId: bookDetailsData._id,
      email: auth.currentUser.email,
      rating: rating,
      comment: review,
      username: bookDetailsData.username,
    };
    axios
      .post('http://localhost:4000/reviews/review', { data: dataBody })
      .then(function (response) {
        console.log(response.data);
        history(`/books/${bookDetailsData._id}`, { replace: true });
      });
  };

  const removeReview = (reviewId) => {
    axios
      .delete(`http://localhost:4000/reviews/deleteReview/${reviewId}`)
      .then(function (response) {
        console.log(response.data);
        history(`/books/${bookDetailsData._id}`, { replace: true });
      });
  };

  // const editReview = (bookId, reviewId) => {
  //   let dataBody = {
  //     bookId: bookId,
  //     reviewId: reviewId,
  //   };
  //   axios
  //     .put('http://localhost:4000/reviews/updateReview', {
  //       data: dataBody,
  //     })
  //     .then(function (response) {
  //       console.log(response.data);
  //       history(`/books/${bookDetailsData._id}`, { replace: true });
  //     });
  // };
  let onClickWishlist = async (bookId, title) => {
    try {
      // console.log(bookId);
      const url = `http://localhost:4000/users/bookshelf/add`;
      const { data } = await axios.post(url, {
        email: currentUser.email,
        bookId: bookId,
        title: title,
      });
      // console.log(data);
      if (data.inserted === true) setIsInserted(Number(isInserted) + 1);
      // setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };
  let handleRemoveWishlist = async (bookId, title) => {
    try {
      // console.log('inside remove onclick');
      const url = `http://localhost:4000/users/bookshelf/remove`;
      const { data } = await axios.post(url, {
        email: currentUser.email,
        bookId: bookId,
        title: title,
      });
      // console.log(data);
      if (data.deleted === true) setIsInserted(Number(isInserted) - 1);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log(bookId);.
        const url = `http://localhost:4000/users/profile`;
        const { data } = await axios.post(url, {
          data: currentUser.email,
        });
        //

        setUserWishlistData(data.wishlist);
        if (!userWishlistData.wishlist) setError(true);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [currentUser, isInserted]);
  if (loading) {
    return (
      <div>
        {isNaN(bookDetailsData) ? (
          <h1>Error 404: Page not found</h1>
        ) : (
          <div>
            <h2>Loading....</h2>
          </div>
        )}
      </div>
    );
  } else {
    checkBook = userWishlistData.some((post, index) => {
      return post.bookId === bookDetailsData._id;
    });
    return (
      <>
        <Grid
          item
          xs={12}
          sm={11}
          md={5}
          lg={5}
          xl={9}
          key={bookDetailsData._id}
        >
          <Card className={classes.card} variant='outlined'>
            <CardMedia
              className={classes.media}
              component='img'
              image={bookDetailsData.url ? bookDetailsData.url : noImage}
              title='book image'
            />
            <CardContent>
              <Typography
                variant='body2'
                color='textSecondary'
                component='span'
              >
                <p className='title1'>{bookDetailsData.title}</p>
                <dl>
                  <p>
                    <dt className='title'>Description:</dt>
                    {bookDetailsData && bookDetailsData.description ? (
                      <dd>{bookDetailsData.description}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Author:</dt>
                    {bookDetailsData && bookDetailsData.author ? (
                      <dd>{bookDetailsData.author}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>ISBN:</dt>
                    {bookDetailsData && bookDetailsData.ISBN ? (
                      <dd>{bookDetailsData.ISBN}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Average Rating:</dt>
                    {bookDetailsData && bookDetailsData.averageRating ? (
                      <dd>{bookDetailsData.averageRating}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Publisher:</dt>
                    {bookDetailsData && bookDetailsData.publisher ? (
                      <dd>{bookDetailsData.publisher}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Genre:</dt>
                    {bookDetailsData && bookDetailsData.genre ? (
                      <dd>{bookDetailsData.genre}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Number of pages:</dt>
                    {bookDetailsData && bookDetailsData.numberofPages ? (
                      <dd>{bookDetailsData.numberofPages}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Original Publication Year:</dt>
                    {bookDetailsData &&
                    bookDetailsData.originalPublicationYear ? (
                      <dd>{bookDetailsData.originalPublicationYear}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Price:</dt>
                    {bookDetailsData && bookDetailsData.price ? (
                      <dd>$ {bookDetailsData.price}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                  <p>
                    <dt className='title'>Year Published:</dt>
                    {bookDetailsData && bookDetailsData.yearPublished ? (
                      <dd>{bookDetailsData.yearPublished}</dd>
                    ) : (
                      <dd>N/A</dd>
                    )}
                  </p>
                </dl>
              </Typography>
            </CardContent>
            {isNaN(parseFloat(bookDetailsData.price)) ? (
              <button
                className='button'
                onClick={() =>
                  rentBook(
                    bookDetailsData.title,
                    bookDetailsData._id,
                    1,
                    bookDetailsData.price,
                    bookDetailsData.url
                  )
                }
              >
                Rent
              </button>
            ) : (
              <button
                type='button'
                className='button'
                onClick={() =>
                  buyBook(
                    bookDetailsData.title,
                    bookDetailsData._id,
                    bookDetailsData.price,
                    bookDetailsData.url
                  )
                }
              >
                Buy
              </button>
            )}
            {user && !checkBook && (
              <AddToWishlist
                bookid={bookDetailsData._id}
                handleOnClick={() =>
                  onClickWishlist(bookDetailsData._id, bookDetailsData.title)
                }
              />
            )}
            {user && checkBook && (
              <Button
                variant='contained'
                color='error'
                onClick={() =>
                  handleRemoveWishlist(
                    bookDetailsData._id,
                    bookDetailsData.title
                  )
                }
              >
                Remove from Wishlist
              </Button>
            )}
          </Card>
        </Grid>
        {auth.currentUser ? (
          <div className='sign-up-container'>
            <h2>Write a Review</h2>
            <form onSubmit={handleOnSubmit}>
              <label htmlFor='review'>Review </label>
              <textarea
                label='Review'
                type='text'
                required
                onChange={handleChange}
                value={review ? review : ''}
                id='review'
                rows={3}
                cols={30}
                name='review'
              />
              <br /> <br />
              <label htmlFor='rating'>Rating </label>
              <select
                name='rating'
                value={rating ? rating : 0}
                id='rating'
                onChange={handleChange}
              >
                <option value='1'>1 Star</option>
                <option value='2'>2 Stars</option>
                <option value='3'>3 Stars</option>
                <option value='4'>4 Stars</option>
                <option value='5'>5 Stars</option>
              </select>
              <br></br> <br></br>
              <Button type='submit'>Post Review</Button>
            </form>
          </div>
        ) : null}
        <h2>Reviews</h2>
        {bookDetailsData.reviews.map((review) => {
          const { _id, comment, rating, username, dateOfReview, email } =
            review;
          return (
            <div>
              <h3>Username: {username}</h3>
              <div>
                <h2>Rating: {rating}</h2>
                <p>
                  {comment} <br />
                  {dateOfReview}
                </p>
                {auth.currentUser && auth.currentUser.email === email ? (
                  <button
                    type='button'
                    className='button'
                    onClick={() => {
                      if (auth.currentUser) {
                        removeReview(_id);
                      } else {
                        alert('You need to sign in first to buy the book');
                      }
                    }}
                  >
                    Delete Review
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </>
    );
  }
};

export default BookDetails;
