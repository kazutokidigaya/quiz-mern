import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CgChevronLeftO } from "react-icons/cg";
import API from "../api/auth";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { authToken, userDetails, fetchUserDetails } = useAuth(); // Fetch context values
  const [formData, setFormData] = useState({
    name: "",
    profileImage: "",
    oldPassword: "",
    newPassword: "",
  });

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", `profile_upload`);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dqela8lj8/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      return data.secure_url; // Return the uploaded image URL
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw new Error("Image upload failed");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      let profileImageUrl = userDetails?.profileImage; // Use existing profile image

      // If a new image is uploaded
      if (formData.profileImage) {
        profileImageUrl = await uploadImageToCloudinary(formData.profileImage);
      }

      const payload = userDetails?.isGoogleUser
        ? {
            email: userDetails?.email,
            newPassword: formData.newPassword,
            name: formData.name || userDetails?.name,
            profileImage: profileImageUrl,
          }
        : {
            email: userDetails?.email,
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
            name: formData.name || userDetails?.name,
            profileImage: profileImageUrl,
          };

      const res = await API.post("/update-profile", payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res) return console.log(res);

      toast.success("Profile updated successfully.");
      await fetchUserDetails(); // Refresh user details in the context
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <>
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className=" bg-white text-black shadow-lg py-2 px-4 rounded hover:text-white hover:bg-black my-4 "
        >
          <CgChevronLeftO className="text-2xl" />
        </button>

        <div className="flex rounded-lg min-h-screen justify-center items-center  bg-gray-100">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Update Profile
            </h1>

            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <img
                src={
                  userDetails?.profileImage ||
                  "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"
                }
                alt="Profile"
                className=" w-16 h-16 md:w-24 md:h-24 rounded-full shadow-md border-2 border-blue-500"
              />
            </div>

            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {!userDetails?.isGoogleUser && (
              <input
                type="password"
                placeholder="Old Password"
                value={formData.oldPassword}
                onChange={(e) =>
                  setFormData({ ...formData, oldPassword: e.target.value })
                }
                className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
            <input
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, profileImage: e.target.files[0] })
              }
              className="w-full mb-4"
            />
            <div className="w-full flex items-center justify-center mt-4">
              <button
                onClick={handleUpdateProfile}
                className=" bg-blue-500 shadow-lg text-gray-100 px-4 py-2 rounded-full text-base font-semibold hover:bg-blue-600 hover:shadow-none"
                disabled={
                  !formData.newPassword &&
                  !formData.name &&
                  !formData.profileImage &&
                  !userDetails?.isGoogleUser &&
                  !formData.oldPassword
                }
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProfile;
