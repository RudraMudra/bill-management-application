// import { useState } from "react";
// import { login } from "../services/API";

// const LoginForm = ({ setVendorId }) => {
//     const [userId, setUserId] = useState("");
//     const [password, setPassword] = useState("");

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const data = await login(userId, password);
//         if (data.success) {
//             setVendorId(data.Vendor_Id);
//         } else {
//             alert(data.message);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" required />
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
//             <button type="submit">Login</button>
//         </form>
//     );
// };

// export default LoginForm;
