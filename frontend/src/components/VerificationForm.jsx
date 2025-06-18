import React, {useState} from 'react'
import { publicApi } from '../api'
import { useNavigate } from 'react-router-dom'

function VerificationForm() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try{
            await publicApi.post("verify-email/", {code});
            alert("Verification successful, you can now log in.");
            navigate("/login");
        } catch (err) {
            setError("Verification failed. Please check your code and try again.");
        }finally {
            setLoading(false);
        }
    };
  

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: "400px", margin: "2rem auto"}}>
        <h2>Email Verification</h2>
        <p>Please Enter Code</p>
        <input
            type="text"
            name="code"
            value={code}
            maxLength={6}
            placeholder="Verification Code"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            style={{width: "100%", padding: "0.5rem", marginBottom: "1rem"}}
        
        />
        {error && <p style={{color: "red"}}>{error}</p>}
        <button type="submit" disabled={loading} style={{width: "100%", padding: "0.5rem"}}>
            {loading ? "Verifying..." : "Verify Email"}
        </button>
       

    </form>
  )
}

export default VerificationForm