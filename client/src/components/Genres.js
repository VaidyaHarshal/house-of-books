import React, {useState, useEffect, useContext} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectCartItems} from "../store/selector/cartSelector";
import {addItemToCart} from "../store/actions/cartAction";
import {UserContext} from "../contexts/userContext";
import {auth} from "../firebase/firebase";
import axios from "axios";
import AddToWishlist from "./AddToWishlist";
import {Link, useParams} from "react-router-dom";
import noImage from "../assets/images/no-image.jpeg";
import {Button} from "react-bootstrap";
import "../styles/Genres.scss";

const BookGenres = (props) => {
    const [loading, setLoading] = useState(true);
    const [bookDetailsData, setBookDetailsData] = useState(undefined);
    const [error, setError] = useState(false);
    const {currentUser} = useContext(UserContext);
    const dispatch = useDispatch();
    const cartItems = useSelector(selectCartItems);
    const user = auth.currentUser;
    const [userWishlistData, setUserWishlistData] = useState([]);
    const [isInserted, setIsInserted] = useState(0);
    const [genreNew, setGenre] = useState(undefined);

    const handleChange = (event) => {
        const {name, value} = event.target;
        setGenre(value);
    };

    useEffect(() => {
        console.log("useEffect fired");
        async function fetchData() {
            try {
                const url = `http://localhost:4000/books/genres/${genreNew}`;
                const {data} = await axios.get(url);
                console.log("data", data);
                setBookDetailsData(data);
                setLoading(false);
            } catch (e) {
                setError(true);
                console.log(e);
            }
        }
        fetchData();
    }, [genreNew, currentUser]);
    let onClickWishlist = async (bookId, title) => {
        try {
            const url = `http://localhost:4000/users/bookshelf/add`;
            const {data} = await axios.post(url, {
                email: currentUser.email,
                bookId: bookId,
                title: title,
            });
            if (data.inserted === true) setIsInserted(Number(isInserted) + 1);
        } catch (e) {
            console.log(e);
        }
    };
    let handleRemoveWishlist = async (bookId, title) => {
        try {
            // console.log('inside remove onclick');
            const url = `http://localhost:4000/users/bookshelf/remove`;
            const {data} = await axios.post(url, {
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
                const {data} = await axios.post(url, {
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

    const buyBook = (title, bookId, price, imageUrl) => {
        price = parseFloat(price);
        let dataBody = {
            email: user.email,
            name: title,
            bookId: bookId,
            price: isNaN(parseInt(price)) ? 7.0 : price,
            imageUrl: imageUrl,
            flag: "B",
        };
        dispatch(addItemToCart(cartItems, dataBody));
    };

    const checkBook = (id) => {
        return userWishlistData.some((post, index) => {
            return post.bookId === id;
        });
    };

    if (loading) {
        return (
            <div>
                {isNaN(bookDetailsData) ? (
                    <p>
                        <h1>Error 404: Page not found</h1>
                    </p>
                ) : (
                    <div>
                        <h2>Loading....</h2>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div>
                <div>
                    <label>Genre</label>
                    <select
                        className='form-input-label'
                        label='Genre'
                        required
                        onChange={handleChange}
                        value={genreNew}
                        name='Genre'
                    >
                        {" "}
                        <option value='None'></option>
                        <option value='thriller'>Thriller</option>
                        <option value='fiction'>Fiction</option>
                        <option value='fantasy'>Fantasy</option>
                        <option value='self-help'>Self Help</option>
                        <option value='biography'>Biography</option>
                        <option value='romance'>Romance</option>
                        <option value='humor'>Humor</option>
                    </select>
                </div>
                {bookDetailsData && bookDetailsData.length !== 0 && (
                    <h2>You are viewing {genreNew} books</h2>
                )}
                {bookDetailsData && bookDetailsData.length === 0 && (
                    <h2>Please select a genre from the dropdown</h2>
                )}
                <br></br>
                <br></br>
                <div className='genres-container'>
                    {bookDetailsData &&
                        bookDetailsData.map(({_id, url, title, price}) => (
                            <div className='genres-card-container' key={_id}>
                                <Link to={`/books/${_id}`}>
                                    <img
                                        src={url ? url : noImage}
                                        alt={`${title}`}
                                    />
                                </Link>
                                <span className='title'>{title}</span>
                                {user && (
                                    <Button
                                        className='btn'
                                        variant='primary'
                                        onClick={() =>
                                            buyBook(title, _id, price, url)
                                        }
                                    >
                                        <span className='price'>
                                            $
                                            {isNaN(parseInt(price))
                                                ? 7.0
                                                : price}
                                        </span>
                                        <span>Add to Cart</span>
                                    </Button>
                                )}
                                {user && !checkBook(_id) && (
                                    <AddToWishlist
                                        bookid={_id}
                                        handleOnClick={() =>
                                            onClickWishlist(_id, title)
                                        }
                                    />
                                )}
                                {user && checkBook(_id) && (
                                    <Button
                                        variant='contained'
                                        color='error'
                                        onClick={() =>
                                            handleRemoveWishlist(_id, title)
                                        }
                                    >
                                        Remove from Wishlist
                                    </Button>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        );
    }
};

export default BookGenres;