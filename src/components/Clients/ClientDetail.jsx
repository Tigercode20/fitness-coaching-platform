import React from 'react';

const ClientDetail = () => {
    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Client Detail</h2>
            <div className="bg-white p-6 rounded shadow">
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Email:</strong> john@example.com</p>
                <p><strong>Plan:</strong> Gold Membership</p>
            </div>
        </div>
    );
};

export default ClientDetail;
