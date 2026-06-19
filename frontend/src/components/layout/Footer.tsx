export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-black tracking-tighter mb-4">MIA.</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium accessories for the modern aesthetic. Handcrafted with precision and passion.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/shop" className="hover:text-white transition-colors">All Products</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Rings</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Necklaces</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Bracelets</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Customer Care</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Stay Updated</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-transparent border border-gray-600 px-4 py-2 text-sm w-full focus:outline-none focus:border-white transition-colors"
            />
            <button className="bg-white text-primary px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MIA Accessories Shop. All rights reserved.</p>
      </div>
    </footer>
  );
}
