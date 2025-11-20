import React from "react";

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      <button
        className={`tab-button ${activeTab === "main" ? "active" : ""}`}
        onClick={() => onTabChange("main")}
        type="button"
      >
        Main
      </button>
      <button
        className={`tab-button ${activeTab === "config" ? "active" : ""}`}
        onClick={() => onTabChange("config")}
        type="button"
      >
        Config
      </button>
    </div>
  );
};

export default TabNavigation;
