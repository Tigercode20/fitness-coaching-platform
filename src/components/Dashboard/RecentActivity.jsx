import { FaUser, FaCreditCard } from 'react-icons/fa'

export default function RecentActivity({ title, data, type }) {
    return (
        <div className="card h-full">
            <h3 className="text-xl font-semibold text-dark mb-4">
                {title}
            </h3>
            <div className="space-y-3">
                {data && data.length > 0 ? (
                    data.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                {type === 'client' ? <FaUser /> : <FaCreditCard />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">
                                    {type === 'client' ? (item.FullName || item.fullName) : (item.ClientName || item.clientName)}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    {type === 'client'
                                        ? (item.ClientCode || item.clientCode ? `Code: ${item.ClientCode || item.clientCode}` : (item.PhoneNumber || item.phoneNumber))
                                        : `${item.Package || item.package || 'Gold'} • ${item.SubscriptionType || item.subscriptionType || 'New'}`
                                    }
                                </p>
                            </div>
                            {type === 'subscription' && (
                                <div className="text-sm font-bold text-teal-600">
                                    {item.PaymentAmount || item.amountPaid} EGP
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center py-8">
                        لا توجد بيانات بعد
                    </p>
                )}
            </div>
        </div>
    )
}
