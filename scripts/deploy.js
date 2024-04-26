// Importing the hardhat library
const hre = require("hardhat");

// Function to convert a value to tokens
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploying the RealEstateToken contract
  const RealEstateToken = await ethers.getContractFactory('RealEstateToken')
  // Creating an instance of the RealEstateToken contract
  const realEstateToken = await RealEstateToken.deploy()
  // Waiting for the deployment transaction to be confirmed on the blockchain
  await realEstateToken.deployed()

  // Logging to the console
  console.log(`Deployed Real Estate Contract at: ${realEstateToken.address}`)
  console.log(`Minting 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    // Minting 6 properties and storing the transaction
    const transaction = await realEstateToken.connect(seller).mint(`https://bafybeifumen4n5n3krqvqhxafket63ndxnxt2folzeiwmkhyfdzfprlwjy.ipfs.nftstorage.link/${i + 1}.json`)
    await transaction.wait()
  }

  // Deploying the Escrow contract
  const Escrow = await ethers.getContractFactory('Escrow')
  // Creating an instance of the Escrow contract with the specified parameters
  const escrow = await Escrow.deploy(
    realEstateToken.address, // Address of the deployed RealEstateToken contract
    seller.address, // Address of the seller's account
    inspector.address, // Address of the inspector's account
    lender.address // Address of the lender's account
  )
  // Waiting for the deployment transaction to be confirmed on the blockchain
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 6 properties...\n`)

  for (let i = 0; i < 6; i++) {
    // Approve properties for escrow
    let transaction = await realEstateToken.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // Listing 6 properties in the Escrow contract with different values
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(200), tokens(100))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(150), tokens(50))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(100), tokens(50))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(4, buyer.address, tokens(180), tokens(100))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(5, buyer.address, tokens(250), tokens(150))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(6, buyer.address, tokens(300), tokens(150))
  await transaction.wait()

  console.log(`Finished.`)
}

// Call the `main` function and handle any errors that occur.
main().catch((error) => {
  console.error(error);
  // Set the exit code to 1 to indicate an error occurred.
  process.exitCode = 1;
});
