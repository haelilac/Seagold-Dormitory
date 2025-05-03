import React, { useState } from "react";
import axios from "axios";

const ProfileUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("profile", file);
    setUploading(true);

    try {
      const res = await axios.post("http://seagold-laravel-production.up.railway.app/api/upload-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`,
        },
      });

      if (onUploadSuccess) onUploadSuccess(res.data.image_url);
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ProfileUploader;
