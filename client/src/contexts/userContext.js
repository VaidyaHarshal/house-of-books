import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChangedListener } from '../firebase/firebase';

export const UserContext = createContext({
    currentUser: 'null',
    setCurrentUser: () => 'null',
});

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState('');
    const value = { currentUser, setCurrentUser };

    useEffect(() => {
        const unsubscribe = onAuthStateChangedListener((user) => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, []);

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};
