"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@contracts/auth";
import { mutate } from "swr";
import { isPasswordValid } from "@/lib/password";
import { PasswordRequirements } from "@/components/PasswordRequirements";

interface Props {
  user: AuthUser;
}

const inputClass = "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full";
const labelClass = "text-sm text-gray-500 mb-1 block";
const editBtnClass = "text-sm text-[#ff4102] hover:underline cursor-pointer";
const saveBtnClass = "cursor-pointer font-bold px-6 h-[40px] rounded-[38px] text-white border border-[#ff4102] bg-[#ff4102] shadow-md hover:bg-white hover:text-[#ff4102] transition duration-300 disabled:cursor-not-allowed disabled:opacity-50";
const cancelBtnClass = "cursor-pointer text-sm text-gray-500 hover:text-black transition duration-200";

export function ProfileForm({ user }: Props) {
  const router = useRouter();

  // Personal info
  const [editingInfo, setEditingInfo] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [infoError, setInfoError] = useState("");
  const [infoSuccess, setInfoSuccess] = useState("");

  // Email
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // Password
  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisibleCurrent, setIsVisibleCurrent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleSaveInfo = async () => {
    setInfoError("");
    setInfoSuccess("");

    if (firstName && firstName.trim().length < 2) {
      setInfoError("First name must be at least 2 characters");
      return;
    }
    if (lastName && lastName.trim().length < 2) {
      setInfoError("Last name must be at least 2 characters");
      return;
    }

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: firstName.trim() || null, lastName: lastName.trim() || null }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setInfoError(data.message || "Something went wrong");
      return;
    }

    await mutate("/api/auth/users");
    router.refresh();
    setInfoSuccess("Saved");
    setEditingInfo(false);
  };

  const handleSaveEmail = async () => {
    setEmailError("");
    setEmailSuccess("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }

    const res = await fetch("/api/profile/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEmailError(data.message || "Something went wrong");
      return;
    }

    setEmailSuccess("Confirmation email sent. Check your inbox.");
    setNewEmail("");
    setEditingEmail(false);
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Enter your current password");
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setPasswordError("New password does not meet requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPasswordError(data.message || "Something went wrong");
      return;
    }

    setPasswordSuccess("Password updated");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditingPassword(false);
  };

  return (
    <div className="space-y-6">

      {/* Personal info */}
      <section className="p-6 rounded-lg border border-[#dfdbd8] bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Personal info</h2>
          {!editingInfo && (
            <button className={editBtnClass} onClick={() => { setEditingInfo(true); setInfoError(""); setInfoSuccess(""); }}>
              Edit
            </button>
          )}
        </div>

        {!editingInfo ? (
          <div className="space-y-4">
            <div>
              <p className={labelClass}>First name</p>
              <p className="font-medium">{user.firstName || <span className="text-gray-400">—</span>}</p>
            </div>
            <div>
              <p className={labelClass}>Last name</p>
              <p className="font-medium">{user.lastName || <span className="text-gray-400">—</span>}</p>
            </div>
            {infoSuccess && <p className="text-green-600 text-sm">{infoSuccess}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="firstName">First name</label>
                <input className={inputClass} id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus />
              </div>
              <div>
                <label className={labelClass} htmlFor="lastName">Last name</label>
                <input className={inputClass} id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            {infoError && <p className="text-red-500 text-sm">{infoError}</p>}
            <div className="flex items-center gap-4">
              <button className={saveBtnClass} onClick={handleSaveInfo}>Save</button>
              <button className={cancelBtnClass} onClick={() => { setEditingInfo(false); setFirstName(user.firstName ?? ""); setLastName(user.lastName ?? ""); setInfoError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Email */}
      <section className="p-6 rounded-lg border border-[#dfdbd8] bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Email</h2>
          {!editingEmail && (
            <button className={editBtnClass} onClick={() => { setEditingEmail(true); setEmailError(""); setEmailSuccess(""); }}>
              Change
            </button>
          )}
        </div>

        {!editingEmail ? (
          <div>
            <p className="font-medium">{user.email}</p>
            {emailSuccess && <p className="text-green-600 text-sm mt-2">{emailSuccess}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Current: <span className="font-medium text-black">{user.email}</span></p>
            <div>
              <label className={labelClass} htmlFor="newEmail">New email</label>
              <input className={inputClass} id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} autoFocus />
            </div>
            <p className="text-xs text-gray-400">A confirmation link will be sent to the new email address.</p>
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
            <div className="flex items-center gap-4">
              <button className={saveBtnClass} disabled={!newEmail} onClick={handleSaveEmail}>Send confirmation</button>
              <button className={cancelBtnClass} onClick={() => { setEditingEmail(false); setNewEmail(""); setEmailError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Password */}
      <section className="p-6 rounded-lg border border-[#dfdbd8] bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Password</h2>
          {!editingPassword && (
            <button className={editBtnClass} onClick={() => { setEditingPassword(true); setPasswordError(""); setPasswordSuccess(""); }}>
              Change
            </button>
          )}
        </div>

        {!editingPassword ? (
          <div>
            <p className="font-medium tracking-widest text-gray-400">••••••••</p>
            {passwordSuccess && <p className="text-green-600 text-sm mt-2">{passwordSuccess}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <label className={labelClass} htmlFor="currentPassword">Current password</label>
              <input className={inputClass} id="currentPassword" type={isVisibleCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoFocus />
              <span
                className={`block absolute cursor-pointer right-2 top-[29px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px] ${isVisibleCurrent ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
                onClick={() => setIsVisibleCurrent(!isVisibleCurrent)}
              />
            </div>
            <div className="relative">
              <label className={labelClass} htmlFor="newPassword">New password</label>
              <input
                className={inputClass}
                id="newPassword"
                type={isVisible ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className={`block absolute cursor-pointer right-2 top-[29px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px] ${isVisible ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
                onClick={() => setIsVisible(!isVisible)}
              />
              <PasswordRequirements password={newPassword} />
            </div>
            <div className="relative">
              <label className={labelClass} htmlFor="confirmPassword">Confirm new password</label>
              <input
                className={inputClass}
                id="confirmPassword"
                type={isVisibleConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                className={`block absolute cursor-pointer right-2 top-[29px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px] ${isVisibleConfirm ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
                onClick={() => setIsVisibleConfirm(!isVisibleConfirm)}
              />
            </div>
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <div className="flex items-center gap-4">
              <button
                className={saveBtnClass}
                disabled={!currentPassword || !isPasswordValid(newPassword) || newPassword !== confirmPassword}
                onClick={handleSavePassword}
              >
                Update password
              </button>
              <button className={cancelBtnClass} onClick={() => { setEditingPassword(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}