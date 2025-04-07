export const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };
  
  export const getUserRole = () => {
    return localStorage.getItem("role") || sessionStorage.getItem("role");
  };
  