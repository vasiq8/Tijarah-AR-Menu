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
  // Add categoryImages state
  const [categoryImages, setCategoryImages] = useState({});

  // Add selected category state
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Add state for desktop modal
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  // Add device detection
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Add locationRef state
  const [locationRef, setLocationRef] = useState("");

  // Add state for description modal
  const [showDescription, setShowDescription] = useState(null);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = 'https://qa-k8s.tisostudio.com/menu-management/menu/?_q=&orderType=pickup&locationRef=67a396bc0e2b3511b0396447&companyRef=67a395910e2b3511b0396281';
      
      // Extract locationRef from URL
      const urlParams = new URL(apiUrl).searchParams;
      const extractedLocationRef = urlParams.get('locationRef');
      setLocationRef(extractedLocationRef);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!data || !data.results) {
        console.error('No data in API response');
        return;
      }

      // Process products by category
      const productsByCategory = {};
      const categoryImagesMap = {};

      // Create a map of category names and images
      const categoryMap = data.results.categories.reduce((acc, cat) => {
        acc[cat.categoryRef] = cat.name.en;
        // Save image (may be undefined)
        categoryImagesMap[cat.name.en] = cat.image || "";
        return acc;
      }, {});
      
      // Group products by category
      (data.results.products || []).forEach(product => {
        const categoryName = categoryMap[product.categoryRef];
        if (categoryName) {
          if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = [];
          }

          // Find the price from variants
          let price = '';
          if (product.variants && product.variants.length > 0) {
            const variant = product.variants[0];
            const matchingPrice = variant.prices.find(p => p.locationRef === extractedLocationRef);
            if (matchingPrice) {
              price = `${product.currency} ${matchingPrice.price}`;
            }
          }

          productsByCategory[categoryName].push({
            name: product.name.en || '',
            description: product.description || '',
            price: price,
            calories: product.nutritionalInformation?.calorieCount 
              ? `${product.nutritionalInformation.calorieCount} kcal` 
              : '',
            image: product.image || '',
            modelUrl: product.glbFileUrl || '',
          });
        }
      });

      console.log('Processed categories:', Object.keys(productsByCategory));
      setApiProducts(productsByCategory);
      setCategoryImages(categoryImagesMap);
      setCompanyName(data.results.company?.name || "");
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

  // Modify viewInAR function
  const viewInAR = (index, modelUrl, product) => {
    if (!modelUrl) {
      alert("No AR model available for this product");
      return;
    }

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      // Open modal and auto-launch AR
      setShowDesktopModal(true);
      setCurrentCategoryProducts([product]);
      setProductIndex(0);

      // Programmatically activate AR after modal mounts
      setTimeout(() => {
        if (arModelRef.current?.activateAR) {
          arModelRef.current.activateAR();
        } else if (arModelRef.current?.enterAR) {
          arModelRef.current.enterAR();
        }
      }, 200);
      return;
    }

    if (isAndroid) {
      // Keep existing Android Scene Viewer launch
      const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`;
      window.location.href = sceneViewerUrl;
      return;
    }

    // Desktop behavior remains unchanged
    setShowDesktopModal(true);
    setCurrentCategoryProducts([product]);
    setProductIndex(0);
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
              style={{ position: 'relative' }}
            >
              <div className="text-wrapper">
                {category}
              </div>
              {/* Category image at bottom right */}
              {categoryImages[category] && (
                <img
                  src={categoryImages[category]}
                  alt={`${category} icon`}
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    objectFit: 'cover',
                    background: '#fff',
                    border: '1px solid #ccc',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Products Grid */}
        {selectedCategory && (
          <div className="products-grid">
            {apiProducts[selectedCategory]?.map((product, index) => (
              <div key={index} className="product-card" style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '15px',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                background: '#222326'
              }}>
                <img 
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  style={{
                    width: "89.6px",
                    height: "89.6px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "8px solid #000",
                    background: "#fff",
                    marginTop: "2px",
                    marginBottom: "10px",
                    alignSelf: 'center'
                  }}
                />
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <h3 style={{ color: '#fff', marginBottom: '5px' }}>{product.name}</h3>
                  <p style={{ color: '#fff', marginBottom: '5px' }}>{product.price}</p>
                  <p style={{ color: '#fff', marginBottom: '5px' }}>Calories: {product.calories}</p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignSelf: 'flex-end',
                  marginTop: 'auto' 
                }}>
                  <button
                    className="info-button"
                    onClick={() => setShowDescription(product)}
                  >
                    Info
                  </button>
                  <button
                    className="ar-button"
                    onClick={() => viewInAR(index, product.modelUrl, product)}
                  >
                    AR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description Modal */}
        {showDescription && (
          <div className="description-modal" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxWidth: '90%',
            width: '400px'
          }}>
            <button 
              onClick={() => setShowDescription(null)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h3>{showDescription.name}</h3>
            <p style={{ marginTop: '15px' }}>{showDescription.description}</p>
          </div>
        )}

        {/* Add overlay when description modal is open */}
        {showDescription && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
            onClick={() => setShowDescription(null)}
          />
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
              onClick={() => viewInAR(productIndex, selectedProduct?.modelUrl, selectedProduct)}
              disabled={!selectedProduct?.modelUrl}
            >
              {selectedProduct?.modelUrl ? 'View in AR' : 'No AR Available'}
            </button>
          </div>
        </div>
      )}

      {/* Add Desktop Modal */}
      {showDesktopModal && (
        <div className="ar-modal desktop">
          <button 
            className="close-ar"
            onClick={() => {
              setShowDesktopModal(false);
              setCurrentCategoryProducts([]); // Clear the selected product
            }}
          >
            ×
          </button>
          <div className="desktop-ar-content">
            <h2>{selectedProduct?.name}</h2>
            <div className="model-viewer-container">
              <model-viewer
                ref={arModelRef}
                src={selectedProduct?.modelUrl}
                alt={selectedProduct?.name}
                camera-controls
                auto-rotate
                ar
                ar-modes="scene-viewer quick-look webxr"
                ar-scale="fixed"
                shadow-intensity="1"
                exposure="1"
                style={{
                  width: "400px",
                  height: "400px",
                  margin: "20px auto",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;