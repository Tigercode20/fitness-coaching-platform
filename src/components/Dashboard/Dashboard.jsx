import React from 'react';

const DashboardComponent = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">
                <h3>Total Clients</h3>
                <p className="text-2xl font-bold">150</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3>Active Plans</h3>
                <p className="text-2xl font-bold">120</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3>Revenue</h3>
                <p className="text-2xl font-bold">$5,000</p>
            </div>
        </div>
    );
};

export default DashboardComponent;
