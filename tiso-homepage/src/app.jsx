import { useState, useRef, useEffect } from 'react';
import './App.css';

// Navbar images
import strikeImg from './assets/strike.jpeg';
import searchImg from './assets/search.jpeg';

// Food Gallery images (example)
import pizzaImg from './assets/pizza.jpeg';
import sandwichImg from './assets/sandwich.jpeg';
import onigiriImg from './assets/onigiri.jpeg';
import burgerImg from './assets/burger.jpeg';
import fishImg from './assets/fish.jpeg';
import noodlesImg from './assets/noodles.jpeg';
import ricebowlImg from './assets/ricebowl.jpeg';
import saladImg from './assets/salad.jpeg';
import shawarmaImg from './assets/shawarma.jpeg';

// --- Products mapping for AR products ---
const productsByCategory = {
  PIZZA: [
    {
      name: "Pizza",
      image: pizzaImg,
      description: "Delicious pizza with fresh toppings. Enjoy our signature crust loaded with cheese and pepperoni.",
      price: "$12",
      calories: "300 kcal",
      modelUrl: "/assets/pizza.glb",
    },
  ],
  DESSERTS: [
    {
      name: "The Cake Is A Lie",
      image: "/assets/the_cake_is_a_lie.glb",
      description: "A mysterious dessert that defies expectations.",
      price: "$8",
      calories: "250 kcal",
      modelUrl: "/assets/the_cake_is_a_lie.glb",
    },
    {
      name: "Ice Cream",
      image: "/assets/ice_cream_lp.glb",
      description: "Cool and refreshing ice cream treat.",
      price: "$5",
      calories: "200 kcal",
      modelUrl: "/assets/ice_cream_lp.glb",
    },
    {
      name: "Candy",
      image: "/assets/candy.glb",
      description: "Sweet and delightful candy treat.",
      price: "$3",
      calories: "150 kcal",
      modelUrl: "/assets/candy.glb",
    },
  ],
  BURGERS: [
    {
      name: "Burger Lowpoly",
      image: "/assets/burger_lowpoly.glb",
      description: "Stylized low poly burger for a modern look.",
      price: "$10",
      calories: "400 kcal",
      modelUrl: "/assets/burger_lowpoly.glb",
    },
    {
      name: "Hamburger 3D",
      image: "/assets/hamburger_3d_scan.glb",
      description: "Realistic 3D scanned hamburger experience.",
      price: "$11",
      calories: "420 kcal",
      modelUrl: "/assets/hamburger_3d_scan.glb",
    },
  ],
  SALADS: [
    {
      name: "Fruit Muzli",
      image: "/assets/fruit_muzli.glb",
      description: "A refreshing and colorful fruit salad.",
      price: "$7",
      calories: "180 kcal",
      modelUrl: "/assets/fruit_muzli.glb",
    },
    {
      name: "Breakfast Food Dish",
      image: "/assets/breakfast_food_dish.glb",
      description: "Hearty and healthy breakfast salad dish.",
      price: "$9",
      calories: "220 kcal",
      modelUrl: "/assets/breakfast_food_dish.glb",
    },
  ],
};

