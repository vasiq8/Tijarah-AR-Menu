import { useState, useRef, useEffect } from 'react';
import './app.css';

// Navbar images (served from public/assets)

import searchImg from './assets/searchbutton.png';

// AR Icon
import arIcon from './assets/AR icon.png';
import arUnavailableIcon from './assets/AR unavailable.png'; // <-- Add this line

// Add white background image import
import whiteBg from './assets/white background.png';

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

  // Add screenWidth state
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add effect to handle screen width changes
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle handlers
  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    // Fetch data if opening menu for first time
    if (newMenuState && Object.keys(apiProducts).length === 0) {
      fetchMenuData();
    }
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
      {/* White background image at top left */}
      <img
        src={whiteBg}
        alt="white background"
        style={{
          position: 'absolute',
          top: '10px',
          left: '5px',
          zIndex: 0,
          width: '115px', // Reduced size
          height: '115px', // Reduced size
          pointerEvents: 'none'
        }}
      />
      <header className="navbar navbar-nobox">
        <h1 className="logo">{companyName || "TISO MEALS"}</h1>
      </header>

      {/* Search Bar with Inline Results */}
      <div
        style={{
          position: 'fixed',
          top: screenWidth <= 600 ? '100px' : '140px',
          left: screenWidth <= 600 ? '123px' : '195px',
          width: screenWidth <= 440 ? '180px' : '276px', // Increased width for all screens
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          zIndex: 6,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            margin: '0 auto'
          }}
        >
          <img
            src={searchImg}
            alt="Search"
            style={{
              width: 22,
              height: 22,
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: 0.5,
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 18,
              border: 'none',
              background: '#fff',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              padding: '0 16px 0 44px',
              fontSize: '1.08rem',
              outline: 'none',
              color: '#222',
              fontFamily: 'inherit'
            }}
          />
          {/* Update search results UI */}
          {searchResults.length > 0 && searchQuery && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              borderRadius: '12px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 10
            }}>
              {searchResults.map((product, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentCategoryProducts([product]);
                    setProductIndex(0);
                    setSearchQuery(''); // Clear search
                    setSearchResults([]); // Clear results
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index !== searchResults.length - 1 ? '1px solid #eee' : 'none',
                    ':hover': { background: '#f5f5f5' }
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {product.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-layout" style={{ marginTop: '140px' }}>
        {/* Categories Container */}
        <div className="categories-sidebar">
          {Object.keys(apiProducts).map((category, i) => (
            <div
              key={i}
              className={`category-box ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div className="text-wrapper" style={{ fontSize: '0.83rem', fontWeight: 600 }}>
                {category}
              </div>
              {/* Category image at bottom right, cut 10% outside the box, reduced size */}
              {categoryImages[category] && (
                <img
                  src={categoryImages[category]}
                  alt={`${category} icon`}
                  style={{
                    position: 'absolute',
                    right: '-10%',
                    bottom: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    background: '#fff',
                    border: 'none',
                    boxShadow: 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Products Grid */}
        {selectedCategory && (
          <div className="products-grid" style={{ background: '#fff' }}>
            {apiProducts[selectedCategory]?.map((product, index) => (
              <div
                key={index}
                className="product-card"
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: '15px',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  background: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'none'
                }}
                onClick={() => setShowDescription(product)} // open description modal on card click
              >
                {/* Bottom overlay, now covers 75% and is thick grey with rounded top corners */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '75%',
                    background: '#888',
                    zIndex: 0,
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px',
                  }}
                />
                <img 
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  style={{
                    width: "98.56px",
                    height: "98.56px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "2.6px solid #000",
                    background: "#fff",
                    marginTop: "2px",
                    marginBottom: "10px",
                    alignSelf: 'center',
                    zIndex: 1,
                    position: 'relative'
                  }}
                />
                <div style={{ textAlign: 'left', width: '100%', zIndex: 1, position: 'relative', marginTop: '0px' }}>
                  <h3
                    style={{
                      color: '#fff',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ width: '50%' }}>
                      <p style={{
                        color: '#fff',
                        marginBottom: 0,
                        fontSize: '0.76rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.price}
                      </p>
                      <p style={{
                        color: '#fff',
                        marginBottom: 0,
                        fontSize: '0.76rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {product.calories}
                      </p>
                    </div>
                    <div style={{
                      width: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        className="ar-button"
                        onClick={e => {
                          e.stopPropagation();
                          product.modelUrl && viewInAR(index, product.modelUrl, product);
                        }}
                        style={{
                          background: 'none',
                          padding: 0,
                          border: 'none',
                          minWidth: 0,
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '8px',
                          boxShadow: 'none'
                        }}
                        disabled={!product.modelUrl}
                      >
                        <img
                          src={product.modelUrl ? arIcon : arUnavailableIcon}
                          alt={product.modelUrl ? "AR" : "AR Unavailable"}
                          style={{
                            width: '17px',
                            height: '17px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignSelf: 'flex-end',
                    marginTop: 'auto',
                    marginBottom: '8px',
                    zIndex: 1,
                    position: 'relative'
                  }}
                  onClick={e => e.stopPropagation()} // prevent modal from opening when clicking AR button
                >
                  {/* Info button removed */}
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
            padding: '24px 18px 20px 18px',
            borderRadius: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 1000,
            maxWidth: '98%',
            width: '340px',
            textAlign: 'center'
          }}>
            <button 
              onClick={() => setShowDescription(null)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '14px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, textAlign: 'center' }}>Info</h2>
            <hr style={{
              margin: '14px 0 10px 0',
              border: 0,
              borderTop: '1.2px solid #eee'
            }}/>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, textAlign: 'center' }}>{showDescription.name}</h3>
            <p style={{ marginTop: '14px', fontSize: '0.98rem', color: '#222', textAlign: 'left' }}>{showDescription.description}</p>
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