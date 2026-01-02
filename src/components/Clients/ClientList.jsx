import React from 'react';

const ClientList = () => {
    return (
        <div className="bg-white rounded shadow text-left">
            <h3 className="p-4 font-bold border-b">Client List</h3>
            <ul>
                <li className="p-4 border-b hover:bg-gray-50">Client A</li>
                <li className="p-4 border-b hover:bg-gray-50">Client B</li>
                <li className="p-4 hover:bg-gray-50">Client C</li>
            </ul>
        </div>
    );
};

export default ClientList;