function App() {
  // Navbar and dropdown states
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States for product details and AR view
  const [currentCategoryProducts, setCurrentCategoryProducts] = useState([]);
  const [productIndex, setProductIndex] = useState(0);
  const [showAR, setShowAR] = useState(false);

  // Refs for detecting outside clicks
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  // Food categories (order as desired)
  const foodCategories = [
    "PIZZA",
    "BURGERS",
    "SANDWICHES",
    "NOODLES",
    "RICE BOWLS",
    "SALADS",
    "FISH",
    "DESSERTS",
    "DRINKS",
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (menuOpen) setMenuOpen(false);
    if (!searchOpen) {
      setTimeout(() => {
        const input = document.querySelector(".search-input");
        if (input) input.focus();
      }, 100);
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    if (searchOpen) setSearchOpen(false);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleMenuClose = () => setMenuOpen(false);

  // When a category is clicked, show the product details (with arrow navigation)
  const handleCategoryClick = (category) => {
    const items = productsByCategory[category];
    if (items && items.length > 0) {
      setCurrentCategoryProducts(items);
      setProductIndex(0);
    } else {
      setCurrentCategoryProducts([]);
      setProductIndex(0);
    }
    setMenuOpen(false);
  };

  const handleNextProduct = () => {
    if (currentCategoryProducts.length < 2) return;
    setProductIndex((prev) => (prev + 1) % currentCategoryProducts.length);
  };

  const handlePrevProduct = () => {
    if (currentCategoryProducts.length < 2) return;
    setProductIndex(
      (prev) => (prev - 1 + currentCategoryProducts.length) % currentCategoryProducts.length
    );
  };

  const selectedProduct =
    currentCategoryProducts.length > 0 ? currentCategoryProducts[productIndex] : null;

  return (
    <div className="app">
      {/* Navbar */}
      <header
        className={`navbar ${menuOpen ? "menu-active" : ""} ${
          searchOpen ? "search-active" : ""
        }`}
      >
        <img
          src={strikeImg}
          alt="Menu"
          className="icon menu-icon"
          onClick={toggleMenu}
        />
        <h1 className="logo">TISO MEALS</h1>
        <img
          src={searchImg}
          alt="Search"
          className="icon search-icon"
          onClick={toggleSearch}
        />
      </header>

      {/* Blur Overlay */}
      {(menuOpen || searchOpen || selectedProduct) && (
        <div
          className="blur-overlay"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
        />
      )}

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="menu-dropdown" ref={menuRef}>
          <div className="menu-header">
            <button className="menu-close" onClick={handleMenuClose}>
              ×
            </button>
            <div className="menu-title">TISO MEALS</div>
            <div className="menu-search-icon">
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
          </div>
          <div className="menu-categories">
            {foodCategories.map((category, index) => (
              <div
                key={index}
                className="menu-category"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="search-dropdown" ref={searchRef}>
          <div className="search-header">
            <div
              className="search-hamburger"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen(true);
              }}
            >
              ≡
            </div>
            <div className="search-title">SEARCH</div>
            <button className="search-close" onClick={handleSearchClose}>
              ×
            </button>
          </div>
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Product Details Modal with Arrow Navigation */}
      {selectedProduct && (
        <div className="product-details">
          <button className="close-product" onClick={() => setCurrentCategoryProducts([])}>
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

          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="product-image"
          />
          <div className="product-info">
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <p>Price: {selectedProduct.price}</p>
            <p>Calories: {selectedProduct.calories}</p>
            <button className="ar-button" onClick={() => setShowAR(true)}>
              VIEW IN AR
            </button>
          </div>
        </div>
      )}

      {/* AR Modal */}
      {showAR && selectedProduct && (
        <div className="ar-modal">
          <button className="close-ar" onClick={() => setShowAR(false)}>
            ×
          </button>
          {/*
            IMPORTANT: Include the model-viewer library in your index.html.
            Example:
            <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
          */}
          <model-viewer
            src={selectedProduct.modelUrl}
            alt={`${selectedProduct.name} AR Model`}
            ar
            ar-modes="scene-viewer webxr quick-look"
            camera-controls
            auto-rotate
            style={{ width: "100%", height: "100%" }}
          ></model-viewer>
        </div>
      )}

      {/* Food Gallery (Background Animation) */}
      <div className="food-gallery">
        <img src={pizzaImg} alt="Pizza" className="food food1" />
        <img src={sandwichImg} alt="Sandwich" className="food food2" />
        <img src={onigiriImg} alt="Onigiri" className="food food3" />
        <img src={burgerImg} alt="Burger" className="food food4" />
        <img src={fishImg} alt="Fish" className="food food5" />
        <img src={noodlesImg} alt="Noodles" className="food food6" />
        <img src={ricebowlImg} alt="Rice Bowl" className="food food7" />
        <img src={saladImg} alt="Salad" className="food food8" />
        <img src={shawarmaImg} alt="Shawarma" className="food food9" />
      </div>
    </div>
  );
}

export default App;
