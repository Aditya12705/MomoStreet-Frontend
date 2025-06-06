export default function SkeletonMenu() {
  // Generate random widths for skeleton text
  const getRandomWidth = () => Math.floor(Math.random() * 30 + 70) + '%';

  return (
    <div className="menu-app dark-bg">
      <header className="main-header">
        <h1>MOMO STREET</h1>
        <button className="cart-btn" disabled>Cart</button>
      </header>
      <nav className="subcat-nav">
        <div className="nav-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="nav-link skeleton-text" style={{ width: getRandomWidth() }}></div>
          ))}
        </div>
      </nav>
      <div className="filter-bar">
        <button className="filter-btn veg" disabled>Veg Only</button>
        <button className="filter-btn non-veg" disabled>Non-Veg Only</button>
        <button className="filter-btn all" disabled>Show All</button>
      </div>
      <main>
        <h2 className="menu-title">Menu</h2>
        <div className="menu-groups">
          {[1, 2].map(groupIndex => (
            <div key={groupIndex} className="menu-group">
              <div className="menu-group-title skeleton-text" style={{ width: getRandomWidth() }}></div>
              <ul className="menu-list">
                {[1, 2, 3, 4].map(itemIndex => (
                  <li key={itemIndex} className="menu-item modern-card">
                    <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      <div className="skeleton-image"></div>
                      <div className="item-info">
                        <span className="item-name">
                          <span className="skeleton-text" style={{ width: getRandomWidth() }}></span>
                        </span>
                        <span className="item-extras skeleton-text" style={{ width: getRandomWidth() }}></span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <span className="price skeleton-text" style={{ width: '4em' }}></span>
                      <button className="add-btn" disabled>Add</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
