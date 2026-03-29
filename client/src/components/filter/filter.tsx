import './filter.scss'

const Filter: React.FC = () =>{
    return (
        <div className="filter">
            <h1>Serach results for <b>Miami</b></h1>
            <div className="top">
                <div className="item">
                    <label htmlFor="city">Location</label>
                    <input type="text" name="city" id="city" placeholder='City Location'/>
                </div>
            </div>
            <div className="bottom">
                <div className="item">
                    <label htmlFor="type">Type</label>
                    <select name="type" id="type">
                        <option value="">any</option>
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                    </select>
                </div>
                <div className="item">
                    <label htmlFor="propety">Propety</label>
                    <select name="propety" id="propety">
                        <option value="">any</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condo">Condo</option>
                        <option value="land">Land</option>
                    </select>
                </div>
                <div className="item">
                    <label htmlFor="minPrice">Min Price</label>
                    <input type="number" name="minPrice" id="minPrice" min='0' placeholder='any'/>
                </div>
                <div className="item">
                    <label htmlFor="maxPrice">Max Price</label>
                    <input type="number" name="maxPrice" id="maxPrice" min='0' placeholder='any'/>
                </div>
                <div className="item">
                    <label htmlFor="bedroom">Bedroom</label>
                    <input type="number" name="bedroom" id="bedroom" placeholder='anyn'/>
                </div>
                <button><img src="search.png" alt="search" /></button>
            </div>
        </div>
    )
}

export default Filter