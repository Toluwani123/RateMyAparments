import React, { useState, useEffect } from "react";
import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants";


function ProtectedRoute({children}) {
    const [isAuthorized, setAuthorized] = useState(false);


    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (refreshToken) {
            try {
                const response = await api.post('/token/refresh/', {refresh: refreshToken});
                if (response.status === 200) {
                    localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                    setAuthorized(true);
                }
                else {
                    setAuthorized(false);
                }
            } catch (error) {
                console.error('Error refreshing token:', error);
                setAuthorized(false);
            }
        } else {
            setAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp < currentTime) {
                    await refreshToken();
                } else {
                    setAuthorized(true);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                setAuthorized(false);
            }
        } else {
            setAuthorized(false);
        }
    }
    useEffect(() => {
        auth().catch(()=> setAuthorized(false));
    }, []);

    if (isAuthorized === null){
        return <div>Loading...</div>
    }

    return isAuthorized ? (
        children
    ) : (
        <Navigate to="/login"/>
    );
}

export default ProtectedRoute;