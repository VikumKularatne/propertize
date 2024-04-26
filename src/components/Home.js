// Importing the ethers library for interacting with Ethereum
import { ethers } from 'ethers';
// Importing React hooks for managing component state
import { useEffect, useState } from 'react';

// Importing the close SVG image
import close from '../assets/close.svg';


const Home = ({ home, provider, account, escrow, togglePop }) => {
    // State variable for tracking if the home has been bought, lent, inspected and sold
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    // State variable for storing the buyer, lender, inspector and seller addresses
    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    // State variable for storing the owner's address
    const [owner, setOwner] = useState(null)

    // Fetching details about the transaction and participants
    const fetchDetails = async () => {
        // -- Buyer

        const buyer = await escrow.buyer(home.id) // Getting the buyer's address for the home
        setBuyer(buyer) // Setting the buyer's address in state

        // Checking if the buyer has approved the transaction
        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought) // Setting the approval status in state

        // -- Seller

        const seller = await escrow.seller() // Getting the seller's address
        setSeller(seller) // Setting the seller's address in state

        // Checking if the seller has approved the transaction
        const hasSold = await escrow.approval(home.id, seller)
        setHasSold(hasSold) // Setting the approval status in state

        // -- Lender

        const lender = await escrow.lender() // Getting the lender's address
        setLender(lender) // Setting the lender's address in state

        // Checking if the lender has approved the transaction
        const hasLended = await escrow.approval(home.id, lender)
        setHasLended(hasLended) // Setting the approval status in state

        // -- Inspector

        const inspector = await escrow.inspector() // Getting the inspector's address
        setInspector(inspector) // Setting the inspector's address in state

        // Checking if the home has passed inspection
        const hasInspected = await escrow.inspectionPassed(home.id)
        setHasInspected(hasInspected) // Setting the inspection status in state
    }

    const fetchOwner = async () => {
        // If the home is still listed for sale, return
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id) // Getting the current owner's address
        setOwner(owner) // Setting the owner's address in state
    }

    const buyHandler = async () => {
        // Getting the escrow amount for the home
        const escrowAmount = await escrow.escrowAmount(home.id) 
        // Get the signer from the provider
        const signer = await provider.getSigner()

        // Buyer deposit earnest
        // Initiating a transaction to deposit earnest money
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        // Buyer approves
        // Initiating a transaction for the buyer to approve the sale
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        // Updating the state to indicate that the home has been bought
        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner() // Getting the current user's signer

        // Inspector updates status
        // Initiating a transaction for the inspector to update the inspection status
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        setHasInspected(true) // Updating the state to indicate that the home has been inspected
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner() // Getting the current user's signer

        // Lender approves
        // Initiating a transaction for the lender to approve the sale
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        // Lender sends funds to contract
        // Calculating the amount to be lent by the lender
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        // Sending the funds to the escrow contract
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true) // Updating the state to indicate that the lender has lent funds
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner() // Getting the current user's signer

        // Seller approves
        // Initiating a transaction for the seller to approve the sale
        let transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        // Seller finalize
        // Initiating a transaction for the seller to finalize the sale
        transaction = await escrow.connect(signer).finalizeSale(home.id)
        await transaction.wait() // Waiting for the transaction to be confirmed on the blockchain

        setHasSold(true) // Updating the state to indicate that the home has been sold
    }

    useEffect(() => {
        fetchDetails() // Fetching transaction details and participant addresses
        fetchOwner() // Fetching the current owner of the home
    }, [hasSold]) // Running the effects when the 'hasSold' state changes

    return (
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" /> {/* Displaying the home image */}
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1> {/* Displaying the home name */}
                    <p> {/* Displaying the number of bedrooms, bathrooms, and square footage */}
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    {/*} Displaying the home price in ETH */}
                    <h2>{home.attributes[0].value} ETH</h2> 

                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {(account === inspector) ? (
                                // Displaying a button to approve the inspection
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (account === lender) ? (
                                // Displaying a button to approve and lend funds
                                <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            ) : (account === seller) ? (
                                // Displaying a button to approve and sell the home
                                <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                // Displaying a button to buy the home
                                <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}

                            {/* Displaying a button to contact the agent */}
                            <button className='home__contact'>
                                Contact agent
                            </button>
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            // Displaying each attribute with its value
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>


                <button onClick={togglePop} className="home__close">
                    {/* Displaying a close button with an SVG image */}
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
    );
}

export default Home;