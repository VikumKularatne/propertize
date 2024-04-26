// Import the necessary modules and assets
import { ethers } from 'ethers'; // Importing the ethers library for interacting with Ethereum
import logo from '../assets/Logo.png';

// Navigation component that displays the navigation bar
const Navigation = ({ account, setAccount }) => {
    // Function to handle the connection of the user's Ethereum account
    const connectHandler = async () => {
        // Request the user's Ethereum accounts using the Ethereum provider injected by the browser
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
         // Get the Ethereum address from the accounts array
        const account = ethers.utils.getAddress(accounts[0])
         // Set the connected account using the provided setter function
        setAccount(account);
    }

    // JSX code representing the navigation bar
    return (
        <nav>
            {/* Brand section */}
            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>PROPERTIZE</h1>
            </div>

            {/* Navigation links */}
            <ul className='nav__links'>
                <li><b><a href="#">Home</a></b></li>
                <li><b><a href="#">Properties</a></b></li>
                <li><b><a href="#">Contact Us</a></b></li>
                <li><b><a href="#">Sign Up</a></b></li>
            </ul>

            {/* Connect button */}
            {account ? (
                // Display account details if an account is connected
                <button
                    type="button"
                    className='nav__connect'
                >
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                 // Display connect button if no account is connected
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;