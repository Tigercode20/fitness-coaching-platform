import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="text-center p-10">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <p className="text-xl mb-4">Page not found</p>
            <Link to="/" className="text-blue-500 hover:underline">Go Home</Link>
        </div>
    );
};

export default NotFound;
