import { useState, useRef, useEffect } from 'react';
import './app.css';

// Navbar images (served from public/assets)
import searchImg from './assets/searchbutton.png';

// AR Icon
import arIcon from './assets/AR icon.png';
import arUnavailableIcon from './assets/AR unavailable.png';

// Add white and black background image imports
import whiteBg from './assets/white background.png';
import blackBg from './assets/black background.png';
// Add settings icon import
import settingsIcon from './assets/settings icon.png';
// Add this import for the placeholder image
import placeholderImg from './assets/placeholder.png';

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

  // Add state to highlight a product card after search
  const [highlightedProductName, setHighlightedProductName] = useState(null);

  // Add state for settings modal
  const [showSettings, setShowSettings] = useState(false);

  // ← initialize from localStorage, with dark as default instead of light
  const [theme, setTheme]       = useState(() => localStorage.getItem('theme')    || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  // Add layout state
  const [layout, setLayout]     = useState(() => localStorage.getItem('layout')   || 'layout1');

  // ← add temp states
  const [tempTheme, setTempTheme]       = useState(theme);
  const [tempLanguage, setTempLanguage] = useState(language);
  // Add temp layout state
  const [tempLayout, setTempLayout]     = useState(layout);

  // Add state to hide search bar
  const [hideSearchBar, setHideSearchBar] = useState(false);

  // Apply dark theme to body and .app when selected
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Hide search bar when scrolled to bottom, show when not at bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // If at bottom (allowing 2px tolerance)
      if (windowHeight + scrollY >= docHeight - 2) {
        setHideSearchBar(true);
      } else {
        setHideSearchBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive positions and sizes
  const isMobileScreen = screenWidth <= 600;
  const isSmallMobile = screenWidth <= 440;

  // Responsive styles for whiteBg, settingsIcon, navbar, and search bar
  const whiteBgStyle = {
    position: 'fixed', // changed from 'absolute'
    top: isMobileScreen ? 4 : 10,
    left: isMobileScreen ? 18 : 28,
    zIndex: 20, // increased to stay above content
    width: isSmallMobile ? '70px' : isMobileScreen ? '90px' : '115px',
    height: isSmallMobile ? '70px' : isMobileScreen ? '90px' : '115px',
    pointerEvents: 'none'
  };

  const settingsIconStyle = {
    position: 'fixed', // changed from 'absolute'
    top: isSmallMobile ? '32px' : isMobileScreen ? '44px' : '54px',
    right: isSmallMobile ? '30px' : isMobileScreen ? '38px' : '48px',
    width: isSmallMobile ? '44px' : isMobileScreen ? '52px' : '60px',
    height: isSmallMobile ? '44px' : isMobileScreen ? '52px' : '60px',
    zIndex: 30, // increased to stay above content
    pointerEvents: 'auto'
  };

  const navbarStyle = {
    width: isSmallMobile ? '90%' : isMobileScreen ? '78%' : '340px',
    maxWidth: isSmallMobile ? '90%' : isMobileScreen ? '78%' : '340px',
    top: isSmallMobile ? '18px' : isMobileScreen ? '30px' : '45px',
    left: '50%',
    transform: 'translateX(-50%)',
    position: 'fixed',
    background: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  };

  // Add: compute isRTL for Arabic
  const isRTL = language === 'ar';

  // Update the searchBarContainerStyle to ensure visibility on mobile
  const searchBarContainerStyle = {
    position: 'fixed',
    top: layout === 'layout2' 
      ? (isSmallMobile ? '150px' : isMobileScreen ? '180px' : '200px')
      : (isSmallMobile ? '90px' : isMobileScreen ? '120px' : '140px'),
    left:
      layout === 'layout2'
        ? '40px' // Move search bar right to align with categories bar in layout 2
        : (
          isRTL && isMobileScreen
            ? '10px'
            : isRTL
            ? (isSmallMobile
                ? '130px'
                : isMobileScreen
                ? '65px'
                : layout === 'layout2' ? '50px' : '235px')
            : isSmallMobile
            ? '85px'
            : isMobileScreen
            ? '65px'
            : layout === 'layout2' ? '50px' : '235px'
        ),
    right: undefined,
    width: layout === 'layout2'
      ? 'calc(100vw - 80px)' // 40px left + 40px right, matches categories bar
      : isSmallMobile
        ? 'calc(100vw - 90px - 20px)' 
        : isMobileScreen
        ? 'calc(100vw - 65px - 20px)'
        : 'calc(100vw - 195px - 40px - 150px)',
    maxWidth: layout === 'layout2'
      ? '1000px'
      : isSmallMobile
        ? undefined
        : isMobileScreen
        ? undefined
        : '1200px',
    display: 'flex',
    justifyContent: layout === 'layout2' ? 'flex-start' : 'flex-start',
    alignItems: 'center',
    zIndex: 15,
    pointerEvents: 'auto',
    opacity: hideSearchBar ? 0 : 1,
    transition: 'opacity 0.3s ease'
  };

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
        // Use selected language with fallback to English
        const categoryName = cat.name[language] || cat.name.en || "";
        acc[cat.categoryRef] = categoryName;
        // Save image (may be undefined)
        categoryImagesMap[categoryName] = cat.image || "";
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
            // Use selected language with fallback to English
            name: product.name[language] || product.name.en || '',
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

  // Fetch data on component mount and when language changes
  useEffect(() => {
    fetchMenuData();
  }, [language]); // Add language as dependency

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
    
    // Add auto-scrolling behavior
    setTimeout(() => {
      const productsGrid = document.querySelector('.products-grid');
      if (productsGrid) {
        productsGrid.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 50); // Small delay to ensure state update completes
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

    // Search through all products with language awareness
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

  // Apply Red Hat Display font to the entire app using useEffect
  useEffect(() => {
    // Add Google Fonts link if it doesn't exist yet
    if (!document.getElementById('red-hat-display-font')) {
      const link = document.createElement('link');
      link.id = 'red-hat-display-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }

    // Create a style element for applying the font globally
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: 'Red Hat Display', sans-serif !important;
      }
    `;
    
    // Append the style to the head
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []); // Run once on mount

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`app${theme === 'dark' ? ' dark-theme' : ''}`}
      style={theme === 'dark' ? { background: '#111215', fontFamily: "'Red Hat Display', sans-serif" } : { fontFamily: "'Red Hat Display', sans-serif" }}
    >
      {/* ← modify header-bar to start at very top of screen */}
      <div className="header-bar" style={{ 
        zIndex: 10, 
        top: 0,
        height: layout === 'layout2' ? '180px' : '130px' // Increased height for layout2
      }} />

      {/* White/Black background image at top left */}
      <img
        src={theme === 'dark' ? blackBg : whiteBg}
        alt={theme === 'dark' ? "black background" : "white background"}
        style={whiteBgStyle}
      />
      {/* Settings icon at top right */}
      <img
        src={settingsIcon}
        alt="settings"
        style={settingsIconStyle}
        onClick={() => setShowSettings(true)}
      />
      <header className="navbar navbar-nobox" style={navbarStyle}>
        <h1 className="logo">{companyName || "RESTAURANT"}</h1>
      </header>

      {/* Search Bar with Inline Results - Force display on mobile */}
      <div style={{
        ...searchBarContainerStyle,
        display: isMobileScreen ? 'flex' : (hideSearchBar ? 'none' : 'flex') 
      }}>
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
              width: isSmallMobile ? 18 : 22,
              height: isSmallMobile ? 18 : 22,
              position: 'absolute',
              left: isRTL ? undefined : 16,
              right: isRTL ? 16 : undefined,
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
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              width: isSmallMobile ? '100%' : '100%',
              maxWidth: isSmallMobile ? '100%' : undefined,
              boxSizing: 'border-box',
              height: isSmallMobile ? 36 : 44,
              borderRadius: 18,
              border: 'none',
              background: '#fff',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              padding: isRTL
                ? `0 44px 0 ${searchQuery ? '36px' : '16px'}`
                : `0 ${searchQuery ? '36px' : '16px'} 0 44px`,
              fontSize: isSmallMobile ? '0.98rem' : '1.08rem',
              outline: 'none',
              color: '#222',
              fontFamily: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: isRTL ? 'right' : 'left'
            }}
          />
          {/* Replace X icon with Cancel text button */}
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              style={{
                position: 'absolute',
                right: isRTL ? undefined : 12,
                left: isRTL ? 12 : undefined,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '0 8px',
                height: isSmallMobile ? 26 : 30,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: isSmallMobile ? '12px' : '13px',
                color: '#666',
                fontFamily: 'inherit'
              }}
            >
              Cancel
            </button>
          )}
          {/* Update search results UI */}
          {searchResults.length > 0 && searchQuery && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: theme === 'dark' ? '#18191C' : 'white',
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
                    // Find the category for this product
                    const foundCategory = Object.keys(apiProducts).find(cat =>
                      apiProducts[cat].some(p => p.name === product.name)
                    );
                    if (foundCategory) {
                      setSelectedCategory(foundCategory);
                      setHighlightedProductName(product.name);
                      
                      // Improved scrolling behavior that works on both mobile and desktop
                      setTimeout(() => {
                        const el = document.querySelector(`[data-product-name="${product.name}"]`);
                        const productsGrid = document.querySelector('.products-grid');
                        
                        if (el && productsGrid) {
                          // For desktop, we need specific scrolling approach
                          if (screenWidth > 600) {
                            // Calculate element's position relative to the grid
                            const gridRect = productsGrid.getBoundingClientRect();
                            const elRect = el.getBoundingClientRect();
                            const relativeTop = elRect.top - gridRect.top;
                            
                            // Scroll the grid to bring element into view
                            productsGrid.scrollTo({
                              top: productsGrid.scrollTop + relativeTop - 150, // Offset for header
                              behavior: 'smooth'
                            });
                          } else {
                            // On mobile, scrollIntoView works well
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }
                      }, 250); // Increased timeout to ensure DOM is updated
                    }
                    setCurrentCategoryProducts([]); // Hide modal if open
                    setProductIndex(0);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom:
                      index !== searchResults.length - 1
                        ? `1px solid ${theme === 'dark' ? '#444444' : '#eee'}` // <-- fix here
                        : 'none',
                    color: theme === 'dark' ? '#fff' : '#222',
                    background: 'transparent',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', color: theme === 'dark' ? '#fff' : '#222' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#bbb' : '#666' }}>
                    {product.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Layout 2 Horizontal Categories Bar */}
      {layout === 'layout2' && (
        <div style={{
          position: 'fixed',
          top: isSmallMobile ? '85px' : isMobileScreen ? '110px' : '140px',
          left: '40px',
          right: '40px',
          display: 'flex',
          overflowX: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          zIndex: 15,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          justifyContent: isRTL ? 'flex-start' : 'flex-end',
        }}>
          <div style={{
            display: 'flex',
            paddingBottom: '10px',
            flexDirection: isRTL ? 'row-reverse' : 'row',
            width: '100%',
          }}>
            {Object.keys(apiProducts).map((category, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(category)}
                style={{
                  padding: '8px 18px',
                  marginRight: isRTL ? 0 : '10px',
                  marginLeft: isRTL ? '10px' : 0,
                  background: selectedCategory === category
                    ? 'transparent' // Remove bg color when selected
                    : (theme === 'dark' ? '#232429' : '#f5f5f5'),
                  borderRadius: '15px',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: selectedCategory === category
                    ? '#ff9800' // Optionally, orange text when selected
                    : (theme === 'dark' ? '#fff' : '#333'),
                  border: 'none',
                  minWidth: 'auto',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: selectedCategory === category
                    ? '4px solid #ff9800' // Orange highlight underline
                    : 'none',
                  transition: 'border-bottom 0.2s, color 0.2s, background 0.2s'
                }}
              >
                {/* Category image for layout 2 */}
                {categoryImages[category] && (
                  <img
                    src={categoryImages[category]}
                    alt={`${category} icon`}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      background: '#fff',
                      border: 'none',
                      boxShadow: 'none',
                      pointerEvents: 'none',
                      marginRight: isRTL ? 0 : '8px',
                      marginLeft: isRTL ? '8px' : 0,
                    }}
                  />
                )}
                <span>{category}</span>
              </div>
            ))}
          </div>
          {/* Add style to hide scrollbars */}
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      {/* Main Content */}
      <div className="main-layout" style={{ 
        marginTop: layout === 'layout2' ? '200px' : '140px',
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        flexDirection: layout === 'layout2' ? 'column' : 'row'
      }}>
        {/* Categories Sidebar - Only show in Layout 1 */}
        {layout === 'layout1' && (
          <div className="categories-sidebar" style={{ 
            paddingTop: screenWidth > 900 ? '5px' : '110px',
            marginTop: screenWidth > 900 ? '-60px' : '-110px',
            paddingBottom: screenWidth > 900 ? '30px' : '0'
          }}>
            {Object.keys(apiProducts).map((category, i) => (
              <div
                key={i}
                className={`category-box ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div className="text-wrapper" style={{ 
                  fontSize: '0.83rem', 
                  fontWeight: 600,
                  left: isRTL ? 'auto' : '8px',
                  right: isRTL ? '8px' : 'auto',
                  textAlign: isRTL ? 'right' : 'left',
                  justifyContent: isRTL ? 'flex-start' : 'flex-start',
                  position: 'absolute',
                  top: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '70%',
                  width: 'auto',
                  display: 'block'
                }}>
                  {category}
                </div>
                {/* Category image at bottom right (or left in RTL), cut 10% outside the box, reduced size */}
                {categoryImages[category] && (
                  <img
                    src={categoryImages[category]}
                    alt={`${category} icon`}
                    style={{
                      position: 'absolute',
                      right: isRTL ? 'auto' : '-10%',
                      left: isRTL ? '-10%' : 'auto',
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
        )}

        {/* Products Grid - Adjust position and width based on layout */}
        {selectedCategory && (
          <div className="products-grid" style={{ 
            background: '#fff',
            paddingTop: '110px',
            marginTop: '-110px',
            width: layout === 'layout2' ? '100%' : undefined, // Full width in layout2
            marginLeft: layout === 'layout2' ? '0' : undefined // No left margin in layout2
          }}>
            {apiProducts[selectedCategory]?.map((product, index) => (
              <div
                key={index}
                className={`product-card`}
                data-product-name={product.name}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderRadius: '15px',
                  minHeight: '180px', // reduced from 200px
                  maxHeight: '210px', // optional: add a maxHeight to keep cards compact
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  background: 'transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  borderBottom: highlightedProductName === product.name
                    ? '4px solid #ff9800'
                    : '1px solid #ddd',
                  animation: highlightedProductName === product.name
                    ? 'blink-border 0.6s 2'
                    : undefined
                }}
                onAnimationEnd={() => {
                  if (highlightedProductName === product.name) setHighlightedProductName(null);
                }}
                onClick={() => setShowDescription(product)}
              >
                {/* Top overlay for dark theme */}
                {theme === 'dark' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: '75%',
                      background: '#232429',
                      zIndex: 0,
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                    }}
                  />
                )}
                {/* Bottom overlay, now covers 75% and is thick grey with rounded top corners */}
                {theme !== 'dark' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: '75%',
                      background: '#f7f6f5',
                      zIndex: 0,
                      borderTopLeftRadius: '15px',
                      borderTopRightRadius: '15px',
                    }}
                  />
                )}
                <img 
                  src={product.image && product.image.trim() ? product.image : placeholderImg}
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
                  onError={e => {
                    if (e.target.src !== placeholderImg) {
                      e.target.src = placeholderImg;
                    }
                  }}
                />
                <div style={{
                  textAlign: 'left',
                  width: '100%',
                  zIndex: 1,
                  position: 'relative',
                  marginTop: '0px',
                  fontFamily: 'inherit'
                }}>
                  <h3
                    style={{
                      color: '#fff',
                      marginBottom: '2px',
                      fontSize: '1rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis',
                      fontFamily: 'inherit'
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    marginBottom: '2px',
                    fontFamily: 'inherit'
                  }}>
                    <div style={{ width: '50%' }}>
                      <p style={{
                        color: '#fff',
                        marginBottom: '8px',
                        fontSize: '0.76rem',
                        overflow: 'visible',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.18,
                        maxWidth: '100%',
                        wordBreak: 'break-all',
                        fontFamily: 'inherit'
                      }}>
                        {product.price}
                      </p>
                      <p style={{
                        color: '#fff',
                        marginBottom: 0,
                        fontSize: '0.76rem',
                        overflow: 'visible',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.18,
                        maxWidth: '100%',
                        wordBreak: 'break-all',
                        fontFamily: 'inherit'
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
                          boxShadow: 'none',
                          fontFamily: 'inherit'
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
                top: '10px', 
                border: 'none',
                background: 'none',
                fontSize: '26px',
                cursor: 'pointer',
                color: '#888', // Added to match settings modal close button color
                fontWeight: 400, // Added to match settings modal close button weight
                padding: '4px', // Added for better touch target
                lineHeight: '20px' // Added to match settings modal close button height
              }}
            >
              ×
            </button>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, textAlign: 'center' }}>{showDescription.name}</h2>
            <hr style={{
              margin: '14px 0 10px 0',
              border: 0,
              borderTop: '1.2px solid #eee'
            }}/>
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

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.18)',
              zIndex: 10000,
              fontFamily: "'Red Hat Display', sans-serif",
            }}
            onClick={() => setShowSettings(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: theme === 'dark' ? '#18191C' : '#fff',
              borderRadius: '22px',
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0,0,0,0.45)'
                : '0 8px 32px rgba(0,0,0,0.13)',
              padding: '28px 28px 24px 28px', // Reduced padding
              minWidth: '280px', // Reduced from 320px
              minHeight: '160px', // Reduced from 180px
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0',
              fontFamily: "'Red Hat Display', sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Settings Heading */}
            <div
              style={{
                fontFamily: "'Red Hat Display', sans-serif",
                fontSize: '1.4rem', // Slightly smaller heading
                fontWeight: 800,
                color: theme === 'dark' ? '#fff' : '#23180d',
                marginBottom: '20px', // Reduced margin
                letterSpacing: '-0.5px',
                width: '100%',
                textAlign: 'center' // center heading
              }}
            >
              Settings
            </div>
            <div style={{
              width: '100%',
              maxWidth: '280px', // Reduced from 320px
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Language Section */}
              <span style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: theme === 'dark' ? '#fff' : '#23180d',
                fontFamily: "'Red Hat Display', sans-serif",
                display: 'block',
                width: '100%',
                textAlign: 'left'
              }}>
                Language
              </span>
              <div
                style={{
                  position: 'relative',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: theme === 'dark' ? '#23242A' : '#e5e5e5',
                  margin: '10px 0 0 0',
                  width: '100%'
                }}
              />
              {/* Language options */}
              <div style={{
                marginTop: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%'
              }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempLanguage('en')}
                >
                  <span>English</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempLanguage === 'en' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempLanguage === 'en' ? '#16c784' : '#fff',
                  }}>
                    {tempLanguage === 'en' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempLanguage('ar')}
                >
                  <span>Arabic</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempLanguage === 'ar' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempLanguage === 'ar' ? '#16c784' : '#fff',
                  }}>
                    {tempLanguage === 'ar' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
              </div>
              {/* Theme Section */}
              <span style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: theme === 'dark' ? '#fff' : '#23180d',
                fontFamily: "'Red Hat Display', sans-serif",
                display: 'block',
                marginTop: 28,
                width: '100%',
                textAlign: 'left'
              }}>
                Theme
              </span>
              <div
                style={{
                  position: 'relative',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: theme === 'dark' ? '#23242A' : '#e5e5e5',
                  margin: '10px 0 0 0',
                  width: '100%'
                }}
              />
              {/* Theme options */}
              <div style={{
                marginTop: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%'
              }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempTheme('light')}
                >
                  <span>Light</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempTheme === 'light' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempTheme === 'light' ? '#16c784' : '#fff',
                    cursor: 'pointer'
                  }}>
                    {tempTheme === 'light' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempTheme('dark')}
                >
                  <span>Dark</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempTheme === 'dark' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempTheme === 'dark' ? '#16c784' : '#fff',
                    cursor: 'pointer'
                  }}>
                    {tempTheme === 'dark' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
              </div>
              {/* Layout Section - Add this new section */}
              <span style={{
                fontWeight: 700,
                fontSize: '1.08rem',
                color: theme === 'dark' ? '#fff' : '#23180d',
                fontFamily: "'Red Hat Display', sans-serif",
                display: 'block',
                marginTop: 28,
                width: '100%',
                textAlign: 'left'
              }}>
                Layouts
              </span>
              <div
                style={{
                  position: 'relative',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: theme === 'dark' ? '#23242A' : '#e5e5e5',
                  margin: '10px 0 0 0',
                  width: '100%'
                }}
              />
              {/* Layout options */}
              <div style={{
                marginTop: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%'
              }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempLayout('layout1')}
                >
                  <span>Layout 1</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempLayout === 'layout1' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempLayout === 'layout1' ? '#16c784' : '#fff',
                    cursor: 'pointer'
                  }}>
                    {tempLayout === 'layout1' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Red Hat Display', sans-serif",
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme === 'dark' ? '#fff' : '#23180d',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onClick={() => setTempLayout('layout2')}
                >
                  <span>Layout 2</span>
                  <span style={{
                    marginLeft: 12,
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    border: tempLayout === 'layout2' ? '2px solid #16c784' : '2px solid #bbb',
                    background: tempLayout === 'layout2' ? '#16c784' : '#fff',
                    cursor: 'pointer'
                  }}>
                    {tempLayout === 'layout2' && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="6" fill="#fff"/>
                      </svg>
                    )}
                  </span>
                </div>
              </div>
            </div>
            {/* Save button - Update to include layout */}
            <button
              onClick={() => {
                setTheme(tempTheme);
                setLanguage(tempLanguage);
                setLayout(tempLayout);
                localStorage.setItem('theme', tempTheme);
                localStorage.setItem('language', tempLanguage);
                localStorage.setItem('layout', tempLayout);
                setShowSettings(false);
              }}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                background: '#16c784',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Red Hat Display', sans-serif"
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 22,
                background: 'none',
                border: 'none',
                fontSize: '32px', // Increased from 24px
                cursor: 'pointer',
                color: '#888',
                fontWeight: 400,
                padding: '8px', // Added padding for larger touch target
                lineHeight: '24px' // Added to improve vertical alignment
              }}
              aria-label="Close"
            >×</button>
          </div>
        </>
      )}

      {/* Menu dropdown */}
      {menuOpen && (
        <div className="menu-dropdown" ref={menuRef}>
          <div className="menu-header">
            <button className="menu-close" onClick={() => setMenuOpen(false)}>
              ×
            </button>
            <div className="menu-title">{companyName || "RESTAURANT"}</div>
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

      {/* Add keyframes for blinking border */}
      <style>
        {`
          @keyframes blink-border {
            0%   { border-bottom: 4px solid #ff9800; }
            25%  { border-bottom: 1px solid #ddd; }
            50%  { border-bottom: 4px solid #ff9800; }
            100% { border-bottom: 1px solid #ddd; }
          }
        `}
      </style>
    </div>
  );
}

export default App;