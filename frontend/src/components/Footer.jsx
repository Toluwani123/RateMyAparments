import React, { useState } from 'react';
import { publicApi } from '../api';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [scraping, setScraping] = useState(false);

  const runScraper = () => {
    setScraping(true);
    publicApi.post('/scrape-now/')
      .then(() => alert('Scraper triggered!'))
      .catch(() => alert('Trigger failed.'))
      .finally(() => setScraping(false));
  };

  return (
    <footer className="bg-white mt-20 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Scraper Trigger Button */}
        <div className="mb-4 text-right">
          <button
            onClick={runScraper}
            disabled={scraping}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {scraping ? 'Running…' : 'Trigger Scraper'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-gray-800">
              RateMyApartments
            </h3>
            <p className="text-gray-600 mt-1">
              © 2025 RateMyApartments. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-facebook-f" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-twitter" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-instagram" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between">
          <div className="flex flex-col md:flex-row md:space-x-8 mb-4 md:mb-0">
            <Link to="/about" className="text-gray-600 hover:text-gray-900 mb-2 md:mb-0">
              About Us
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 mb-2 md:mb-0">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900 mb-2 md:mb-0">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
          <div>
            <p className="text-gray-600">Last updated: July 1, 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
