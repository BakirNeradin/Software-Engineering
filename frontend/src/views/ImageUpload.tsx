import { useState } from "react";


function ImageUpload() {  
  const API_URL = "http://localhost:8000";
  const [file, setFile] = useState<File | null>(null)
  

  const uploadImage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!file) return;
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data.url, "test");
};

  return (
    <>
    <form onSubmit={uploadImage}>
    <input onChange={(e) => setFile(e.target.files?.[0] || null)} type="file" id="myFile" name="filename"/>
    <input type="submit"/>
    </form>
    </>
  );
}

export default ImageUpload