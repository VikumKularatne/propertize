// Search component that displays the Search bar
const Search = () => {
    return (
        <header>
            <h2 className="header__title">REAL ESTATE TOKENIZATION MARKETPLACE</h2>
            {/* Render the input field for searching */}
            <input
                type="text"
                className="header__search"
                placeholder="Enter an address, neighborhood, city, or ZIP code"
            />
        </header>
    );
}

export default Search;