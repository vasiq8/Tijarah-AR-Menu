import { useState, useRef, useEffect } from 'react';
import './app.css';

// Navbar images (served from public/assets)
import strikeImg from './assets/strike.jpeg';
import searchImg from './assets/search.jpeg';

// Food Gallery images
import pizzaImg    from './assets/pizza.jpeg';
import sandwichImg from './assets/sandwich.jpeg';
import onigiriImg  from './assets/onigiri.jpeg';
import burgerImg   from './assets/burger.jpeg';
import fishImg     from './assets/fish.jpeg';
import noodlesImg  from './assets/noodles.jpeg';
import ricebowlImg from './assets/ricebowl.jpeg';
import saladImg    from './assets/salad.jpeg';
import shawarmaImg from './assets/shawarma.jpeg';

function App() {
  // Navbar + search/menu
  const [searchOpen, setSearchOpen]   = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Product‑modal state
  const [currentCategoryProducts, setCurrentCategoryProducts] = useState([]);
  const [productIndex, setProductIndex]                       = useState(0);
  const [animClass, setAnimClass]                             = useState("");

  // Refs for click‑outside & AR
  const searchRef = useRef(null);
  const menuRef   = useRef(null);
  const arModelRef = useRef(null);

  // API data state
  const [apiProducts, setApiProducts] = useState({});
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add selected category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://qa-k8s.tisostudio.com/menu?locationRef=67a396bc0e2b3511b0396447&companyRef=67a395910e2b3511b0396281&activeTab=active&page=0&limit=500&sort=desc&orderType=pickup&_q=&online=false');
      const data = await response.json();
      
      if (!data) {
        console.error('No data in API response');
        return;
      }

      // Process products by category
      const productsByCategory = {};
      
      // Group products by category
      (data.results || []).forEach(product => {
        const categoryName = product.category?.name;
        if (categoryName) {
          if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = [];
          }

          // Get price from variants for specific location
          let price = '';
          if (product.variants && product.variants.length > 0) {
            const locationPrice = product.variants[0].prices.find(
              p => p.locationRef === "6776b529b1e5f59c624c9326"
            );
            price = locationPrice ? `${product.currency} ${locationPrice.price}` : '';
          }

          // Create product object in the same format as product details modal
          productsByCategory[categoryName].push({
            name: product.name.en || '',
            description: product.description || '',
            price: price,
            calories: product.nutritionalInformation?.calorieCount 
              ? `${product.nutritionalInformation.calorieCount} kcal` 
              : '',
            image: product.image || '',
            modelUrl: product.glbFileUrl || '', // Use glbFileUrl for AR model
          });
        }
      });

      console.log('Processed categories:', Object.keys(productsByCategory));
      setApiProducts(productsByCategory);
      setCompanyName(data.company?.name || "");
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Flatten all products for search lookup
  const allProducts = Object.values(apiProducts).flat();

  // Fetch data on component mount
  useEffect(() => {
    fetchMenuData();
  }, []);

  // Add effect to select first category after data loads
  useEffect(() => {
    if (!isLoading && Object.keys(apiProducts).length > 0) {
      const firstCategory = Object.keys(apiProducts)[0];
      setSelectedCategory(firstCategory);
      handleCategoryClick(firstCategory);
    }
  }, [isLoading, apiProducts]);

  // Hide dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = e => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle handlers
  const toggleSearch = () => {
    setSearchOpen(o => !o);
    if (menuOpen) setMenuOpen(false);
    // Fetch data if opening search for first time
    if (!searchOpen && Object.keys(apiProducts).length === 0) {
      fetchMenuData();
    }
    if (!searchOpen) setTimeout(() => document.querySelector(".search-input")?.focus(), 100);
  };

  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    // Fetch data if opening menu for first time
    if (newMenuState && Object.keys(apiProducts).length === 0) {
      fetchMenuData();
    }
    if (searchOpen) setSearchOpen(false);
  };

  // Update category click handler
  const handleCategoryClick = category => {
    setSelectedCategory(category);
    console.log('Available products:', apiProducts[category]);
  };

  // Search submit (on Enter)
  const handleSearchSubmit = e => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const found = allProducts.find(p => p.name.toLowerCase().includes(q));
    if (found) {
      setCurrentCategoryProducts([found]);
      setProductIndex(0);
      setSearchOpen(false);
    } else {
      alert("No product found. Try another name.");
    }
  };

  // Update search handler to show live results
  const handleSearchChange = e => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Search through all products
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 results for preview

    setSearchResults(results);
  };

  // Carousel arrows
  const handleNextProduct = () => {
    if (currentCategoryProducts.length < 2) return;
    setAnimClass("slide-out-left");
    setTimeout(() => {
      setProductIndex(i => (i + 1) % currentCategoryProducts.length);
      setAnimClass("slide-in-right");
    }, 300);
    setTimeout(() => setAnimClass(""), 600);
  };
  const handlePrevProduct = () => {
    if (currentCategoryProducts.length < 2) return;
    setAnimClass("slide-out-right");
    setTimeout(() => {
      setProductIndex(i =>
        (i - 1 + currentCategoryProducts.length) % currentCategoryProducts.length
      );
      setAnimClass("slide-in-left");
    }, 300);
    setTimeout(() => setAnimClass(""), 600);
  };

  // Currently selected
  const selectedProduct =
    currentCategoryProducts.length > 0
      ? currentCategoryProducts[productIndex]
      : null;

  // Activate AR
  const viewInAR = (index, modelUrl) => {
    if (!modelUrl) {
      alert("No AR model available for this product");
      return;
    }

    // Try to find the specific model viewer
    const modelViewer = document.querySelector('model-viewer');
    if (modelViewer?.activateAR) {
      modelViewer.src = modelUrl;  // Set the source URL before activating AR
      modelViewer.activateAR();
    } else {
      alert("AR not supported on this device/browser.");
    }
  };

  const menuCategories = Object.keys(apiProducts);

  return (
    <div className="app">
      {/* Navbar */}
      <header className={`navbar ${searchOpen ? "search-active" : ""}`}>
        <h1 className="logo">TISO MEALS</h1>
      </header>
      <div className="search-icon-wrapper">
        <img
          src={searchImg}
          alt="Search"
          className="icon search-icon"
          onClick={toggleSearch}
        />
      </div>

      {/* Blur overlay */}
      {(menuOpen || searchOpen || selectedProduct) && (
        <div
          className="blur-overlay"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
        />
      )}

      {/* Main Content */}
      <div className="main-layout">
        {/* Categories Container */}
        <div className="categories-sidebar">
          {Object.keys(apiProducts).map((category, i) => (
            <div
              key={i}
              className={`category-box ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </div>
          ))}
        </div>

        {/* Products Grid */}
        {selectedCategory && (
          <div className="products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', // increased from default
            gap: '20px',
            padding: '20px'
          }}>
            {apiProducts[selectedCategory]?.map((product, index) => (
              <div key={index} className="product-card" style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                minHeight: '300px', // set minimum height
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p> {product.price}</p>
                <p>Calories: {product.calories}</p>
                <img 
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  style={{
                    width: "100%",
                    height: "150px", // increased from 100px
                    objectFit: "cover",
                    marginTop: "2px",
                    marginBottom: "2px"
                  }}
                />
                <button 
                  className="ar-button" 
                  onClick={() => viewInAR(index, product.modelUrl)}
                  style={{
                    padding: '5px 10px', // smaller padding
                    fontSize: '0.9rem', // smaller font
                    width: 'auto', // auto width instead of full width
                    alignSelf: 'center' // center the button
                  }}
                >
                  View in AR
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu dropdown */}
      {menuOpen && (
        <div className="menu-dropdown" ref={menuRef}>
          <div className="menu-header">
            <button className="menu-close" onClick={() => setMenuOpen(false)}>
              ×
            </button>
            <div className="menu-title">{companyName || "TISO MEALS"}</div>
            <img
              src={searchImg}
              alt="Search"
              className="icon small-icon"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
            />
          </div>
          <div className="menu-categories" style={{ height: 'calc(100vh - 385px)', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="menu-category">Loading categories...</div>
            ) : Object.keys(apiProducts).length > 0 ? (
              Object.keys(apiProducts).map((category, index) => (
                <div
                  key={index}
                  className="menu-category"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                  <span className="item-count">
                    ({apiProducts[category]?.length || 0})
                  </span>
                </div>
              ))
            ) : (
              <div className="menu-category">No categories found</div>
            )}
          </div>
        </div>
      )}

      {/* Search dropdown */}
      {searchOpen && (
        <div className="search-dropdown" ref={searchRef}>
          <div className="search-header">
            <div
              className="search-hamburger"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen(true);
              }}>
              ≡
            </div>
            <div className="search-title">SEARCH</div>
            <button className="search-close" onClick={() => setSearchOpen(false)}>
              ×
            </button>
          </div>
          <form className="search-input-container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchResults.length > 0 && (
              <div className="search-results-preview">
                {searchResults.map((product, index) => (
                  <div 
                    key={index} 
                    className="search-result-item"
                    onClick={() => {
                      setCurrentCategoryProducts([product]);
                      setProductIndex(0);
                      setSearchOpen(false);
                    }}
                  >
                    <h4>{product.name}</h4>
                    <p>{product.price}</p>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="product-details">
          <button
            className="close-product"
            onClick={() => setCurrentCategoryProducts([])}>
            ×
          </button>

          {currentCategoryProducts.length > 1 && (
            <>
              <button className="arrow-button left" onClick={handlePrevProduct}>
                ←
              </button>
              <button className="arrow-button right" onClick={handleNextProduct}>
                →
              </button>
            </>
          )}

          <div className={`product-details-content ${animClass}`}>
            <img
              className="product-image"
            />
            <div className="product-info">
              <h2>{selectedProduct.name || 'Unnamed Product'}</h2>
              <p>{selectedProduct.description || 'Description not available'}</p>
              <p>Price: {selectedProduct.price || 'Price not available'}</p>
              <p>Calories: {selectedProduct.calories || 'Calories not available'}</p>
            </div>

            <div className="ar-preview">
              <model-viewer
                ref={arModelRef}
                src={selectedProduct?.modelUrl || ''}
                alt={`${selectedProduct?.name || 'Product'} AR Model`}
                camera-controls
                auto-rotate
                ar
                ar-modes="scene-viewer webxr quick-look"
                ar-scale="fixed"
                style={{
                  width: "100%",
                  maxWidth: "59%",
                  height: "300px",
                  margin: "0 auto",
                }}
              />
            </div>
            <button 
              className="ar-button" 
              onClick={() => viewInAR(productIndex, selectedProduct?.modelUrl)}
              disabled={!selectedProduct?.modelUrl}
            >
              {selectedProduct?.modelUrl ? 'View in AR' : 'No AR Available'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
