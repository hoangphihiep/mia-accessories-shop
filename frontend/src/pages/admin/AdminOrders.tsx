import { useState } from 'react';
import { Search, Filter, MoreVertical, Check, X } from 'lucide-react';

const MOCK_ORDERS = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', phone: '0901234567', total: '450,000đ', status: 'PENDING', date: '2026-06-19', items: 1 },
  { id: 'ORD-002', customer: 'Trần Thị B', phone: '0987654321', total: '1,200,000đ', status: 'COMPLETED', date: '2026-06-18', items: 3 },
  { id: 'ORD-003', customer: 'Lê Văn C', phone: '0912345678', total: '320,000đ', status: 'SHIPPING', date: '2026-06-18', items: 1 },
  { id: 'ORD-004', customer: 'Phạm Thị D', phone: '0945678123', total: '850,000đ', status: 'CANCELLED', date: '2026-06-17', items: 2 },
];

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

  const filteredOrders = activeTab === 'All' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.status === activeTab);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-black uppercase tracking-widest text-xl mb-6">Order Management</h2>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex space-x-2 border-b border-gray-200 w-full md:w-auto">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-primary transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
              <th className="p-4 font-bold border-b">Order ID</th>
              <th className="p-4 font-bold border-b">Date</th>
              <th className="p-4 font-bold border-b">Customer Info</th>
              <th className="p-4 font-bold border-b">Items</th>
              <th className="p-4 font-bold border-b">Total Amount</th>
              <th className="p-4 font-bold border-b">Status</th>
              <th className="p-4 font-bold border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">{order.id}</td>
                <td className="p-4 text-gray-500">{order.date}</td>
                <td className="p-4">
                  <div className="font-bold">{order.customer}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="p-4 text-gray-500">{order.items} items</td>
                <td className="p-4 font-bold">{order.total}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors" title="Approve">
                        <Check size={16} />
                      </button>
                      <button className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors" title="Cancel">
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No orders found matching the criteria.
          </div>
        )}
      </div>
    </div>
  );
}
