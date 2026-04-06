import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import "./navbar.scss";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <nav className={scrolled ? "scrolled" : ""}>
      <div className="left">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Logo" />
          <span>majkelovsky</span>
        </Link>
        <Link to="/">Home</Link>
        <Link to="/listings">Browse</Link>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>

      <div className="right">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="navBtn">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="navBtn register">Sign Up</button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <div className="user">
            <Link to="/profile" className="profile">
              <span>Profile</span>
            </Link>
            <UserButton />
          </div>
        </SignedIn>

        <div className="menuicon">
          <img
            src="/menu.png"
            alt="Menu"
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>

        <div className={open ? "menu active" : "menu"}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/listings" onClick={closeMenu}>Browse</Link>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="navBtn" onClick={closeMenu}>Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="navBtn" onClick={closeMenu}>Sign Up</button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
