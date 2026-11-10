import { useState } from "react";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    name: "User",
    username: "User123",
    email: "User@gmail.com",
  });

  return (
    <main className="page profile-page">
      <div className="profile-card">
        <h2>Profil Saya</h2>
        
        <div className="profile-head">
          <div className="avatar" />
          <div className="profile-id">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
          <button className="primary-button profile-edit" onClick={() => setEditing(!editing)}>
            {editing ? "Simpan Profil" : "Edit Profil"}
          </button>
        </div>

        <div className="profile-fields">
          <label>
            Nama Lengkap
            <input
              value={user.name}
              readOnly={!editing}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </label>
          <label>
            Username
            <input
              value={user.username}
              readOnly={!editing}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={user.email}
              readOnly={!editing}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </label>
        </div>
      </div>
    </main>
  );
};

export default Profile;