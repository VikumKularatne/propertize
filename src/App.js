// Importing necessary hooks from React
import { useEffect, useState } from 'react';
// Importing ethers library for Ethereum interactions
import { ethers } from 'ethers';

// Importing the Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// Importing the ABIs (Application Binary Interface) for both contracts
import RealEstateToken from './abis/RealEstateToken.json'
import Escrow from './abis/Escrow.json'

// Importing the config file
import config from './config.json';

function App() {
  // State variable for the web3 provider
  const [provider, setProvider] = useState(null) 
  // State variable for the escrow contract
  const [escrow, setEscrow] = useState(null)

  // State variable for the user's account address
  const [account, setAccount] = useState(null)

  // State variable for the list of homes
  const [homes, setHomes] = useState([])
  // State variable for the selected home
  const [home, setHome] = useState({})
  // State variable for toggling the home details popup
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    // Create a new Web3Provider instance
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider) // Set the provider in the state
    const network = await provider.getNetwork() // Get the current network

    // Create a contract instance for the RealEstateToken
    const realEstateToken = new ethers.Contract(config[network.chainId].realEstateToken.address, RealEstateToken, provider)
    // Get the total supply of tokens
    const totalSupply = await realEstateToken.totalSupply() 
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstateToken.tokenURI(i) // Get the token URI for each token
      const response = await fetch(uri) // Fetch the metadata from the URI
      const metadata = await response.json() // Parse the metadata as JSON
      homes.push(metadata) // Add the metadata to the homes array
    }

    setHomes(homes)  // Set the homes in the state

    // Create a contract instance for the Escrow contract
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow) // Set the escrow contract in the state

    // Listen for account changes
    window.ethereum.on('accountsChanged', async () => { 
      // Get the updated accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      // Get the address of the first account
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account); // Set the account in the state
    })
  }

  useEffect(() => {
    // Load blockchain data when the component mounts
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home) // Set the selected home
    toggle ? setToggle(false) : setToggle(true); // Toggle the popup
  }

  return (
    <div>
      {/* Render the Navigation component */}
      <Navigation account={account} setAccount={setAccount} />
      {/* Render the Search component */}
      <Search /> 

      <div className='cards__section'>

        <h3>Listed Properties</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" /> {/* Display the home image */}
              </div>
              <div className='card__info'>
                {/* Display the home price in ETH */}
                <h4>{home.attributes[0].value} ETH</h4>
                <p> {/* Displaying the number of bedrooms, bathrooms, and square footage */}
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p> {/* Display the home address */}
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && ( // Render the Home component only if the toggle is true
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
