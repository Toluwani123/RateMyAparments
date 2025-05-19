import { useState, useEffect } from "react";
import api,{publicApi} from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";


function Form({route, method}) {
    const [formData, setFormData] = useState({});
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";
    
    useEffect(() => {
        if (method === "register") {
            publicApi.get("/campuses/") // Adjust endpoint if needed
                .then(res => setCampuses(res.data))
                .catch(() => setCampuses([]));
        }
    }, [method]);
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const response = await api.post(route, formData);
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                navigate("/");
            }
            else {
                alert("Registration successful");
                navigate("/login");
            }
        }
        catch (error) {
            let message = "An error occurred. Please try again.";
            if (error.response && error.response.data) {
                if (typeof error.response.data === "string") {
                    message = error.response.data;
                } else if (typeof error.response.data === "object") {
                    // Collect all error messages from the API response
                    message = Object.values(error.response.data)
                        .flat()
                        .join("\n");
                }
            }
            alert(message);
        } finally {
            setLoading(false);
        };
    }

    return (
        <form onSubmit={handleSubmit} className="form">
            <h2>{name}</h2>
            {method === "register" ? (
                <>
                    <input name="username" placeholder="Username" onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                    <input name="first_name" placeholder="First Name" onChange={handleChange} required />
                    <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                    <input name="password2" type="password" placeholder="Confirm Password" onChange={handleChange} required />
                    <select name="campus" onChange={handleChange} required>
                        <option value="">Select Campus</option>
                        {campuses.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </>
            ):(
                <>
                    <input name="username" placeholder="Username" onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                </>
            )}
            <button type="submit" disabled={loading}>{loading ? "Loading..." : name}</button>
    
            
        </form> 
    )
            

};
export default Form;